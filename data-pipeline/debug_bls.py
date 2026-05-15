"""Debug why BLS unemployment data has 0 matches for Louisiana parishes."""
import pandas as pd
from pathlib import Path

HERE = Path(__file__).parent
RAW = HERE / "raw"
NA_TOKENS = ['*', '**', '***', '', '-', 'N/A', 'n/a', 'TS', '<10', '##', '(X)', 'N', '-']

# ── Step 1: Read raw BLS file and look at raw structure ──
print("=" * 60)
print("STEP 1: Raw BLS file structure")
print("=" * 60)

# Read with no processing to see what's actually there
raw = pd.read_excel(RAW / "bls_unemployment_2024.xlsx", header=None, nrows=15)
print("First 15 rows (raw, no skip):")
for i, row in raw.iterrows():
    print(f"  Row {i}: {list(row.values)[:8]}")

# ── Step 2: Read with the script's current settings ──
print("\n" + "=" * 60)
print("STEP 2: BLS with current skiprows=5, header=None")
print("=" * 60)

df = pd.read_excel(
    RAW / "bls_unemployment_2024.xlsx",
    skiprows=5,
    header=None,
    names=['laus_code', 'state_fips', 'county_fips', 'county_name', 'year', 'blank',
           'labor_force', 'employed', 'unemployed', 'unemployment_rate'],
    na_values=NA_TOKENS,
)
print(f"Total rows: {len(df)}")
print(f"Columns: {list(df.columns)}")
print(f"\nFirst 5 rows:")
print(df.head().to_string())

print(f"\nUnique state_fips values (first 20):")
print(df['state_fips'].dropna().unique()[:20])

# ── Step 3: Filter to Louisiana (state_fips == 22) ──
print("\n" + "=" * 60)
print("STEP 3: Louisiana filtering")
print("=" * 60)

df_clean = df.dropna(subset=['state_fips'])
print(f"Rows after dropna(state_fips): {len(df_clean)}")

# Try as-is
df_clean['state_fips_str'] = df_clean['state_fips'].astype(str).str.strip()
print(f"\nSample state_fips_str values: {df_clean['state_fips_str'].unique()[:20]}")

# Check for Louisiana
la_mask = df_clean['state_fips_str'].str.contains('22')
print(f"Rows containing '22' in state_fips: {la_mask.sum()}")

la_mask2 = df_clean['state_fips_str'] == '22'
print(f"Rows exactly '22': {la_mask2.sum()}")

la_mask3 = df_clean['state_fips_str'] == '22.0'
print(f"Rows exactly '22.0': {la_mask3.sum()}")

# Try numeric approach
df_clean['state_fips_num'] = pd.to_numeric(df_clean['state_fips'], errors='coerce')
la_mask4 = df_clean['state_fips_num'] == 22
print(f"Rows where numeric state_fips == 22: {la_mask4.sum()}")

if la_mask4.sum() > 0:
    la_rows = df_clean[la_mask4]
    print(f"\nLouisiana rows found! Showing first 5:")
    print(la_rows.head().to_string())
    
    # ── Step 4: Check FIPS construction ──
    print("\n" + "=" * 60)
    print("STEP 4: FIPS code construction")
    print("=" * 60)
    
    la_rows = la_rows.copy()
    la_rows['county_fips_raw'] = la_rows['county_fips']
    la_rows['county_fips_str'] = la_rows['county_fips'].astype(str).str.replace('.0', '', regex=False).str.zfill(3)
    la_rows['built_fips'] = '22' + la_rows['county_fips_str']
    
    print(f"Sample county_fips_raw: {la_rows['county_fips_raw'].head(10).tolist()}")
    print(f"Sample county_fips_str: {la_rows['county_fips_str'].head(10).tolist()}")
    print(f"Sample built_fips:      {la_rows['built_fips'].head(10).tolist()}")
    
    # Compare to parishes.csv
    parishes = pd.read_csv(HERE / "parishes.csv")
    parishes['fips'] = parishes['fips'].astype(str)
    
    bls_fips = set(la_rows['built_fips'].unique())
    parish_fips = set(parishes['fips'].unique())
    
    matched = bls_fips & parish_fips
    bls_only = bls_fips - parish_fips
    parish_only = parish_fips - bls_fips
    
    print(f"\nBLS FIPS codes:    {len(bls_fips)}")
    print(f"Parish FIPS codes: {len(parish_fips)}")
    print(f"Matched:           {len(matched)}")
    print(f"BLS only:          {len(bls_only)}")
    print(f"Parish only:       {len(parish_only)}")
    
    if bls_only:
        print(f"\nBLS FIPS not in parishes: {sorted(bls_only)[:10]}")
    if parish_only:
        print(f"Parish FIPS not in BLS:   {sorted(parish_only)[:10]}")
else:
    # ── Alternative: search for Louisiana by name ──
    print("\n" + "=" * 60)
    print("STEP 4 (ALT): Searching for Louisiana by county name")
    print("=" * 60)
    name_mask = df_clean['county_name'].astype(str).str.contains('Louisiana|Parish', case=False, na=False)
    print(f"Rows with 'Louisiana' or 'Parish' in county_name: {name_mask.sum()}")
    if name_mask.sum() > 0:
        print(df_clean[name_mask].head(10).to_string())

# ── Step 5: Also check ACS unemployment ──
print("\n" + "=" * 60)
print("STEP 5: ACS Census unemployment check")
print("=" * 60)

acs = pd.read_csv(RAW / "acs_economic.csv", skiprows=[1], na_values=NA_TOKENS, low_memory=False)
acs['fips'] = acs['GEO_ID'].str[-5:]
acs_la = acs[acs['fips'].str.startswith('22')].copy()

if 'DP03_0009PE' in acs_la.columns:
    acs_la['unemployment_rate'] = pd.to_numeric(acs_la['DP03_0009PE'], errors='coerce')
    valid = acs_la['unemployment_rate'].notna().sum()
    print(f"ACS unemployment: {valid} valid values out of {len(acs_la)} LA rows")
    if valid > 0:
        print(f"  Range: {acs_la['unemployment_rate'].min():.1f}% - {acs_la['unemployment_rate'].max():.1f}%")
        print(f"  Mean:  {acs_la['unemployment_rate'].mean():.1f}%")
else:
    print("Column DP03_0009PE NOT FOUND in ACS economic file!")
    print(f"Available columns with 'unemp': {[c for c in acs.columns if 'unemp' in c.lower() or '0009' in c]}")
