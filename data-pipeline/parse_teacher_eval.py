"""
Parse Teacher_Eval_Clean_v2.xlsx into public/data/teacher_eval.json.

Matching: strip " Parish" from Excel Name, apply aliases, match lens.json "name" → name_slug.
State row: Code == "STATE" — not matched to a parish.
"""

import json
import math
from pathlib import Path

import pandas as pd

HERE = Path(__file__).parent
RAW = HERE / "raw"
LENS_JSON = HERE.parent / "public" / "data" / "lens.json"
OUT = HERE.parent / "public" / "data" / "teacher_eval.json"

SHEET = "Parish Data"
SOURCE_FILE = "Teacher_Eval_Clean_v2.xlsx"
YEARS = ["2021", "2022", "2023", "2024"]

EXCEL_NAME_ALIASES = {
    "DeSoto": "De Soto",
    "LaSalle": "La Salle",
}

TIERS = ("HighlyEffective", "Proficient", "Emerging")


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


def is_state_row(code: object) -> bool:
    return str(code).strip().upper() == "STATE"


def tier_year_cols(tier: str) -> dict[str, str]:
    return {y: f"{tier}_{y}" for y in YEARS}


def build_tier_record(row: pd.Series, tier: str) -> dict:
    cols = tier_year_cols(tier)
    camel = {
        "HighlyEffective": "highlyEffective",
        "Proficient": "proficient",
        "Emerging": "emerging",
    }[tier]
    return {
        camel: {y: clean_num(row[cols[y]]) for y in YEARS},
        f"{camel}Avg": clean_num(row.get(f"{tier}_Avg")),
    }


def parse_teacher_eval(name_to_slug: dict[str, str]) -> dict:
    df = pd.read_excel(RAW / SOURCE_FILE, sheet_name=SHEET)
    by_slug: dict[str, dict] = {}
    state: dict | None = None
    unmatched: list[str] = []

    for _, row in df.iterrows():
        if is_state_row(row["Code"]):
            state = {
                "code": "STATE",
                "name": "Louisiana Statewide",
            }
            for tier in TIERS:
                state.update(build_tier_record(row, tier))
            continue

        lens_name = normalize_excel_name(row["Name"])
        if not lens_name:
            continue
        slug = name_to_slug.get(lens_name)
        if not slug:
            unmatched.append(lens_name)
            continue

        record: dict = {
            "code": str(row["Code"]).strip().zfill(3),
            "name": lens_name,
        }
        for tier in TIERS:
            record.update(build_tier_record(row, tier))
        by_slug[slug] = record

    if state is None:
        raise ValueError("Teacher eval: missing STATE row")

    return {"state": state, "bySlug": by_slug, "unmatched": unmatched}


def main() -> None:
    name_to_slug = load_name_to_slug()
    data = parse_teacher_eval(name_to_slug)

    OUT.write_text(
        json.dumps({"state": data["state"], "bySlug": data["bySlug"]}, indent=2),
        encoding="utf-8",
    )

    missing = sorted(set(name_to_slug.values()) - set(data["bySlug"].keys()))
    print(f"Wrote {OUT} ({len(data['bySlug'])} parishes) from {SOURCE_FILE}")
    if data["unmatched"]:
        print("Unmatched Excel names:", data["unmatched"])
    if missing:
        print("Parishes in lens.json with no Excel row:", missing)


if __name__ == "__main__":
    main()
