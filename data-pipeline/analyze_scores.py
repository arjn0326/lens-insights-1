"""Analyze the current lens.json score distribution."""
import json
from pathlib import Path

data = json.load(open(Path(__file__).parent.parent / "public" / "data" / "lens.json"))
parishes = data["parishes"]

# Health score distribution
scores = [p["health_score"] for p in parishes]
print("=== CURRENT HEALTH SCORE DISTRIBUTION ===")
print(f"N = {len(scores)}  Mean = {sum(scores)/len(scores):.1f}  Min = {min(scores)}  Max = {max(scores)}")
print()

buckets = [0]*10
for s in scores:
    b = min(int(s // 10), 9)
    buckets[b] += 1

for i in range(10):
    bar = "#" * buckets[i]
    print(f"  {i*10:3d}-{i*10+9:3d}: {buckets[i]:2d}  {bar}")

print(f"\n  Below 20: {sum(1 for s in scores if s < 20)}")
print(f"  Above 80: {sum(1 for s in scores if s > 80)}")
print(f"  Between 30-70: {sum(1 for s in scores if 30 <= s <= 70)}")

# Index distributions
print("\n=== INDEX DISTRIBUTIONS ===")
for idx_name in ["academic", "equity", "workforce_alignment", "educator_capacity", "opportunity"]:
    vals = [p["indices"][idx_name] for p in parishes]
    zeros = sum(1 for v in vals if v == 0.0)
    hundreds = sum(1 for v in vals if v == 100.0)
    print(f"  {idx_name:25s}: mean={sum(vals)/len(vals):5.1f}  min={min(vals):5.1f}  max={max(vals):5.1f}  "
          f"zeros={zeros}  hundreds={hundreds}")

# Null/missing signal check
print("\n=== MISSING DATA CHECK ===")
signal_keys = ["avg_sps_2025", "poverty_rate", "unemployment_rate", "median_household_income",
               "pct_bachelors_or_higher", "labor_force", "pct_df_schools", "a_school_count"]
for key in signal_keys:
    nulls = sum(1 for p in parishes if p["signals"].get(key) is None)
    print(f"  {key:30s}: {nulls:2d} nulls out of {len(parishes)}")

# Show the 5 parishes of interest
print("\n=== KEY PARISHES ===")
for name in ["Ascension", "Richland", "East Baton Rouge", "St. Helena", "Orleans"]:
    p = next((x for x in parishes if x["name"] == name), None)
    if p:
        idx = p["indices"]
        print(f"\n  {name} (Health={p['health_score']}):")
        print(f"    Academic={idx['academic']:.1f}  Equity={idx['equity']:.1f}  "
              f"Workforce={idx['workforce_alignment']:.1f}  Educator={idx['educator_capacity']:.1f}  "
              f"Opportunity={idx['opportunity']:.1f}")
        s = p["signals"]
        print(f"    SPS={s.get('avg_sps_2025')}  Poverty={s.get('poverty_rate')}%  "
              f"Unemp={s.get('unemployment_rate')}  Income=${s.get('median_household_income')}  "
              f"Bachelor={s.get('pct_bachelors_or_higher')}%  D/F={s.get('pct_df_schools')}%  "
              f"A-schools={s.get('a_school_count')}")
