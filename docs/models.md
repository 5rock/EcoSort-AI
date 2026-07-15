# EcoSort AI Models

This document outlines the architecture, pipeline, and usage of machine learning models in EcoSort AI.

## Current Model (MobileNetV2)

The current production model is a lightweight convolutional neural network based on **MobileNetV2**, optimized for edge inference in web browsers via ONNX Runtime Web.

- **Architecture**: MobileNetV2
- **Format**: ONNX (`mobilenetv2.onnx`)
- **Location**: `apps/web/public/models/mobilenetv2.onnx`
- **Input Shape**: `[1, 3, 224, 224]` (Batch, Channels, Height, Width)
- **Output Classes**: 8 (Plastic, Glass, Paper, Metal, Organic, E-Waste, Hazardous, Mixed)

## Why ONNX Runtime Web?

We utilize ONNX Runtime Web for several reasons:
1. **Offline First**: The model runs entirely in the user's browser, requiring no backend API calls.
2. **Privacy**: Images are processed locally and never sent to a server.
3. **Performance**: Leverages WebAssembly (WASM) and WebGL/WebGPU for hardware-accelerated inference.

## The AI Pipeline

1. **Capture**: The user captures an image using the React Webcam component.
2. **Pre-processing**: The image is resized to `224x224`, normalized (mean/std subtraction matching ImageNet), and converted to a Float32Array tensor.
3. **Inference**: The Web Worker runs `session.run()` with the input tensor.
4. **Post-processing**: Softmax is applied to the output logits to get confidence probabilities.
5. **Mapping**: The top-scoring class is mapped to our regional waste rules JSON to provide recycling instructions.
6. **Thresholding**: If the confidence is below 50%, the result is flagged as a "Possible Match" to warn the user.

## Future Plans

The `datasets/` folder contains scaffolding for training and exporting custom models. Future iterations may explore:
- **EfficientNet-Lite**: For better accuracy-to-size ratios.
- **YOLOv8 (Object Detection)**: To draw bounding boxes around multiple waste items in a single frame.
- **Quantization**: INT8 quantization to reduce the model size further.
