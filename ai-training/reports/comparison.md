# Model Architecture Comparison

For RC3, we evaluated three primary architectures for offline browser execution via ONNX.

| Model | Size (ONNX) | Speed (WASM) | Speed (WebGPU) | Theoretical Acc | Best For |
|---|---|---|---|---|---|
| **MobileNetV3 Small** | ~6 MB | ~150 ms | ~40 ms | 68% ImageNet | Browsers, Low-end devices |
| **EfficientNet-Lite0** | ~14 MB | ~280 ms | ~85 ms | 75% ImageNet | Edge TPUs, High-end phones |
| **EfficientNet-B0** | ~21 MB | ~400 ms | ~120 ms | 77% ImageNet | Accuracy over speed |

## Conclusion
We standardized on **MobileNetV3 Small** for the RC3 Hackathon submission. 
- WebAssembly (which runs on all devices including iOS Safari) has strict memory and threading constraints. 
- MobileNetV3 fits effortlessly into memory, doesn't lock the UI thread (runs in a Worker), and executes fast enough to support the "Top-5 Voting Sliding Window" without dropping frames.
- Dynamic QUInt8 Quantization drops the size to ~2-3 MB, which is instantly cached by the Vite PWA Service Worker.
