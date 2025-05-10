import os
import json

def read_json(path: str):
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def write_json(path: str, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
