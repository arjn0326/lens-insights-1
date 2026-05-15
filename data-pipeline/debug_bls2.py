"""Pinpoint exactly why the BLS join produces nulls despite FIPS matching."""
import pandas as pd
from pathlib import Path

HERE = Path(__file__).parent
RAW = HERE / "raw"
NA_TOKENS = ['*', '**', '***', '', '-', 'N/A', 'n/a', 'TS', '<10', '##', '(X)', 'N', '-']

# ── Reproduce the EXACT load_bls_unemployment() logic ──
print("Reproducing load_bls_unemployment() step by step...")

df = pd.read_excel(
    RAW / "bls_unemployment_2024.xlsx",
    skiprows=5,
    header=None,
    names=['laus_code', 'state_fips', 'county_fips', 'county_name', 'year', 'blank',
           'labor_force', 'employed', 'unemployed', 'unemployment_rate'],
    na_values=NA_TOKENS,
)

print(f"1. After read_excel: {len(df)} rows")
print(f"   state_fips dtype: {df['state_fips'].dtype}")
print(f"   state_fips sample: {df['state_fips'].dropna().head(3).tolist()}")

df = df.dropna(subset=['state_fips'])
print(f"\n2. After dropna(state_fips): {len(df)} rows")

# THIS IS THE BUG: state_fips is float (22.0), converting to str gives "22.0"
# then .str.zfill(2) gives "22.0" (no change, already >2 chars)
# then comparison to '22' FAILS because "22.0" != "22"
df['state_fips'] = df['state_fips'].astype(str).str.zfill(2)
print(f"\n3. After astype(str).str.zfill(2):")
print(f"   state_fips sample: {df['state_fips'].unique()[:5].tolist()}")
print(f"   Contains '22'?  {('22' in df['state_fips'].values)}")
print(f"   Contains '22.0'? {('22.0' in df['state_fips'].values)}")

la = df[df['state_fips'] == '22']
print(f"\n4. Rows where state_fips == '22': {len(la)}")

la2 = df[df['state_fips'] == '22.0']
print(f"   Rows where state_fips == '22.0': {len(la2)}")

print(f"\n>>> ROOT CAUSE: state_fips is read as float (22.0) from Excel.")
print(f"    astype(str) produces '22.0', not '22'.")
print(f"    The filter `df[df['state_fips'] == '22']` matches ZERO rows.")

# ── Also check county_fips has the same issue ──
print(f"\n5. county_fips dtype: {df['county_fips'].dtype}")
print(f"   county_fips sample: {df['county_fips'].head(3).tolist()}")
# .str.replace('.0', '') does fix this: '1.0' -> '1' -> zfill(3) -> '001'
sample_county = df['county_fips'].astype(str).str.replace('.0', '', regex=False).str.zfill(3)
print(f"   After fix: {sample_county.head(3).tolist()}")

# ── Show the actual BLS unemployment data for LA ──
print("\n6. What Louisiana unemployment data looks like:")
la_numeric = df[pd.to_numeric(df['state_fips'].str.replace('.0','',regex=False), errors='coerce') == 22]
print(f"   Found {len(la_numeric)} LA rows")
print(f"   unemployment_rate column: {la_numeric['unemployment_rate'].head(5).tolist()}")
print(f"   unemployment_rate dtype: {la_numeric['unemployment_rate'].dtype}")
print(f"   unemployment_rate nulls: {la_numeric['unemployment_rate'].isna().sum()}")

# SECOND BUG: The columns are shifted! 
# Look at raw row: ['CN2200100000000', 22.0, 1.0, 'Acadia Parish, LA', 2024.0, 23532.0, 22518.0, 1014.0, 4.3, NaN]
# names=           ['laus_code',       'state_fips', 'county_fips', 'county_name', 'year', 'blank', 'labor_force', 'employed', 'unemployed', 'unemployment_rate']
# Actual header row (row 1): LAUS Code, State FIPS Code, County FIPS Code, County Name, Year, Labor Force, Employed, Unemployed, Unemployment Rate
# The raw file has NO 'blank' column! The script adds a 'blank' column name that shifts everything!

print("\n" + "=" * 60)
print("SECOND BUG: Column alignment")
print("=" * 60)
print("Raw file header (row 1): LAUS, StateFIPS, CountyFIPS, Name, Year, LaborForce, Employed, Unemployed, UnempRate")
print("Script column names:     laus, state_fips, county_fips, name, year, BLANK,      labor,    employed,  unemployed, unemp_rate")
print("                                                                    ^^^^^ EXTRA COLUMN!")
print()
print("This means:")
print("  'blank' column actually contains labor_force values")  
print("  'labor_force' column actually contains employed values")
print("  'employed' column actually contains unemployed values")
print("  'unemployed' column actually contains unemployment_rate values")
print("  'unemployment_rate' column is reading BEYOND the data = NaN!")
print()

# Verify
print("Proof - 'blank' values (should be labor force):")
la_all = df[pd.to_numeric(df['state_fips'].str.replace('.0','',regex=False), errors='coerce') == 22]
print(f"  'blank' sample: {la_all['blank'].head(5).tolist()}")
print(f"  'labor_force' sample: {la_all['labor_force'].head(5).tolist()}")
print(f"  'unemployed' sample (actually unemp rate): {la_all['unemployed'].head(5).tolist()}")
print(f"  'unemployment_rate' sample (actually empty): {la_all['unemployment_rate'].head(5).tolist()}")
