import json

data = {
    "title": "LDOE 5YR Strategic Plan Funding Flow 2023-2028",
    "nodes": [
        {"id": "LDOE", "label": "LDOE\nTotal Budget\n~$7.98B"},
        {"id": "678", "label": "State Activities\n$400M"},
        {"id": "681", "label": "Subgrantee\nAssistance\n$3.4B"},
        {"id": "682", "label": "Recovery School\nDistrict\n$121M"},
        {"id": "695", "label": "Minimum Foundation\nProgram\n$4.04B"},
        {"id": "697", "label": "Non-Public\nAssistance\n$20.6M"},
    ],
    "links": [
        {"source": "LDOE", "target": "678", "value": 400},
        {"source": "LDOE", "target": "681", "value": 3400},
        {"source": "LDOE", "target": "682", "value": 121},
        {"source": "LDOE", "target": "695", "value": 4040},
        {"source": "LDOE", "target": "697", "value": 20.6},
    ]
}

with open("public/data/ldoe_funding.json", "w") as f:
    json.dump(data, f, indent=2)

print("Done! ldoe_funding.json written to public/data/")