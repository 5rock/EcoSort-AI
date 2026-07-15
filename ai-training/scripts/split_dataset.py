import os
import shutil
import random
import glob

def main():
    base_dir = os.path.join(os.path.dirname(__file__), "..")
    processed_dir = os.path.join(base_dir, "datasets", "processed")
    train_dir = os.path.join(base_dir, "datasets", "train")
    val_dir = os.path.join(base_dir, "datasets", "validation")
    test_dir = os.path.join(base_dir, "datasets", "test")
    
    classes = [c for c in os.listdir(processed_dir) if os.path.isdir(os.path.join(processed_dir, c))]
    
    report = ["# Phase 4: Dataset Split Report\n", "| Class | Train (70%) | Validation (15%) | Test (15%) | Total |", "|---|---|---|---|---|"]
    
    total_train = 0
    total_val = 0
    total_test = 0
    
    for c in classes:
        os.makedirs(os.path.join(train_dir, c), exist_ok=True)
        os.makedirs(os.path.join(val_dir, c), exist_ok=True)
        os.makedirs(os.path.join(test_dir, c), exist_ok=True)
        
        # Read all images
        cls_path = os.path.join(processed_dir, c)
        images = [f for f in os.listdir(cls_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        # Shuffle with a fixed seed for reproducibility
        random.seed(42)
        random.shuffle(images)
        
        n = len(images)
        if n == 0:
            continue
            
        train_split = int(n * 0.70)
        val_split = int(n * 0.15)
        
        train_imgs = images[:train_split]
        val_imgs = images[train_split:train_split + val_split]
        test_imgs = images[train_split + val_split:]
        
        # Copy to destinations
        for img in train_imgs:
            shutil.copy2(os.path.join(cls_path, img), os.path.join(train_dir, c, img))
        for img in val_imgs:
            shutil.copy2(os.path.join(cls_path, img), os.path.join(val_dir, c, img))
        for img in test_imgs:
            shutil.copy2(os.path.join(cls_path, img), os.path.join(test_dir, c, img))
            
        total_train += len(train_imgs)
        total_val += len(val_imgs)
        total_test += len(test_imgs)
        
        report.append(f"| {c} | {len(train_imgs)} | {len(val_imgs)} | {len(test_imgs)} | {n} |")
        
    report.append(f"| **Total** | **{total_train}** | **{total_val}** | **{total_test}** | **{total_train + total_val + total_test}** |")
    
    report_path = os.path.join(base_dir, "reports", "split_report.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report))
        
    print(f"Dataset split complete. Generated report at ai-training/reports/split_report.md")

if __name__ == "__main__":
    main()
