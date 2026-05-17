"""
Parse data-pipeline/raw/mfp_weighted_funding.csv → public/data/mfp_by_parish.json

CSV layout (0-based indices):
  Row 0-2: headers
  Row 3+: data
  Col 0: row number
  Col 1: school system name
  Col 2: MFP funded membership (total students)
  Col 3-6: ED count, per pupil, allocation, pct
  Col 7-10: CTE units, per unit, allocation, pct
  Col 11-14: SWD count, per pupil, allocation, pct
  Col 15-17: Gifted (optional — empty in current export)
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
RAW = HERE / "raw" / "mfp_weighted_funding.csv"
LENS_JSON = HERE.parent / "public" / "data" / "lens.json"
OUT = HERE.parent / "public" / "data" / "mfp_by_parish.json"

COL_NAME = 1
COL_STUDENTS = 2
COL_ED_COUNT = 3
COL_ED_PER_PUPIL = 4
COL_ED_ALLOC = 5
COL_ED_PCT = 6
COL_CTE_UNITS = 7
COL_CTE_PER_UNIT = 8
COL_CTE_ALLOC = 9
COL_CTE_PCT = 10
COL_SWD_COUNT = 11
COL_SWD_PER_PUPIL = 12
COL_SWD_ALLOC = 13
COL_SWD_PCT = 14
COL_GIFTED_COUNT = 15
COL_GIFTED_PER_PUPIL = 16
COL_GIFTED_ALLOC = 17
COL_GIFTED_PCT = 18  # if a 19th pct column appears in future exports

NAME_ALIASES = {"DeSoto": "De Soto", "LaSalle": "La Salle", "East Baton Rouge Parish*": "East Baton Rouge"}


def parse_int(val: str | None) -> int:
    if not val or not str(val).strip():
        return 0
    s = str(val).strip().replace(",", "")
    try:
        return int(round(float(s)))
    except ValueError:
        return 0


def parse_float(val: str | None) -> float:
    if not val or not str(val).strip():
        return 0.0
    s = str(val).strip().replace("%", "").replace(",", "").replace("$", "")
    try:
        return round(float(s), 2)
    except ValueError:
        return 0.0


def parse_money(val: str | None) -> int:
    if not val or not str(val).strip():
        return 0
    s = re.sub(r"[^\d.\-]", "", str(val).strip())
    if not s:
        return 0
    return int(round(float(s)))


def parish_slug(name: str) -> str:
    base = name.replace("*", "").strip()
    base = re.sub(r"\s+Parish\s*$", "", base, flags=re.I).strip()
    slug = base.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    return slug


def load_name_to_slug() -> dict[str, str]:
    with open(LENS_JSON, encoding="utf-8") as f:
        parishes = json.load(f)["parishes"]
    return {p["name"]: p["name_slug"] for p in parishes}


def resolve_slug(display: str, name_to_slug: dict[str, str]) -> str | None:
    clean = display.replace("*", "").strip()
    if clean in NAME_ALIASES:
        clean = NAME_ALIASES[clean]
    if not clean.endswith("Parish"):
        clean = f"{clean} Parish"
    if clean in name_to_slug:
        return name_to_slug[clean]
    short = re.sub(r"\s+Parish\s*$", "", clean, flags=re.I).strip()
    for name, slug in name_to_slug.items():
        if name.replace(" Parish", "") == short:
            return slug
    return parish_slug(display)


def cell(row: list[str], idx: int) -> str:
    return row[idx].strip() if idx < len(row) else ""


def main() -> None:
    name_to_slug = load_name_to_slug()
    parishes: list[dict] = []

    with open(RAW, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.reader(f))

    for row in rows[3:]:
        name = cell(row, COL_NAME)
        if not name or name == "State Totals":
            continue
        if "Parish" not in name and not name.endswith("Parish*"):
            continue

        slug = resolve_slug(name, name_to_slug)
        if not slug:
            print(f"  skip (no slug): {name}")
            continue

        gifted_count = parse_int(cell(row, COL_GIFTED_COUNT))
        gifted_per_pupil = parse_float(cell(row, COL_GIFTED_PER_PUPIL))
        gifted_alloc = parse_money(cell(row, COL_GIFTED_ALLOC))
        gifted_pct = parse_float(cell(row, COL_GIFTED_PCT))
        if gifted_pct == 0 and len(row) > COL_GIFTED_PCT:
            gifted_pct = parse_float(cell(row, COL_GIFTED_PCT))

        parish_name = re.sub(r"\s*\*\s*$", "", name).strip()
        if not parish_name.endswith("Parish"):
            parish_name = f"{parish_name} Parish"

        parishes.append(
            {
                "parish_name": parish_name,
                "parish_slug": slug,
                "total_students": parse_int(cell(row, COL_STUDENTS)),
                "ed": {
                    "count": parse_int(cell(row, COL_ED_COUNT)),
                    "per_pupil": parse_float(cell(row, COL_ED_PER_PUPIL)),
                    "allocation": parse_money(cell(row, COL_ED_ALLOC)),
                    "pct": parse_float(cell(row, COL_ED_PCT)),
                },
                "cte": {
                    "units": parse_float(cell(row, COL_CTE_UNITS)),
                    "per_unit": parse_float(cell(row, COL_CTE_PER_UNIT)),
                    "allocation": parse_money(cell(row, COL_CTE_ALLOC)),
                    "pct": parse_float(cell(row, COL_CTE_PCT)),
                },
                "swd": {
                    "count": parse_int(cell(row, COL_SWD_COUNT)),
                    "per_pupil": parse_float(cell(row, COL_SWD_PER_PUPIL)),
                    "allocation": parse_money(cell(row, COL_SWD_ALLOC)),
                    "pct": parse_float(cell(row, COL_SWD_PCT)),
                },
                "gifted": {
                    "count": gifted_count,
                    "per_pupil": gifted_per_pupil,
                    "allocation": gifted_alloc,
                    "pct": gifted_pct,
                },
            }
        )

    parishes.sort(key=lambda p: p["parish_name"])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "meta": {
            "fy": "FY2025-26",
            "source": "LDOE FY2025-26 MFP Weighted Student Funding Table",
            "parish_count": len(parishes),
        },
        "parishes": parishes,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
        f.write("\n")

    print(f"Wrote {len(parishes)} parishes -> {OUT}")
    acadia = next((p for p in parishes if p["parish_slug"] == "acadia"), None)
    if acadia:
        print(
            f"Acadia: ED {acadia['ed']['pct']}%, CTE {acadia['cte']['pct']}%, "
            f"SWD {acadia['swd']['pct']}%, Gifted {acadia['gifted']['pct']}%"
        )


if __name__ == "__main__":
    main()
