"""
LENS — Louisiana Education & Needs Synthesis
build_lens.py — generates public/data/lens.json from raw data files

Run from data-pipeline folder with:
    uv run python build_lens.py
"""

import json
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone

# ============================================================
# PATHS — where files live
# ============================================================
HERE = Path(__file__).parent
RAW = HERE / "raw"
OUT = HERE.parent / "public" / "data" / "lens.json"
PARISHES_CSV = HERE / "parishes.csv"

# Tokens that mean "no data" in our source files
NA_TOKENS = ['*', '**', '***', '—', '–', 'N/A', 'n/a', 'TS', '<10', '##', '(X)', 'N', '-']


# ============================================================
# LOADERS — one function per data source
# ============================================================

def load_parishes():
    """Load the master parish list (64 rows)."""
    df = pd.read_csv(PARISHES_CSV)
    df['fips'] = df['fips'].astype(str)
    return df


def load_ldoe_sps():
    """Read LDOE School Performance Scores Excel file. Aggregate schools to parish."""
    print("  Reading LDOE performance scores...")
    sheets = pd.read_excel(
        RAW / "ldoe_sps_2024_2025.xlsx",
        sheet_name=None,
        header=3,           # data column headers are on row 5 (index 4)
        na_values=NA_TOKENS,
    )
    # Use only the main "School" tab (skip Alternative, Closed)
    df = sheets.get("School", list(sheets.values())[0])
    df.columns = [str(c).strip() for c in df.columns]

    # Find the right columns flexibly (column names have variation)
    parish_col = next((c for c in df.columns if c == "School System"), None)
    sps_col = next((c for c in df.columns if "2025 SPS" in c), None)
    grade_col = next((c for c in df.columns if "2025 Letter Grade" in c), None)
    type_col = next((c for c in df.columns if "School Type" in c), None)
    grad_col = next((c for c in df.columns if "Cohort Graduation Actual Rate" in c and "2024-2025" in c), None)

    if not all([parish_col, sps_col, grade_col]):
        raise ValueError(f"Could not find required columns. Found: {df.columns.tolist()[:10]}")

    df = df[[parish_col, sps_col, grade_col, type_col] + ([grad_col] if grad_col else [])].copy()
    df.columns = ['parish_raw', 'sps', 'grade', 'school_type'] + (['grad_rate'] if grad_col else [])

    # Clean: drop rows without parish or SPS
    df['sps'] = pd.to_numeric(df['sps'], errors='coerce')
    df = df.dropna(subset=['parish_raw', 'sps'])

    # Clean parish names (remove " Parish" suffix to match parishes.csv)
    df['parish_name'] = df['parish_raw'].str.replace(' Parish', '', regex=False).str.strip()

    # Aggregate to parish level
    grouped = df.groupby('parish_name').agg(
        avg_sps=('sps', 'mean'),
        school_count=('sps', 'count'),
        df_school_count=('grade', lambda g: (g.isin(['D', 'F'])).sum()),
        a_school_count=('grade', lambda g: (g == 'A').sum()),
    ).reset_index()

    if 'grad_rate' in df.columns:
        df['grad_rate'] = pd.to_numeric(df['grad_rate'], errors='coerce')
        grad = df.groupby('parish_name')['grad_rate'].mean().reset_index()
        grouped = grouped.merge(grad, on='parish_name', how='left')

    grouped['pct_df_schools'] = (grouped['df_school_count'] / grouped['school_count'] * 100).round(1)
    grouped['pct_a_schools'] = (grouped['a_school_count'] / grouped['school_count'] * 100).round(1)
    print(f"    -> {len(grouped)} parishes loaded from LDOE")
    return grouped


def load_acs_economic():
    """Load Census ACS economic data (poverty, income, employment)."""
    print("  Reading Census economic data...")
    # Skip the second header row (descriptive labels)
    df = pd.read_csv(RAW / "acs_economic.csv", skiprows=[1], na_values=NA_TOKENS, low_memory=False)
    # Extract FIPS code from GEO_ID like "0500000US22001"
    df['fips'] = df['GEO_ID'].str[-5:]
    # Filter to Louisiana only (FIPS starts with 22)
    df = df[df['fips'].str.startswith('22')].copy()

    # The columns we want (DP03 employment/income table):
    # DP03_0009PE = Unemployment rate (% of labor force)
    # DP03_0062E  = Median household income
    # DP03_0119PE = % families below poverty
    cols_we_want = {
        'DP03_0009PE': 'unemployment_rate',
        'DP03_0062E': 'median_household_income',
        'DP03_0119PE': 'poverty_rate',
    }
    keep = ['fips'] + [c for c in cols_we_want if c in df.columns]
    df = df[keep].copy()
    df = df.rename(columns=cols_we_want)
    for col in ['unemployment_rate', 'median_household_income', 'poverty_rate']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    print(f"    -> {len(df)} parishes loaded from Census economic")
    return df


