# Model Card: EcoSort AI Waste Classifier

## Model Details
- **Architecture**: EfficientNet-Lite0 (Baseline: MobileNetV3 Small)
- **Framework**: PyTorch -> ONNX -> ONNX Runtime Web
- **Input Size**: 224x224 RGB
- **Quantization**: INT8 Dynamic Quantization

## Intended Use
- **Primary Use Case**: On-device browser classification of household waste into recycling categories.
- **Out of Scope**: Medical waste, industrial hazardous materials, highly complex overlapping objects.

## Training Data
- **Source**: Merged and cleaned "Garbage classification" dataset.
- **Classes**: Plastic, Glass, Metal, Paper, Organic, Hazardous, E-Waste, Mixed.
- **Size**: 2,524 images.

## Performance Metrics
- **Top-1 Accuracy**: 94.5%
- **Top-3 Accuracy**: 98.2%
- **F1 Score**: 94.0%
- **Browser Inference**: ~15ms (WebGPU), ~65ms (WASM)

## Limitations & Biases
- **Lighting Conditions**: Accuracy drops in extreme low light.
- **Geographic Bias**: Datasets were predominantly Western packaging; may struggle with localized regional packaging.

## Active Learning
- Users can flag incorrect predictions via the "Low Confidence Mode" UI.
- These corrections are saved to `corrections.json` and merged into the next training run to continuously improve the model.
