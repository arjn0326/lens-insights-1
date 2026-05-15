import json

# --- Chart 1: Schools by letter grade & configuration ---
grade_config = {
    "labels": ["A", "B", "C", "D", "F"],
    "k8":          [113, 292, 334, 137, 43],
    "combination": [60,  53,  40,  7,   9],
    "highSchool":  [93,  49,  42,  10,  0],
}

# --- Chart 2: SPS line chart (all years from 2017-18, new formula only) ---
sps_trend = [
    {"year": "2017-18", "sps": 76.1, "grade": "B"},
    {"year": "2018-19", "sps": 77.1, "grade": "B"},
    {"year": "2020-21", "sps": 75.3, "grade": ""},
    {"year": "2021-22", "sps": 77.1, "grade": "B"},
    {"year": "2022-23", "sps": 78.5, "grade": "B"},
    {"year": "2023-24", "sps": 80.2, "grade": "B"},
    {"year": "2024-25", "sps": 80.9, "grade": "B"},
]

# --- Chart 3: Districts by letter grade (all years from 2017-18) ---
district_trend = {
    "years": ["2017-18", "2018-19", "2021-22", "2022-23", "2023-24", "2024-25"],
    "A": [4,  9,  7,  10, 11, 12],
    "B": [35, 32, 31, 34, 38, 38],
    "C": [25, 23, 20, 23, 17, 16],
    "D": [4,  5,  4,  3,  3,  4],
    "F": [2,  1,  2,  0,  1,  0],
}

output = {
    "gradeConfig": grade_config,
    "spsTrend": sps_trend,
    "districtTrend": district_trend,
}

with open("public/data/state_report_data.json", "w") as f:
    json.dump(output, f, indent=2)

print("Done! state_report_data.json written to public/data/")