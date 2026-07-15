# Full AI Pipeline Audit

## Architecture Overview
The EcoSort AI ML pipeline represents a complete edge-AI architecture for web browsers.

### Training (`ai-training/`)
- **Preprocessing:** Resizes inputs to 224x224 RGB.
- **Augmentation (Albumentations):** Adds MotionBlur, ColorJitter, Rotation, and CoarseDropout to simulate poor mobile camera conditions.
- **Data Loaders:** Modified to use `WeightedRandomSampler` to handle class imbalances, ensuring minor classes (e.g. Hazardous) aren't ignored.
- **Training Strategy:** Now utilizes **5-Fold Cross Validation** via `sklearn.model_selection.KFold` and automates Hyperparameter tuning to select optimal learning rates and optimizers.
- **Validation:** Records top-1, top-5 accuracy, and saves Misclassifications to `reports/hard_examples` for manual review.
- **Export:** PyTorch models trace to ONNX, simplify via `onnxsim`, and dynamically quantize (QUInt8), yielding < 3MB binaries.

### Browser Inference (`apps/web/src/ai/`)
- **Engine Context:** Encapsulated inside a Web Worker. A singleton lock prevents React 18 strict mode double-initializations.
- **Quality Gates:** Before ONNX inference, image brightness and blur are calculated. If the image is extremely blurry, inference proceeds but a warning is flagged.
- **Calibration:** Output logits are temperature-scaled (`T=1.5`).
- **Stabilization:** A Top-5 Voting algorithm (sliding window) stabilizes live video feed predictions.
- **Mapping:** The `Waste Intelligence Engine` links local json databases to provide bin assignments, EcoScores, and Carbon offset metrics.

## Cleanups Performed
- Removed legacy `ImageNet` class mappings.
- Replaced the generic `MobileNetV2` mock implementation with an actual custom trained `MobileNetV3` architecture.
- Re-routed worker paths from relative to absolute blobs to solve offline loading failures.
