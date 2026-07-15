# Model Card: EcoSort AI Waste Classifier v2

## Model Details
- **Architecture:** MobileNetV3 Small (also supported: EfficientNet-B0, EfficientNet-Lite0)
- **Framework:** PyTorch -> ONNX
- **Classes:** 9 (Plastic, Glass, Metal, Paper, Organic, Hazardous, E-Waste, Textile, Mixed)
- **Input Size:** 224x224 RGB
- **Output:** Softmax probabilities (Temperature Scaled for calibration)

## Intended Use
EcoSort AI is designed to classify waste items from user-uploaded images in a progressive web application. It runs locally on the edge (in the browser) via ONNX Runtime Web, ensuring privacy and offline-first capabilities.

## Training Data
Trained on a curated, balanced subset of multi-class garbage datasets containing real-world images of waste items in various lighting conditions and angles. Data is heavily augmented during training (rotations, blurs, noise, color jitter) to improve generalization on low-quality mobile camera inputs.

## Performance (Dry Run / Validation)
- **Accuracy:** 1.000 (Overfitted on subset dry-run for validation)
- **Loss:** 0.0038
- **Inference Time (Browser):** ~100-300ms on WebAssembly/WebGPU.

## Limitations
- Performance may degrade on poorly lit or heavily blurred images ( mitigated via UI Quality Warnings).
- Hazardous and E-Waste items can be ambiguous; the model outputs low-confidence warnings in these cases.

## Ethics and Sustainability
By running entirely on-device, EcoSort AI eliminates the carbon footprint associated with cloud API calls and data transmission, aligning with OSDHack's focus on sustainability.
