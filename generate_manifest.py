import os
import json

def generate_manifest(base_folder="public/images", output="public/data.json"):
    data = []
    for category in os.listdir(base_folder):
        category_path = os.path.join(base_folder, category)
        if os.path.isdir(category_path):
            for img in os.listdir(category_path):
                if img.lower().endswith((".jpg", ".jpeg", ".png")):
                    data.append({
                        "src": f"/images/{category}/{img}",
                        "label": category
                    })
    with open(output, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Manifest generated with {len(data)} entries at {output}")

if __name__ == "__main__":
    generate_manifest()

