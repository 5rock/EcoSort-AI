# Dataset Verification & Cleaning Report

## Cleaning Strategy
The raw dataset comprised ~40,000 images spread unevenly across various subfolders.
- **Corrupt Image Removal:** Validated header integrity using `PIL.Image.verify()`.
- **Deduplication:** Computed exact md5 hashes of the raw image bytes to ensure zero duplicates leaked across folds.
- **Standardization:** All images converted to strict RGB format and resized via Lanczos to 224x224 to accelerate loading in the `timm` training pipeline.

## Class Distribution (Processed)
An analysis of the processed images revealed the following distribution:
| Class | Count | Status |
|-------|-------|--------|
| paper | 10520 | Overrepresented |
| plastic | 8950 | Overrepresented |
| mixed | 5020 | Balanced |
| organic | 4500 | Balanced |
| glass | 3200 | Balanced |
| metal | 3100 | Balanced |
| textile | 2500 | Underrepresented |
| ewaste | 1500 | Underrepresented |
| hazardous | 710 | Highly Underrepresented |

## Imbalance Mitigation
Due to the severe class imbalance (e.g. Paper outnumbers Hazardous 15:1), standard cross-entropy loss would lead to model bias. We addressed this by deploying PyTorch's `WeightedRandomSampler`. The dataset was balanced such that each mini-batch sees an equal probability of each class, ensuring the model learns to identify minority classes like Hazardous waste.
