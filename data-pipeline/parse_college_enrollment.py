"""
Parse College_Enrollment_Master.xlsx into public/data/college_enrollment.json.

Matching: strip " Parish" from Excel Name, apply aliases, match lens.json "name" → name_slug.
State row: Code 000 (or 0) / Louisiana Statewide — not matched to a parish.
"""

import json
import math
from pathlib import Path

import pandas as pd

HERE = Path(__file__).parent
RAW = HERE / "raw"
LENS_JSON = HERE.parent / "public" / "data" / "lens.json"
OUT = HERE.parent / "public" / "data" / "college_enrollment.json"

SHEET = "Wide (one row per parish)"
YEARS = ["2020", "2021", "2022", "2023", "2024"]

EXCEL_NAME_ALIASES = {
    "DeSoto": "De Soto",
    "LaSalle": "La Salle",
}


def load_name_to_slug() -> dict[str, str]:
    with open(LENS_JSON, encoding="utf-8") as f:
        parishes = json.load(f)["parishes"]
    return {p["name"]: p["name_slug"] for p in parishes}


def normalize_excel_name(raw: object) -> str | None:
    if raw is None or (isinstance(raw, float) and math.isnan(raw)):
        return None
    s = str(raw).strip().split("\n")[0].strip()
    if s.endswith(" Parish"):
        s = s[: -len(" Parish")].strip()
    return EXCEL_NAME_ALIASES.get(s, s)


def clean_num(val: object) -> float | None:
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return None
    try:
        return round(float(val), 2)
    except (TypeError, ValueError):
        return None


def is_state_row(code: object, name: object) -> bool:
    code_str = str(code).strip().zfill(3)
    if code_str in ("000", "0", "LA"):
        return True
    name_s = str(name).strip().lower()
    return "louisiana statewide" in name_s or name_s == "louisiana state total"


def parse_college_enrollment(name_to_slug: dict[str, str]) -> dict:
    df = pd.read_excel(RAW / "College_Enrollment_Master.xlsx", sheet_name=SHEET)
    pct_cols = {y: f"Pct_College_{y}" for y in YEARS}
    by_slug: dict[str, dict] = {}
    state: dict | None = None
    unmatched: list[str] = []

    for _, row in df.iterrows():
        if is_state_row(row["Code"], row["Name"]):
            state = {
                "code": "000",
                "name": "Louisiana Statewide",
                "rates": {y: clean_num(row[pct_cols[y]]) for y in YEARS},
                "avgRate": clean_num(row.get("Avg_Pct_College")),
            }
            continue

        lens_name = normalize_excel_name(row["Name"])
        if not lens_name:
            continue
        slug = name_to_slug.get(lens_name)
        if not slug:
            unmatched.append(lens_name)
            continue

        by_slug[slug] = {
            "code": str(row["Code"]).strip().zfill(3),
            "name": lens_name,
            "rates": {y: clean_num(row[pct_cols[y]]) for y in YEARS},
            "avgRate": clean_num(row.get("Avg_Pct_College")),
        }

    if state is None:
        raise ValueError("College enrollment: missing state row (Code 000)")

    return {"state": state, "bySlug": by_slug, "unmatched": unmatched}


def main() -> None:
    name_to_slug = load_name_to_slug()
    data = parse_college_enrollment(name_to_slug)

    OUT.write_text(
        json.dumps({"state": data["state"], "bySlug": data["bySlug"]}, indent=2),
        encoding="utf-8",
    )

    lens_slugs = set(name_to_slug.values())
    missing = sorted(lens_slugs - set(data["bySlug"].keys()))

    print(f"Wrote {OUT} ({len(data['bySlug'])} parishes)")
    if data["unmatched"]:
        print("Unmatched Excel names:", data["unmatched"])
    if missing:
        print("Parishes in lens.json with no Excel row:", missing)


if __name__ == "__main__":
    main()
