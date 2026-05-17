"""
parse_sped.py
Reads sped_combined.csv and merges special education signals
into the existing lens.json under each parish's signals block.

Usage (from inside /data-pipeline/):
    uv run python parse_sped.py
    -- or --
    python parse_sped.py
"""

import json
import csv
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────
PIPELINE_DIR = Path(__file__).parent
RAW_DIR      = PIPELINE_DIR / "raw"
LENS_JSON    = PIPELINE_DIR.parent / "public" / "data" / "lens.json"
SPED_CSV     = RAW_DIR / "sped_combined.csv"

# ── Load sped CSV into a lookup dict keyed by parish_slug ──────────────────
sped_lookup: dict[str, dict] = {}
with open(SPED_CSV, newline="") as f:
    for row in csv.DictReader(f):
        slug = row["parish_slug"]
        sped_lookup[slug] = {
            "sped_iep_count":                int(row["sped_iep_count"]),
            "sped_gen_ed_public":            int(row["sped_gen_ed_public"]),
            "sped_total_public_enrollment":  int(row["sped_total_public_enrollment"]),
            "sped_iep_pct":                  float(row["sped_iep_pct"]),
            "sped_teacher_fte_total":        float(row["sped_teacher_fte_total"]),
            "sped_teacher_fte_certified":    float(row["sped_teacher_fte_certified"]),
            "sped_teacher_fte_uncertified":  float(row["sped_teacher_fte_uncertified"]),
            "sped_teacher_gap_pct":          float(row["sped_teacher_gap_pct"]),
        }

# ── Load lens.json ─────────────────────────────────────────────────────────
with open(LENS_JSON) as f:
    lens = json.load(f)

# ── Merge sped signals into each parish ────────────────────────────────────
matched   = 0
unmatched = []

for parish in lens["parishes"]:
    slug = parish.get("name_slug", "")
    if slug in sped_lookup:
        parish["signals"].update(sped_lookup[slug])
        matched += 1
    else:
        unmatched.append(slug)

# ── Save updated lens.json ─────────────────────────────────────────────────
with open(LENS_JSON, "w") as f:
    json.dump(lens, f, indent=2)

print(f"Done. {matched}/64 parishes updated.")
if unmatched:
    print(f"No match found for: {unmatched}")
    print("Check that name_slug in lens.json matches parish_slug in sped_combined.csv")
