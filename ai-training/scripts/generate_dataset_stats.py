import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from collections import defaultdict

PROCESSED_DIR = 'datasets/processed'
target_classes = ['plastic', 'glass', 'paper', 'metal', 'organic', 'ewaste', 'hazardous', 'textile', 'mixed']

processed_counts = defaultdict(int)

for label in target_classes:
    folder = os.path.join(PROCESSED_DIR, label)
    if os.path.exists(folder):
        processed_counts[label] = len([f for f in os.listdir(folder) if f.endswith(('.jpg', '.jpeg', '.png'))])

stats = []
for label in target_classes:
    count = processed_counts.get(label, 0)
    stats.append({"Class": label, "Count": count})

df = pd.DataFrame(stats)
os.makedirs('reports', exist_ok=True)
df.to_csv('reports/dataset_statistics.csv', index=False)

plt.figure(figsize=(10, 6))
sns.barplot(data=df, x='Class', y='Count', palette='viridis')
plt.title('Dataset Class Distribution')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('reports/class_distribution.png')
plt.close()

print("Dataset statistics and distribution plot generated successfully.")
