"""
Parse data-pipeline/raw/funding_by_parish.csv → public/data/funding_by_parish.json
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
RAW = HERE / "raw" / "funding_by_parish.csv"
LENS_JSON = HERE.parent / "public" / "data" / "lens.json"
OUT = HERE.parent / "public" / "data" / "funding_by_parish.json"

NAME_ALIASES = {"DeSoto": "De Soto", "LaSalle": "La Salle"}

CATEGORY_IDS = {
    "Instruction": "instruction",
    "Other Support": "other-support",
    "Student & Instructional Support": "student-support",
    "School Administration": "administration",
    "Transportation": "transportation",
}


def parse_money(val: str | None) -> int | None:
    if val is None:
        return None
    s = str(val).strip()
    if not s or s in ("—", "-"):
        return None
    neg = "(" in s
    s = re.sub(r"[^\d.\-]", "", s.replace("(", "").replace(")", ""))
    if not s:
        return None
    n = int(round(float(s)))
    return -n if neg else n


def parse_pct(val: str | None) -> float | None:
    if val is None:
        return None
    s = str(val).strip().replace("%", "")
    if not s:
        return None
    try:
        return round(float(s), 2)
    except ValueError:
        return None


def load_name_to_slug() -> dict[str, str]:
    with open(LENS_JSON, encoding="utf-8") as f:
        parishes = json.load(f)["parishes"]
    return {p["name"]: p["name_slug"] for p in parishes}


def parish_display_to_slug(name: str, name_to_slug: dict[str, str]) -> str | None:
    base = name.strip()
    if base.upper() == "LOUISIANA STATEWIDE":
        return "louisiana"
    if base.endswith(" Parish"):
        base = base[: -len(" Parish")]
    base = NAME_ALIASES.get(base, base)
    return name_to_slug.get(base)


def main() -> None:
    name_to_slug = load_name_to_slug()
    rows = list(csv.reader(open(RAW, encoding="utf-8-sig", newline="")))

    state_categories: list[dict] = []
    state_sources: list[dict] = []
    parishes_by_slug: dict[str, dict] = {}
    ranks_by_slug: dict[str, int] = {}

    for row in rows:
        if len(row) < 9:
            continue

        # Embedded state breakdown (columns 8–11)
        label = (row[8] or "").strip()
        if label in CATEGORY_IDS and label != "TOTAL":
            state_categories.append(
                {
                    "id": CATEGORY_IDS[label],
                    "name": label,
                    "amount": parse_money(row[9] if len(row) > 9 else None),
                    "pct": parse_pct(row[10] if len(row) > 10 else None),
                    "description": (row[11] if len(row) > 11 else "").strip() or None,
                }
            )
        elif label == "State Sources":
            state_sources.append(
                {
                    "id": "state",
                    "name": label,
                    "amount": parse_money(row[9] if len(row) > 9 else None),
                    "pct": parse_pct(row[10] if len(row) > 10 else None),
                    "notes": (row[11] if len(row) > 11 else "").strip() or None,
                }
            )
        elif label == "Federal Sources":
            state_sources.append(
                {
                    "id": "federal",
                    "name": label,
                    "amount": parse_money(row[9] if len(row) > 9 else None),
                    "pct": parse_pct(row[10] if len(row) > 10 else None),
                    "notes": (row[11] if len(row) > 11 else "").strip() or None,
                }
            )

        c0 = (row[0] or "").strip()

        # Rank table (first block)
        if (c0.endswith("Parish") or c0.upper() == "LOUISIANA STATEWIDE") and len(row) >= 5:
            slug = parish_display_to_slug(c0, name_to_slug)
            if slug and slug != "louisiana":
                rank_raw = (row[4] or "").strip()
                if rank_raw.isdigit():
                    ranks_by_slug[slug] = int(rank_raw)

        # Combined slug block: col1=parish_name, col2=slug
        if len(row) >= 6 and row[2] and row[2] not in ("parish_slug", "parish_name"):
            slug = row[2].strip()
            if slug == "louisiana":
                continue
            if not slug.replace("-", "").isalnum():
                continue
            parishes_by_slug[slug] = {
                "parish_slug": slug,
                "parish_name": row[1].strip(),
                "spend_per_pupil": parse_money(row[3]),
                "vs_state_avg_dollars": parse_money(row[4]),
                "vs_state_avg_pct": parse_pct(row[5]),
                "rank": ranks_by_slug.get(slug),
                "signal": None,
            }

    # Apply ranks
    for slug, rank in ranks_by_slug.items():
        if slug in parishes_by_slug:
            parishes_by_slug[slug]["rank"] = rank

    # Fill missing ranks
    ranked = sorted(
        parishes_by_slug.values(),
        key=lambda p: p.get("spend_per_pupil") or 0,
        reverse=True,
    )
    for i, p in enumerate(ranked, start=1):
        if p.get("rank") is None:
            p["rank"] = i

    state_avg = 15387
    for row in rows:
        if (row[0] or "").strip().upper() == "LOUISIANA STATEWIDE":
            state_avg = parse_money(row[1]) or state_avg
            break

    payload = {
        "meta": {
            "source": "Louisiana Treasurer's Office · LDOE",
            "description": "Per pupil expenditure and statewide spending breakdown",
            "state_avg_per_pupil": state_avg,
            "parish_count": len(parishes_by_slug),
        },
        "state": {
            "spend_per_pupil": state_avg,
            "spending_categories": [c for c in state_categories if c.get("amount")],
            "funding_sources": [s for s in state_sources if s.get("amount")],
        },
        "parishes": sorted(parishes_by_slug.values(), key=lambda p: p.get("rank") or 999),
    }

    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"  parishes: {len(payload['parishes'])}")
    print(f"  categories: {len(payload['state']['spending_categories'])}")
    print(f"  sources: {len(payload['state']['funding_sources'])}")


if __name__ == "__main__":
    main()
