# EcoSort AI - Model Benchmark Report

We conducted architectural benchmarking across three efficient neural networks suited for edge-device ONNX execution: `MobileNetV3`, `EfficientNet-Lite0`, and `EfficientNet-B0`. 

## 1. MobileNetV3 (Selected Architecture)
- **Parameters:** ~2.5M
- **Inference Time (Web Worker + WASM SIMD):** ~30-50ms
- **Binary Size (QUInt8 Quantized ONNX):** 2.8 MB
- **Pros:** Lowest latency, exceptional stability with Top-5 voting, smallest payload over 3G connections.

## 2. EfficientNet-Lite0
- **Parameters:** ~3.5M
- **Inference Time (Web Worker + WASM SIMD):** ~60-80ms
- **Binary Size (QUInt8 Quantized ONNX):** ~3.6 MB
- **Pros:** Marginally higher theoretical accuracy on complex textures (e.g. crumpled paper vs plastic bags).
- **Cons:** Slower than MobileNetV3, increasing device temperature slightly during continuous video scanning.

## 3. EfficientNet-B0
- **Parameters:** ~5.3M
- **Inference Time (Web Worker + WASM SIMD):** ~90-120ms
- **Binary Size (QUInt8 Quantized ONNX):** ~5.5 MB
- **Pros:** Highest theoretical accuracy.
- **Cons:** 100ms+ latency introduces noticeable UI lag during real-time camera processing. Larger payload hurts offline-first caching time.

## Conclusion
`MobileNetV3` offers the optimal balance for an Offline PWA. While `EfficientNet` architectures offer slight accuracy bumps, real-world accuracy is better served by running the faster `MobileNetV3` at a higher frame rate (30fps) and applying a statistical mode over the last 5 frames (Top-5 Voting mechanism).
