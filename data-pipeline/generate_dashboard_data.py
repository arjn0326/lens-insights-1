"""
generate_dashboard_data.py
Reads lens.json + LDOE enrollment and emits parishes_dashboard.json
for the React dashboard (map scores, real counts, lens alerts).
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).parent
LENS_JSON = HERE.parent / "public" / "data" / "lens.json"
ENROLLMENT_JSON = HERE.parent / "public" / "data" / "enrollment_by_parish.json"
MFP_JSON = HERE.parent / "public" / "data" / "mfp_by_parish.json"
OUTPUT_JSON = HERE.parent / "public" / "data" / "parishes_dashboard.json"

# Parish centroids (x, y as percentage of map viewBox 0-100)
PARISH_COORDS = {
    "Acadia": (32, 66),
    "Allen": (22, 60),
    "Ascension": (57, 66),
    "Assumption": (56, 73),
    "Avoyelles": (40, 46),
    "Beauregard": (15, 55),
    "Bienville": (19, 21),
    "Bossier": (9, 11),
    "Caddo": (5, 15),
    "Calcasieu": (14, 67),
    "Caldwell": (36, 27),
    "Cameron": (11, 76),
    "Catahoula": (38, 36),
    "Claiborne": (16, 10),
    "Concordia": (47, 40),
    "De Soto": (10, 24),
    "East Baton Rouge": (56, 58),
    "East Carroll": (50, 11),
    "East Feliciana": (56, 52),
    "Evangeline": (30, 56),
    "Franklin": (40, 25),
    "Grant": (25, 39),
    "Iberia": (42, 74),
    "Iberville": (53, 64),
    "Jackson": (24, 19),
    "Jefferson": (73, 76),
    "Jefferson Davis": (22, 67),
    "Lafayette": (37, 67),
    "Lafourche": (63, 80),
    "La Salle": (31, 34),
    "Lincoln": (23, 14),
    "Livingston": (63, 60),
    "Madison": (49, 17),
    "Morehouse": (37, 10),
    "Natchitoches": (17, 32),
    "Orleans": (76, 70),
    "Ouachita": (35, 16),
    "Plaquemines": (80, 82),
    "Pointe Coupee": (49, 54),
    "Rapides": (27, 44),
    "Red River": (12, 27),
    "Richland": (42, 19),
    "Sabine": (10, 38),
    "St. Bernard": (82, 73),
    "St. Charles": (68, 72),
    "St. Helena": (63, 54),
    "St. James": (59, 69),
    "St. John the Baptist": (65, 70),
    "St. Landry": (34, 58),
    "St. Martin": (43, 70),
    "St. Mary": (49, 77),
    "St. Tammany": (75, 60),
    "Tangipahoa": (68, 55),
    "Tensas": (47, 30),
    "Terrebonne": (58, 83),
    "Union": (26, 10),
    "Vermilion": (33, 76),
    "Vernon": (16, 47),
    "Washington": (73, 52),
    "Webster": (12, 17),
    "West Baton Rouge": (53, 60),
    "West Carroll": (44, 10),
    "West Feliciana": (51, 50),
    "Winn": (23, 29),
}

MEGA_PROJECT_PARISHES = {
    "Richland": 94,
    "Ascension": 88,
    "Calcasieu": 91,
    "Cameron": 82,
    "Iberia": 72,
}

# Lens alert label fragments → dashboard short labels (keys in ALERT_EXPLANATIONS)
ALERT_SHORT = [
    ("top-rated", "Few top schools + high need"),
    ("top-rated (A)", "Few top schools + high need"),
    ("poverty", "Deep need + weak outcomes"),
    ("AUS", "Concentrated low ratings"),
    ("D/F", "Concentrated low ratings"),
    ("failing-school", "Concentrated low ratings"),
    ("unemployment", "Labor stress + jobs signal"),
    ("graduation", "Labor stress + jobs signal"),
    ("Workforce-academic", "Labor stress + jobs signal"),
    ("megaproject", "Industrial demand + stress"),
]


def clamp(n: float, lo: int = 0, hi: int = 100) -> int:
    return max(lo, min(hi, round(n)))


def scale_quantile(value: float | None, q05: float, q95: float, invert: bool = False) -> int:
    """Map a raw value to 0–100 using statewide 5th/95th percentiles."""
    if value is None:
        return 50
    if q95 == q05:
        return 50
    scaled = (float(value) - q05) / (q95 - q05) * 100
    scaled = max(0.0, min(100.0, scaled))
    if invert:
        scaled = 100.0 - scaled
    return round(scaled)


def load_mfp_by_slug() -> dict[str, dict]:
    if not MFP_JSON.exists():
        return {}
    with open(MFP_JSON, encoding="utf-8") as f:
        data = json.load(f)
    return {p["parish_slug"]: p for p in data.get("parishes", [])}


def map_indices(parish_json: dict, scaling: dict, mfp: dict | None) -> dict[str, int]:
    """Composite dashboard layers from real signals (not simple index inversion)."""
    idx = parish_json.get("indices", {})
    signals = parish_json.get("signals", {})
    health = parish_json.get("health_score", 50)

    poverty_scale = scaling.get("poverty_rate", {})
    poverty_need = scale_quantile(
        signals.get("poverty_rate"),
        poverty_scale.get("q05", 8),
        poverty_scale.get("q95", 24),
        invert=False,
    )
    ed_pct = (mfp or {}).get("ed", {}).get("pct")
    ed_need = scale_quantile(ed_pct, 45, 85, invert=False) if ed_pct is not None else 50
    sped_pct = signals.get("sped_iep_pct")
    sped_need = scale_quantile(sped_pct, 9, 16, invert=False) if sped_pct is not None else 50
    need = clamp(0.5 * poverty_need + 0.35 * ed_need + 0.15 * sped_need)

    pct_a_scale = scaling.get("pct_a_schools_shrunk", {})
    pct_a = signals.get("pct_a_schools_shrunk") or signals.get("pct_a_schools")
    q05_a = pct_a_scale.get("q05", 11)
    q95_a = pct_a_scale.get("q95", 36)
    if pct_a is not None and q95_a != q05_a:
        a_share = (float(pct_a) - q05_a) / (q95_a - q05_a) * 100
        access = clamp(100 - a_share)
        access = max(8, access)
    else:
        access = max(8, round(100 - idx.get("educator_capacity", 50)))

    unemp_scale = scaling.get("unemployment_combined", {})
    unemp = signals.get("unemployment_rate") or signals.get("unemployment_rate_bls")
    unemp_stress = scale_quantile(
        unemp,
        unemp_scale.get("q05", 3.7),
        unemp_scale.get("q95", 7.1),
        invert=False,
    )
    grad_scale = scaling.get("grad_rate", {})
    grad_rate = signals.get("grad_rate_parish_mean")
    grad_stress = (
        scale_quantile(
            grad_rate,
            grad_scale.get("q05", 78),
            grad_scale.get("q95", 94),
            invert=True,
        )
        if grad_rate is not None
        else 100 - idx.get("graduation", 50)
    )
    readiness = clamp(0.55 * unemp_stress + 0.45 * grad_stress)

    name = parish_json["name"]
    if name in MEGA_PROJECT_PARISHES:
        demand = MEGA_PROJECT_PARISHES[name]
    else:
        demand = clamp(max(20, min(85, idx.get("opportunity", 50) * 0.8 + 10)))

    pct_df = signals.get("pct_df_schools_shrunk") or signals.get("pct_df_schools")
    df_stress = scale_quantile(pct_df, 3, 22, invert=False) if pct_df is not None else 50
    academic_pressure = 100 - idx.get("academic", 50)
    pipeline = clamp(0.55 * academic_pressure + 0.45 * df_stress)

    return {
        "Health": clamp(health),
        "Need": need,
        "Access": access,
        "Readiness": readiness,
        "Demand": demand,
        "Pipeline": pipeline,
    }


def dashboard_alert(parish_json: dict) -> str | None:
    alerts = parish_json.get("alerts") or []
    if not alerts:
        return None
    high = [a for a in alerts if a.get("severity") == "high"]
    pick = high[0] if high else alerts[0]
    label = (pick.get("label") or "").lower()
    for fragment, short in ALERT_SHORT:
        if fragment.lower() in label:
            if short == "Few top schools + high need":
                need = 100 - parish_json.get("indices", {}).get("equity", 50)
                if need < 55:
                    continue
            if short == "Industrial demand + stress":
                if parish_json["name"] not in MEGA_PROJECT_PARISHES:
                    continue
            return short
    return (pick.get("label") or "").split(" — ")[0].split(" - ")[0][:56]


def dashboard_intervention(parish_json: dict) -> str:
    interv = parish_json.get("intervention") or {}
    code = interv.get("type") or "Monitor"
    if code in ("D", "Monitor"):
        return "Monitor"
    return str(code)


def determine_trend(health: int) -> str:
    if health >= 65:
        return "up"
    if health <= 40:
        return "down"
    return "flat"


def load_enrollment_by_slug() -> dict[str, dict]:
    if not ENROLLMENT_JSON.exists():
        return {}
    with open(ENROLLMENT_JSON, encoding="utf-8") as f:
        data = json.load(f)
    return {p["parish_slug"]: p for p in data.get("parishes", [])}


def generate():
    print("Reading lens.json...")
    with open(LENS_JSON, encoding="utf-8") as f:
        lens = json.load(f)

    enrollment = load_enrollment_by_slug()
    mfp_by_slug = load_mfp_by_slug()
    scaling = lens.get("meta", {}).get("scaling", {})
    parish_entries = []

    for p in lens["parishes"]:
        name = p["name"]
        slug = p["name_slug"]
        coords = PARISH_COORDS.get(name, (50, 50))
        scores = map_indices(p, scaling, mfp_by_slug.get(slug))
        signals = p.get("signals", {})
        enroll = enrollment.get(slug)

        students = int(enroll["total_enrollment"]) if enroll else None
        schools_reporting = int(enroll["schools_reporting"]) if enroll else None
        population = int(signals["population_total"]) if signals.get("population_total") else None

        school_count = p.get("school_count", 0) or 0
        if students is None and school_count:
            students = school_count * 450  # fallback only

        entry = {
            "id": slug,
            "name": name,
            "population": population or 0,
            "students": students or 0,
            "dfSchools": int(signals.get("df_school_count") or 0),
            "totalSchools": schools_reporting or school_count,
            "trend": determine_trend(scores["Health"]),
            "x": coords[0],
            "y": coords[1],
            "priorityScore": int(p.get("priority_score", 50)),
            "uncertainty": signals.get("school_tier_uncertainty", "medium"),
            "scores": scores,
            "alert": dashboard_alert(p),
            "intervention": dashboard_intervention(p),
            "gradeCounts": {
                "A": int(signals.get("a_school_count") or 0),
                "df": int(signals.get("df_school_count") or 0),
                "total": school_count,
            },
        }
        parish_entries.append(entry)

    parish_entries.sort(key=lambda x: x["name"])

    layer_keys = ["Health", "Need", "Access", "Readiness", "Demand", "Pipeline"]
    state_avgs = {
        k: round(sum(p["scores"][k] for p in parish_entries) / len(parish_entries))
        for k in layer_keys
    }

    payload = {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": "lens.json + enrollment_by_parish.json",
            "parish_count": len(parish_entries),
            "state_averages": state_avgs,
        },
        "parishes": parish_entries,
    }

    OUTPUT_JSON.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT_JSON} ({len(parish_entries)} parishes)")
    print(f"  State avg Health: {state_avgs['Health']}")
    alerts = sum(1 for p in parish_entries if p["alert"])
    print(f"  Parishes with alerts: {alerts}")


if __name__ == "__main__":
    generate()
