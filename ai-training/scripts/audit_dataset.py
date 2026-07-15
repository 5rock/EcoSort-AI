import os
import collections

raw_dir = 'datasets/raw'
report_path = 'reports/dataset_audit.md'

os.makedirs('reports', exist_ok=True)

report = ["# Dataset Audit Report\n\n"]

total_images = 0
label_counts = collections.defaultdict(int)

report.append("## Raw Datasets\n")
for dataset_folder in os.listdir(raw_dir):
    dataset_path = os.path.join(raw_dir, dataset_folder)
    if not os.path.isdir(dataset_path): continue
    
    report.append(f"### {dataset_folder}\n")
    
    for r, d, f in os.walk(dataset_path):
        imgs = [file for file in f if file.lower().endswith(('.jpg', '.png', '.jpeg'))]
        if len(imgs) > 0:
            label = os.path.basename(r)
            label_counts[label] += len(imgs)
            total_images += len(imgs)
            report.append(f"- **{label}**: {len(imgs)} images\n")

report.append("\n## Label Distribution Across All Datasets\n")
for label, count in sorted(label_counts.items(), key=lambda x: x[1], reverse=True):
    report.append(f"- {label}: {count}\n")

report.append(f"\n**Total Images**: {total_images}\n")

with open(report_path, 'w', encoding='utf-8') as f:
    f.writelines(report)
    
print(f"Audit complete. Report generated at {report_path}")