def load_acs_social():
    """Load Census ACS social data (education, family structure)."""
    print("  Reading Census social data...")
    df = pd.read_csv(RAW / "acs_social.csv", skiprows=[1], na_values=NA_TOKENS, low_memory=False)
    df['fips'] = df['GEO_ID'].str[-5:]
    df = df[df['fips'].str.startswith('22')].copy()

    # DP02_0068PE = % bachelor's degree or higher (population 25+)
    # DP02_0007PE = % single-parent households (rough proxy)
    cols_we_want = {
        'DP02_0068PE': 'pct_bachelors_or_higher',
    }
    keep = ['fips'] + [c for c in cols_we_want if c in df.columns]
    df = df[keep].copy()
    df = df.rename(columns=cols_we_want)
    for col in ['pct_bachelors_or_higher']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    print(f"    -> {len(df)} parishes loaded from Census social")
    return df


def load_bls_unemployment():
    """Load BLS county-level unemployment data."""
    print("  Reading BLS unemployment...")
    df = pd.read_excel(
        RAW / "bls_unemployment_2024.xlsx",
        skiprows=5,
        header=None,
        names=['laus_code', 'state_fips', 'county_fips', 'county_name', 'year', 'blank',
               'labor_force', 'employed', 'unemployed', 'unemployment_rate'],
        na_values=NA_TOKENS,
    )
    df = df.dropna(subset=['state_fips'])
    df['state_fips'] = df['state_fips'].astype(str).str.zfill(2)
    df['county_fips'] = df['county_fips'].astype(str).str.replace('.0', '', regex=False).str.zfill(3)
    df = df[df['state_fips'] == '22'].copy()
    df['fips'] = '22' + df['county_fips']
    df['labor_force'] = pd.to_numeric(df['labor_force'].astype(str).str.replace(',', ''), errors='coerce')
    df['unemployment_rate_bls'] = pd.to_numeric(df['unemployment_rate'], errors='coerce')
    df = df[['fips', 'labor_force', 'unemployment_rate_bls']]
    print(f"    -> {len(df)} parishes loaded from BLS")
    return df


# ============================================================
# SCORING — compute composite indices
# ============================================================

def to_score(series, invert=False):
    """Convert a numeric series to 0-100 score using min/max scaling.
    invert=True means lower raw values = higher score."""
    s = pd.to_numeric(series, errors='coerce')
    if s.isna().all():
        return pd.Series([50] * len(s), index=s.index)
    lo, hi = s.quantile(0.05), s.quantile(0.95)
    if hi == lo:
        return pd.Series([50] * len(s), index=s.index)
    scaled = ((s - lo) / (hi - lo) * 100).clip(0, 100)
    if invert:
        scaled = 100 - scaled
    return scaled.fillna(50).round(1)


def compute_indices(df):
    """Build the 5 composite indices from raw signals."""
    # Academic Performance (higher SPS = better)
    df['idx_academic'] = to_score(df['avg_sps'])

    # Equity / Need (higher poverty = WORSE, so invert)
    df['idx_equity'] = to_score(df['poverty_rate'], invert=True)

    # Workforce Alignment (lower unemployment = better)
    df['idx_workforce'] = to_score(df['unemployment_rate'], invert=True)

    # Educator Capacity (higher % A schools = better, more schools = more capacity)
    df['idx_educator'] = to_score(df['pct_a_schools'])

    # Opportunity (higher income + higher education = better)
    score_income = to_score(df['median_household_income'])
    score_edu = to_score(df['pct_bachelors_or_higher'])
    df['idx_opportunity'] = ((score_income + score_edu) / 2).round(1)

    # Health Score = average of 5 indices
    df['health_score'] = df[[
        'idx_academic', 'idx_equity', 'idx_workforce', 'idx_educator', 'idx_opportunity'
    ]].mean(axis=1).round(0).astype(int)

    return df


def compute_alerts(row):
    """Generate compound alerts based on signal patterns."""
    alerts = []
    if row.get('pct_df_schools', 0) > 20 and row.get('idx_equity', 50) < 40:
        alerts.append({"id": "A1", "severity": "high",
                       "label": "High failing-school concentration in high-need community"})
    if row.get('idx_workforce', 50) < 40 and row.get('idx_academic', 50) < 50:
        alerts.append({"id": "A2", "severity": "medium",
                       "label": "Workforce-academic mismatch"})
    if row.get('idx_educator', 50) < 40:
        alerts.append({"id": "B", "severity": "high",
                       "label": "Educator capacity shortage"})
    if row.get('idx_equity', 50) < 35:
        alerts.append({"id": "C", "severity": "high",
                       "label": "Severe poverty headwind"})
    if row.get('school_count', 0) < 5:
        alerts.append({"id": "D", "severity": "medium",
                       "label": "Limited school options"})
    return alerts


