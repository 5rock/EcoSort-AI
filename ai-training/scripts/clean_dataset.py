import os
import cv2
import json
import hashlib
import yaml

def get_image_hash(filepath):
    hasher = hashlib.md5()
    try:
        with open(filepath, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()
    except:
        return None

def load_config():
    config_path = os.path.join(os.path.dirname(__file__), "..", "configs", "config.yaml")
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return yaml.safe_load(f)
    return {"IMAGE_SIZE": 224, "TARGET_FORMAT": "jpg"}

def main():
    base_dir = os.path.join(os.path.dirname(__file__), "..")
    raw_dir = os.path.join(base_dir, "datasets", "raw", "Garbage classification")
    processed_dir = os.path.join(base_dir, "datasets", "processed")
    metadata_path = os.path.join(base_dir, "datasets", "metadata", "class_mapping.json")
    
    with open(metadata_path, 'r') as f:
        class_mapping = json.load(f)
        
    config = load_config()
    target_size = (config.get("IMAGE_SIZE", 224), config.get("IMAGE_SIZE", 224))
    
    os.makedirs(processed_dir, exist_ok=True)
    for mapped_class in set(class_mapping.values()):
        os.makedirs(os.path.join(processed_dir, mapped_class), exist_ok=True)
        
    report = ["# Phase 2: Dataset Cleaning Report\n"]
    
    global_hashes = set()
    processed_count = 0
    duplicate_count = 0
    broken_count = 0
    
    classes = [c for c in os.listdir(raw_dir) if os.path.isdir(os.path.join(raw_dir, c))]
    
    for cls in classes:
        mapped_cls = class_mapping.get(cls)
        if not mapped_cls:
            print(f"Skipping unknown class: {cls}")
            continue
            
        cls_path = os.path.join(raw_dir, cls)
        files = [f for f in os.listdir(cls_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
        
        for f in files:
            filepath = os.path.join(cls_path, f)
            img_hash = get_image_hash(filepath)
            
            if not img_hash or img_hash in global_hashes:
                duplicate_count += 1
                continue
                
            global_hashes.add(img_hash)
            
            img = cv2.imread(filepath)
            if img is None:
                broken_count += 1
                continue
                
            # Convert to RGB (OpenCV loads in BGR)
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Resize
            img_resized = cv2.resize(img_rgb, target_size)
            
            # Save (convert back to BGR for imwrite)
            img_bgr_save = cv2.cvtColor(img_resized, cv2.COLOR_RGB2BGR)
            
            # We enforce a unique naming scheme to avoid overwrites
            # format: rawcls_filename
            new_filename = f"{cls}_{f.split('.')[0]}.jpg"
            save_path = os.path.join(processed_dir, mapped_cls, new_filename)
            
            cv2.imwrite(save_path, img_bgr_save)
            processed_count += 1
            
    report.append(f"- **Total Images Processed and Saved**: {processed_count}")
    report.append(f"- **Duplicates Removed**: {duplicate_count}")
    report.append(f"- **Broken/Unreadable Removed**: {broken_count}")
    report.append(f"- **Image Size**: {target_size[0]}x{target_size[1]}")
    
    report_path = os.path.join(base_dir, "reports", "cleaning_report.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report))
        
    print(f"Dataset cleaning complete. Saved {processed_count} images to datasets/processed.")

if __name__ == "__main__":
    main()
