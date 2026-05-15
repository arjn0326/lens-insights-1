"""
Parse Teacher_Salary_Master.xlsx into public/data/teacher_salary.json.

Matching: strip " Parish" from Excel Name, apply aliases, match lens.json "name" → name_slug.
State row: Code == "STATE" (Long sheet) or Code 0 / "State Totals" (Wide sheet).
"""

import json
import math
from pathlib import Path

import pandas as pd

HERE = Path(__file__).parent
RAW = HERE / "raw"
LENS_JSON = HERE.parent / "public" / "data" / "lens.json"
OUT = HERE.parent / "public" / "data" / "teacher_salary.json"

SOURCE_FILE = "Teacher_Salary_Master.xlsx"
SHEET_WIDE = "Wide (one row per parish)"
SHEET_LONG = "Long (one row per year)"
YEARS = ["2021", "2022", "2023", "2024", "2025"]

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
    if s.lower() in ("state", "state totals"):
        return None
    return EXCEL_NAME_ALIASES.get(s, s)


def clean_salary(val: object) -> int | None:
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return None
    try:
        return int(round(float(val)))
    except (TypeError, ValueError):
        return None


def is_state_row(code: object, name: object) -> bool:
    code_str = str(code).strip().upper()
    if code_str == "STATE":
        return True
    if code_str in ("0", "000", "0.0"):
        name_s = str(name).strip().lower()
        return name_s in ("state", "state totals") or name_s.startswith("state ")
    return False


def parse_teacher_salary(name_to_slug: dict[str, str]) -> dict:
    df = pd.read_excel(RAW / SOURCE_FILE, sheet_name=SHEET_WIDE)
    salary_cols = {y: f"Salary_{y}" for y in YEARS}
    by_slug: dict[str, dict] = {}
    state: dict | None = None
    unmatched: list[str] = []

    for _, row in df.iterrows():
        if is_state_row(row["Code"], row["Name"]):
            state = {
                "code": "STATE",
                "name": "Louisiana Statewide",
                "salaries": {y: clean_salary(row[salary_cols[y]]) for y in YEARS},
                "salaryAvg": clean_salary(row.get("Salary_Avg")),
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
            "salaries": {y: clean_salary(row[salary_cols[y]]) for y in YEARS},
            "salaryAvg": clean_salary(row.get("Salary_Avg")),
        }

    if state is None:
        raise ValueError("Teacher salary: missing state row")

    return {"state": state, "bySlug": by_slug, "unmatched": unmatched}


def main() -> None:
    name_to_slug = load_name_to_slug()
    data = parse_teacher_salary(name_to_slug)

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