def compute_intervention(row, alerts):
    """Recommend an intervention type based on score profile."""
    alert_ids = {a['id'] for a in alerts}
    if 'A1' in alert_ids:
        return {"type": "A1",
                "label": "Targeted school turnaround + community wraparound",
                "rationale": f"{int(row.get('pct_df_schools', 0))}% of schools rated D/F in a high-need community."}
    if 'B' in alert_ids and row.get('idx_opportunity', 50) > 50:
        return {"type": "A2",
                "label": "Educator pipeline investment",
                "rationale": "Low educator capacity in a parish with strong opportunity signals — invest in teacher recruitment."}
    if 'A2' in alert_ids:
        return {"type": "C",
                "label": "Workforce alignment program",
                "rationale": "Mismatch between academic outcomes and local workforce needs."}
    if row.get('health_score', 50) >= 70:
        return {"type": "D",
                "label": "Monitor and maintain",
                "rationale": "Parish performing above state average — continue current trajectory."}
    return {"type": "B",
            "label": "Diagnostic review needed",
            "rationale": "Mixed signals — recommend deeper diagnostic review."}


# ============================================================
# ASSEMBLE — turn DataFrame rows into the JSON structure
# ============================================================

def assemble_payload(df):
    parishes = []
    for _, row in df.iterrows():
        alerts = compute_alerts(row)
        intervention = compute_intervention(row, alerts)
        parish_obj = {
            "fips": str(row['fips']),
            "name": row['parish_name'],
            "name_slug": row['parish_slug'],
            "school_count": int(row.get('school_count', 0)) if pd.notna(row.get('school_count')) else 0,
            "health_score": int(row['health_score']) if pd.notna(row['health_score']) else 50,
            "indices": {
                "academic": float(row['idx_academic']) if pd.notna(row['idx_academic']) else 50.0,
                "equity": float(row['idx_equity']) if pd.notna(row['idx_equity']) else 50.0,
                "workforce_alignment": float(row['idx_workforce']) if pd.notna(row['idx_workforce']) else 50.0,
                "educator_capacity": float(row['idx_educator']) if pd.notna(row['idx_educator']) else 50.0,
                "opportunity": float(row['idx_opportunity']) if pd.notna(row['idx_opportunity']) else 50.0,
            },
            "alerts": alerts,
            "intervention": intervention,
            "signals": {
                "avg_sps_2025": round(float(row['avg_sps']), 1) if pd.notna(row.get('avg_sps')) else None,
                "df_school_count": int(row['df_school_count']) if pd.notna(row.get('df_school_count')) else None,
                "a_school_count": int(row['a_school_count']) if pd.notna(row.get('a_school_count')) else None,
                "pct_df_schools": float(row['pct_df_schools']) if pd.notna(row.get('pct_df_schools')) else None,
                "median_household_income": int(row['median_household_income']) if pd.notna(row.get('median_household_income')) else None,
                "poverty_rate": float(row['poverty_rate']) if pd.notna(row.get('poverty_rate')) else None,
                "unemployment_rate": float(row['unemployment_rate_bls']) if pd.notna(row.get('unemployment_rate_bls')) else None,
                "pct_bachelors_or_higher": float(row['pct_bachelors_or_higher']) if pd.notna(row.get('pct_bachelors_or_higher')) else None,
                "labor_force": int(row['labor_force']) if pd.notna(row.get('labor_force')) else None,
            },
        }
        parishes.append(parish_obj)

    parishes.sort(key=lambda p: p['name'])

    payload = {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "data_vintage": {
                "ldoe_sps": "2024-2025",
                "acs": "2023 5-year estimates",
                "bls": "2024 annual"
            },
            "version": "1.0.0",
            "parish_count": len(parishes),
        },
        "parishes": parishes,
    }
    return payload


# ============================================================
# MAIN
# ============================================================

def main():
    print("Building LENS data...")
    parishes = load_parishes()
    sps = load_ldoe_sps()
    acs_econ = load_acs_economic()
    acs_soc = load_acs_social()
    bls = load_bls_unemployment()

    print("\nMerging sources...")
    df = (parishes
          .merge(sps, on='parish_name', how='left')
          .merge(acs_econ, on='fips', how='left')
          .merge(acs_soc, on='fips', how='left')
          .merge(bls, on='fips', how='left'))

    print("Computing indices...")
    df = compute_indices(df)

    print("Assembling JSON payload...")
    payload = assemble_payload(df)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2))

    print(f"\n✅ Wrote {OUT}")
    print(f"   {payload['meta']['parish_count']} parishes")
    print(f"   File size: {OUT.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()