import os
import cv2
import numpy as np
import hashlib
from collections import defaultdict

def get_image_hash(filepath):
    hasher = hashlib.md5()
    try:
        with open(filepath, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()
    except:
        return None

def analyze_image(filepath):
    try:
        # Read image
        img = cv2.imread(filepath)
        if img is None:
            return {'broken': True}
            
        h, w = img.shape[:2]
        
        # Blur (Variance of Laplacian)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Brightness
        brightness = np.mean(gray)
        
        return {
            'broken': False,
            'resolution': (w, h),
            'aspect_ratio': w / h if h > 0 else 0,
            'blur': blur,
            'brightness': brightness
        }
    except Exception as e:
        return {'broken': True}

def main():
    raw_dir = os.path.join(os.path.dirname(__file__), "..", "datasets", "raw")
    if not os.path.exists(raw_dir):
        print(f"Raw directory not found: {raw_dir}")
        return

    datasets = [d for d in os.listdir(raw_dir) if os.path.isdir(os.path.join(raw_dir, d))]
    
    report = ["# Phase 1: Dataset Audit Report\n"]
    
    global_hashes = {}
    duplicates = []
    
    summary_table = [
        "| Dataset | Images | Classes | Quality (Broken/Dups) | Recommended |",
        "|---|---|---|---|---|"
    ]

    for dataset in datasets:
        ds_path = os.path.join(raw_dir, dataset)
        report.append(f"## Dataset: {dataset}")
        
        classes = [c for c in os.listdir(ds_path) if os.path.isdir(os.path.join(ds_path, c))]
        
        total_images = 0
        broken_count = 0
        ds_duplicates = 0
        
        blur_list = []
        brightness_list = []
        res_list = []
        
        class_dist = defaultdict(int)
        
        for cls in classes:
            cls_path = os.path.join(ds_path, cls)
            files = [f for f in os.listdir(cls_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
            
            for f in files:
                filepath = os.path.join(cls_path, f)
                total_images += 1
                class_dist[cls] += 1
                
                # Check duplicates
                img_hash = get_image_hash(filepath)
                if img_hash:
                    if img_hash in global_hashes:
                        duplicates.append((filepath, global_hashes[img_hash]))
                        ds_duplicates += 1
                    else:
                        global_hashes[img_hash] = filepath
                        
                # Analyze image
                stats = analyze_image(filepath)
                if stats.get('broken'):
                    broken_count += 1
                else:
                    blur_list.append(stats['blur'])
                    brightness_list.append(stats['brightness'])
                    res_list.append(stats['resolution'])
        
        # Report for this dataset
        report.append(f"- **Total Images**: {total_images}")
        report.append(f"- **Classes Count**: {len(classes)}")
        if total_images > 0:
            report.append(f"- **Average Brightness**: {np.mean(brightness_list):.2f}" if brightness_list else "- **Average Brightness**: N/A")
            report.append(f"- **Average Blur (Laplacian Var)**: {np.mean(blur_list):.2f}" if blur_list else "- **Average Blur**: N/A")
            report.append(f"- **Broken Images**: {broken_count}")
            report.append(f"- **Duplicates Detected**: {ds_duplicates}")
            
            report.append("\n### Class Distribution")
            for c, count in class_dist.items():
                report.append(f"- {c}: {count}")
        else:
            report.append("- *No images found.*")
            
        report.append("\n")
        
        # Recommendation logic simple heuristic
        quality = f"{broken_count} broken, {ds_duplicates} dups"
        recommended = "Yes" if total_images > 100 and broken_count < (total_images * 0.1) else "Review Required"
        if total_images == 0: recommended = "No"
        
        summary_table.append(f"| {dataset} | {total_images} | {len(classes)} | {quality} | {recommended} |")
        
    report.append("## Global Cross-Dataset Duplicates")
    report.append(f"- **Total Duplicate Pairs Found Across All Datasets**: {len(duplicates)}")
    if len(duplicates) > 0:
        report.append("\n*Sample of duplicates:*")
        for i, (f1, f2) in enumerate(duplicates[:5]):
            report.append(f"  - `{os.path.basename(f1)}` <-> `{os.path.basename(f2)}`")
            
    report.append("\n## Summary & Recommendations")
    report.extend(summary_table)
    
    report_dir = os.path.join(os.path.dirname(__file__), "..", "reports")
    os.makedirs(report_dir, exist_ok=True)
    with open(os.path.join(report_dir, "dataset_report.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(report))
        
    print("Dataset audit complete. Report generated at ai-training/reports/dataset_report.md")

if __name__ == "__main__":
    main()
