"""
parse_enrollment.py
-------------------
Reads feb-2026-multi-stats-_total-by-site-and-school-system_-web.xlsx
Extracts parish-level enrollment data for parishes 001-064 only.

Outputs:
  public/data/enrollment_by_parish.json  — feeds the React dashboard
  public/data/enrollment_by_parish.csv   — human-readable backup

Usage (from inside /data-pipeline/):
    uv run python parse_enrollment.py
    -- or --
    python parse_enrollment.py

Place the source xlsx in /data-pipeline/raw/ before running.
"""

import json
import csv
import re
from pathlib import Path

try:
    import openpyxl
except ImportError:
    raise SystemExit("openpyxl not found. Run: pip install openpyxl")

PIPELINE_DIR = Path(__file__).parent
RAW_DIR      = PIPELINE_DIR / "raw"
OUT_DIR      = PIPELINE_DIR.parent / "public" / "data"
SRC_XLSX     = RAW_DIR / "feb-2026-multi-stats-_total-by-site-and-school-system_-web.xlsx"

COL_CODE=0; COL_NAME=1; COL_SITES=2; COL_TOTAL=3
COL_PCT_F=4; COL_PCT_M=5
COL_AM_INDIAN=6; COL_ASIAN=7; COL_BLACK=8; COL_HISPANIC=9
COL_HAWAIIAN=10; COL_WHITE=11; COL_MULTI=12
COL_PCT_ENG=14; COL_PCT_LEP=15
COL_K=19; COL_G1=20; COL_G2=21; COL_G3=22; COL_G4=23; COL_G5=24
COL_G6=25; COL_G7=26; COL_G8=27; COL_G9=28
COL_G10=30; COL_G11=31; COL_G12=32
COL_ECO_DIS=34

def safe_int(val):
    if val is None: return 0
    try: return int(str(val).replace(",","").strip())
    except: return 0

def safe_pct(val):
    if val is None: return None
    try: return round(float(str(val).replace("%","").strip()), 1)
    except: return None

def parish_slug(name):
    slug = name.lower().replace(" parish","").strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    return slug

print(f"Reading {SRC_XLSX.name} ...")
wb = openpyxl.load_workbook(str(SRC_XLSX), read_only=True)
ws = wb["Total by School System"]

parishes = []
state_row = None

for row in ws.iter_rows(values_only=True):
    code = str(row[COL_CODE]).strip() if row[COL_CODE] else ""
    if code == "000":
        state_row = row; continue
    if not re.match(r"^0[0-6][0-9]$", code): continue
    num = int(code)
    if num < 1 or num > 64: continue

    name  = str(row[COL_NAME]).strip() if row[COL_NAME] else ""
    total = safe_int(row[COL_TOTAL])
    if total == 0: continue

    pct_f = safe_pct(row[COL_PCT_F])
    pct_m = safe_pct(row[COL_PCT_M])
    schools = safe_int(row[COL_SITES])

    race = {
        "american_indian":  safe_int(row[COL_AM_INDIAN]),
        "asian":            safe_int(row[COL_ASIAN]),
        "black":            safe_int(row[COL_BLACK]),
        "hispanic":         safe_int(row[COL_HISPANIC]),
        "hawaiian_pacific": safe_int(row[COL_HAWAIIAN]),
        "white":            safe_int(row[COL_WHITE]),
        "multiple_races":   safe_int(row[COL_MULTI]),
    }
    race_pct = {k: round(v/total*100,1) if total>0 else 0 for k,v in race.items()}

    grades = {
        "kindergarten": safe_int(row[COL_K]),
        "grade_1":  safe_int(row[COL_G1]),  "grade_2":  safe_int(row[COL_G2]),
        "grade_3":  safe_int(row[COL_G3]),  "grade_4":  safe_int(row[COL_G4]),
        "grade_5":  safe_int(row[COL_G5]),  "grade_6":  safe_int(row[COL_G6]),
        "grade_7":  safe_int(row[COL_G7]),  "grade_8":  safe_int(row[COL_G8]),
        "grade_9":  safe_int(row[COL_G9]),  "grade_10": safe_int(row[COL_G10]),
        "grade_11": safe_int(row[COL_G11]), "grade_12": safe_int(row[COL_G12]),
    }

    parishes.append({
        "parish_code":          code,
        "parish_name":          name,
        "parish_slug":          parish_slug(name),
        "source_date":          "February 1, 2026",
        "schools_reporting":    schools,
        "total_enrollment":     total,
        "pct_of_state":         None,
        "students_per_school":  round(total/schools,1) if schools>0 else None,
        "gender": {
            "pct_female":   pct_f,
            "pct_male":     pct_m,
            "female_count": round(total*pct_f/100) if pct_f else None,
            "male_count":   round(total*pct_m/100) if pct_m else None,
        },
        "race_ethnicity_counts": race,
        "race_ethnicity_pct":    race_pct,
        "english_proficiency": {
            "pct_fully_proficient": safe_pct(row[COL_PCT_ENG]),
            "pct_limited":          safe_pct(row[COL_PCT_LEP]),
        },
        "pct_economically_disadvantaged": safe_pct(row[COL_ECO_DIS]),
        "grades_k12":  grades,
        "k12_total":   sum(grades.values()),
    })

