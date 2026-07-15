import os
import json
import shutil
import hashlib
from PIL import Image
from collections import defaultdict
from sklearn.model_selection import train_test_split
from tqdm import tqdm

RAW_DIR = 'datasets/raw'
PROCESSED_DIR = 'datasets/processed'
TRAIN_DIR = 'datasets/train'
VAL_DIR = 'datasets/validation'
MAPPING_FILE = 'configs/class_mapping.json'
REPORT_CLEAN = 'reports/cleaning_report.md'
REPORT_BALANCE = 'reports/balance_report.md'

os.makedirs('reports', exist_ok=True)

with open(MAPPING_FILE, 'r') as f:
    mapping = json.load(f)

# Clear old processed/train/val
for d in [PROCESSED_DIR, TRAIN_DIR, VAL_DIR]:
    if os.path.exists(d):
        shutil.rmtree(d)
    os.makedirs(d)

target_classes = ['plastic', 'glass', 'paper', 'metal', 'organic', 'ewaste', 'hazardous', 'textile', 'mixed']
for tc in target_classes:
    os.makedirs(os.path.join(PROCESSED_DIR, tc), exist_ok=True)
    os.makedirs(os.path.join(TRAIN_DIR, tc), exist_ok=True)
    os.makedirs(os.path.join(VAL_DIR, tc), exist_ok=True)

image_hashes = set()
duplicates_removed = 0
corrupt_removed = 0
processed_counts = defaultdict(int)

# Phase 3 & 4
images_to_process = []
for r, d, f in os.walk(RAW_DIR):
    for file in f:
        if file.lower().endswith(('.jpg', '.png', '.jpeg')):
            images_to_process.append(os.path.join(r, file))

import concurrent.futures
from threading import Lock

lock = Lock()

def process_single_image(img_path):
    global duplicates_removed, corrupt_removed, processed_counts
    raw_label = os.path.basename(os.path.dirname(img_path))
    mapped_label = mapping.get(raw_label, "mixed")
    if mapped_label not in target_classes:
        return
        
    try:
        with Image.open(img_path) as img:
            img.verify()
        with Image.open(img_path) as img:
            img = img.convert('RGB')
            img = img.resize((224, 224), Image.Resampling.LANCZOS)
            
            img_bytes = img.tobytes()
            h = hashlib.md5(img_bytes).hexdigest()
            
            with lock:
                if h in image_hashes:
                    duplicates_removed += 1
                    return
                image_hashes.add(h)
                
            save_path = os.path.join(PROCESSED_DIR, mapped_label, f"{h}.jpg")
            img.save(save_path, 'JPEG', quality=85)
            
            with lock:
                processed_counts[mapped_label] += 1
                
    except Exception:
        with lock:
            corrupt_removed += 1

print(f"Cleaning and Standardizing {len(images_to_process)} datasets with Multiprocessing...")
with concurrent.futures.ThreadPoolExecutor(max_workers=os.cpu_count()) as executor:
    list(tqdm(executor.map(process_single_image, images_to_process), total=len(images_to_process)))

with open(REPORT_CLEAN, 'w', encoding='utf-8') as f:
    f.write("# Dataset Cleaning Report\n")
    f.write(f"- **Total Initial Images**: {len(images_to_process)}\n")
    f.write(f"- **Duplicates Removed**: {duplicates_removed}\n")
    f.write(f"- **Corrupt/Unreadable Removed**: {corrupt_removed}\n")
    f.write(f"- **Total Cleaned Images**: {sum(processed_counts.values())}\n")

print("Splitting dataset...")
# Splitting logic
y = []
X = []
for label in target_classes:
    folder = os.path.join(PROCESSED_DIR, label)
    for file in os.listdir(folder):
        X.append(os.path.join(folder, file))
        y.append(label)

X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

for src, label in zip(X_train, y_train):
    shutil.copy(src, os.path.join(TRAIN_DIR, label, os.path.basename(src)))

for src, label in zip(X_val, y_val):
    shutil.copy(src, os.path.join(VAL_DIR, label, os.path.basename(src)))

with open(REPORT_BALANCE, 'w', encoding='utf-8') as f:
    f.write("# Class Balancing Report\n\n")
    f.write("## Distribution after cleaning\n")
    for label, count in processed_counts.items():
        f.write(f"- **{label}**: {count}\n")
    
    f.write("\n## Imbalance Mitigation Strategy\n")
    f.write("Because there is a natural imbalance in the data, the PyTorch `WeightedRandomSampler` will be used in `train.py` to ensure each batch sees an equal probability of each class.\n")

print("Generating dataset statistics and distribution plot...")
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

stats = []
for label in target_classes:
    count = processed_counts.get(label, 0)
    stats.append({"Class": label, "Count": count})

df = pd.DataFrame(stats)
df.to_csv('reports/dataset_statistics.csv', index=False)

plt.figure(figsize=(10, 6))
sns.barplot(data=df, x='Class', y='Count', palette='viridis')
plt.title('Dataset Class Distribution')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('reports/class_distribution.png')
plt.close()

print("Data cleaning and splitting complete.")
