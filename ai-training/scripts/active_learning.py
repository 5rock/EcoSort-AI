import os
import json
import shutil
import base64

def main():
    base_dir = os.path.join(os.path.dirname(__file__), "..")
    corrections_path = os.path.join(base_dir, "..", "apps", "web", "public", "data", "corrections.json")
    raw_dir = os.path.join(base_dir, "datasets", "raw", "ActiveLearning")
    
    if not os.path.exists(corrections_path):
        print("No corrections.json found. Active learning loop idle.")
        return
        
    os.makedirs(raw_dir, exist_ok=True)
    
    with open(corrections_path, 'r') as f:
        corrections = json.load(f)
        
    merged = 0
    for item in corrections:
        # Example format: { "id": "123", "image_base64": "...", "corrected_class": "plastic" }
        target_class = item.get("corrected_class")
        b64_data = item.get("image_base64")
        
        if not target_class or not b64_data:
            continue
            
        class_dir = os.path.join(raw_dir, target_class)
        os.makedirs(class_dir, exist_ok=True)
        
        # Save image
        img_data = base64.b64decode(b64_data.split(',')[1] if ',' in b64_data else b64_data)
        file_path = os.path.join(class_dir, f"correction_{item.get('id', merged)}.jpg")
        
        with open(file_path, 'wb') as img_f:
            img_f.write(img_data)
            
        merged += 1
        
    print(f"Active Learning: Merged {merged} user-corrected images into {raw_dir}.")
    print("These will be included in the next execution of clean_dataset.py and train.py.")
    
    # Archive the processed file
    archive_path = corrections_path + ".processed"
    shutil.move(corrections_path, archive_path)

if __name__ == "__main__":
    main()