state_total = safe_int(state_row[COL_TOTAL]) if state_row else None
if state_total:
    for p in parishes:
        p["pct_of_state"] = round(p["total_enrollment"]/state_total*100, 2)

out_json = OUT_DIR / "enrollment_by_parish.json"
with open(out_json, "w") as f:
    json.dump({
        "meta": {
            "source":                    "LDOE Multiple Statistics by School System",
            "report_date":               "February 1, 2026",
            "state_total_enrollment":    state_total,
            "state_total_schools":       safe_int(state_row[COL_SITES]) if state_row else None,
            "parish_count":              len(parishes),
        },
        "parishes": parishes,
    }, f, indent=2)
print(f"JSON → {out_json}  ({len(parishes)} parishes)")

csv_fields = [
    "parish_code","parish_name","parish_slug",
    "schools_reporting","total_enrollment","pct_of_state","students_per_school",
    "pct_female","pct_male","female_count","male_count",
    "american_indian","asian","black","hispanic","hawaiian_pacific","white","multiple_races",
    "pct_american_indian","pct_asian","pct_black","pct_hispanic","pct_hawaiian_pacific","pct_white","pct_multiple_races",
    "pct_fully_english_proficient","pct_limited_english","pct_economically_disadvantaged",
    "kindergarten","grade_1","grade_2","grade_3","grade_4","grade_5","grade_6",
    "grade_7","grade_8","grade_9","grade_10","grade_11","grade_12","k12_total",
]
out_csv = OUT_DIR / "enrollment_by_parish.csv"
with open(out_csv, "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=csv_fields)
    w.writeheader()
    for p in parishes:
        w.writerow({
            "parish_code": p["parish_code"], "parish_name": p["parish_name"],
            "parish_slug": p["parish_slug"], "schools_reporting": p["schools_reporting"],
            "total_enrollment": p["total_enrollment"], "pct_of_state": p["pct_of_state"],
            "students_per_school": p["students_per_school"],
            "pct_female": p["gender"]["pct_female"], "pct_male": p["gender"]["pct_male"],
            "female_count": p["gender"]["female_count"], "male_count": p["gender"]["male_count"],
            "american_indian": p["race_ethnicity_counts"]["american_indian"],
            "asian": p["race_ethnicity_counts"]["asian"],
            "black": p["race_ethnicity_counts"]["black"],
            "hispanic": p["race_ethnicity_counts"]["hispanic"],
            "hawaiian_pacific": p["race_ethnicity_counts"]["hawaiian_pacific"],
            "white": p["race_ethnicity_counts"]["white"],
            "multiple_races": p["race_ethnicity_counts"]["multiple_races"],
            "pct_american_indian": p["race_ethnicity_pct"]["american_indian"],
            "pct_asian": p["race_ethnicity_pct"]["asian"],
            "pct_black": p["race_ethnicity_pct"]["black"],
            "pct_hispanic": p["race_ethnicity_pct"]["hispanic"],
            "pct_hawaiian_pacific": p["race_ethnicity_pct"]["hawaiian_pacific"],
            "pct_white": p["race_ethnicity_pct"]["white"],
            "pct_multiple_races": p["race_ethnicity_pct"]["multiple_races"],
            "pct_fully_english_proficient": p["english_proficiency"]["pct_fully_proficient"],
            "pct_limited_english": p["english_proficiency"]["pct_limited"],
            "pct_economically_disadvantaged": p["pct_economically_disadvantaged"],
            "kindergarten": p["grades_k12"]["kindergarten"],
            "grade_1": p["grades_k12"]["grade_1"], "grade_2": p["grades_k12"]["grade_2"],
            "grade_3": p["grades_k12"]["grade_3"], "grade_4": p["grades_k12"]["grade_4"],
            "grade_5": p["grades_k12"]["grade_5"], "grade_6": p["grades_k12"]["grade_6"],
            "grade_7": p["grades_k12"]["grade_7"], "grade_8": p["grades_k12"]["grade_8"],
            "grade_9": p["grades_k12"]["grade_9"], "grade_10": p["grades_k12"]["grade_10"],
            "grade_11": p["grades_k12"]["grade_11"], "grade_12": p["grades_k12"]["grade_12"],
            "k12_total": p["k12_total"],
        })
print(f"CSV  → {out_csv}")
print("Done.")
