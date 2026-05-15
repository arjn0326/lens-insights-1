"""
Parse ACT and LEAP master score workbooks into public/data JSON keyed by lens name_slug.

Matching: strip " Parish" from Excel Name, apply aliases, match lens.json "name" field.
State row: Code == "LA" (not matched to a parish).
"""

import json
import math
from pathlib import Path

import pandas as pd

HERE = Path(__file__).parent
RAW = HERE / "raw"
LENS_JSON = HERE.parent / "public" / "data" / "lens.json"
OUT_ACT = HERE.parent / "public" / "data" / "act_scores.json"
OUT_LEAP = HERE.parent / "public" / "data" / "leap_scores.json"

SHEET = "Wide (one row per parish)"
YEARS = ["2021", "2022", "2023", "2024", "2025"]

# Excel spellings that differ from lens.json "name"
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


def year_cols(prefix: str) -> dict[str, str]:
    return {y: f"{prefix}_{y}" for y in YEARS}


def parse_act(name_to_slug: dict[str, str]) -> dict:
    df = pd.read_excel(RAW / "ACT_Master_Scores.xlsx", sheet_name=SHEET)
    score_cols = year_cols("Score")
    by_slug: dict[str, dict] = {}
    state: dict | None = None
    unmatched: list[str] = []

    for _, row in df.iterrows():
        code = str(row["Code"]).strip().upper()
        if code == "LA":
            state = {
                "code": "LA",
                "name": "Louisiana Statewide",
                "scores": {y: clean_num(row[score_cols[y]]) for y in YEARS},
                "overallAvg": clean_num(row.get("Overall_Avg_Score")),
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
            "code": str(row["Code"]).strip(),
            "name": lens_name,
            "scores": {y: clean_num(row[score_cols[y]]) for y in YEARS},
            "overallAvg": clean_num(row.get("Overall_Avg_Score")),
        }

    if state is None:
        raise ValueError("ACT: missing LA state row")

    return {"state": state, "bySlug": by_slug, "unmatched": unmatched}


def parse_leap(name_to_slug: dict[str, str]) -> dict:
    df = pd.read_excel(RAW / "LEAP_Master_Scores.xlsx", sheet_name=SHEET)
    p38 = year_cols("Proficiency_3_8")
    p312 = year_cols("Proficiency_3_12")
    by_slug: dict[str, dict] = {}
    state: dict | None = None
    unmatched: list[str] = []

    for _, row in df.iterrows():
        code = str(row["Code"]).strip().upper()
        if code == "LA":
            state = {
                "code": "LA",
                "name": "Louisiana Statewide",
                "proficiency38": {y: clean_num(row[p38[y]]) for y in YEARS},
                "proficiency312": {y: clean_num(row[p312[y]]) for y in YEARS},
                "proficiency38Avg": clean_num(row.get("Proficiency_3_8_Avg")),
                "proficiency312Avg": clean_num(row.get("Proficiency_3_12_Avg")),
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
            "code": str(row["Code"]).strip(),
            "name": lens_name,
            "proficiency38": {y: clean_num(row[p38[y]]) for y in YEARS},
            "proficiency312": {y: clean_num(row[p312[y]]) for y in YEARS},
            "proficiency38Avg": clean_num(row.get("Proficiency_3_8_Avg")),
            "proficiency312Avg": clean_num(row.get("Proficiency_3_12_Avg")),
        }

    if state is None:
        raise ValueError("LEAP: missing LA state row")

    return {"state": state, "bySlug": by_slug, "unmatched": unmatched}


def main() -> None:
    name_to_slug = load_name_to_slug()
    act = parse_act(name_to_slug)
    leap = parse_leap(name_to_slug)

    lens_slugs = set(name_to_slug.values())
    missing_in_data = sorted(lens_slugs - set(act["bySlug"].keys()))

    OUT_ACT.write_text(json.dumps({"state": act["state"], "bySlug": act["bySlug"]}, indent=2), encoding="utf-8")
    OUT_LEAP.write_text(json.dumps({"state": leap["state"], "bySlug": leap["bySlug"]}, indent=2), encoding="utf-8")

    print(f"Wrote {OUT_ACT} ({len(act['bySlug'])} parishes)")
    print(f"Wrote {OUT_LEAP} ({len(leap['bySlug'])} parishes)")
    if act["unmatched"]:
        print("ACT unmatched Excel names:", act["unmatched"])
    if leap["unmatched"]:
        print("LEAP unmatched Excel names:", leap["unmatched"])
    if missing_in_data:
        print("Parishes in lens.json with no Excel row:", missing_in_data)


if __name__ == "__main__":
    main()
