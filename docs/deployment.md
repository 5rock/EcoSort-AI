# EcoSort AI: Deployment Guide

## Overview
EcoSort AI uses a complete Edge AI deployment strategy. The PyTorch model is trained in Python and exported to ONNX format. The ONNX model is then served as a static asset in the React/Vite progressive web application.

## 1. Exporting the Model
Once training is complete in `ai-training/`, run the export script:
```bash
python scripts/export_onnx.py --config configs/mobilenetv3_test.yaml
```
This automatically handles:
- Graph tracing and PyTorch ONNX export (opset 14+)
- ONNX Simplification via `onnxsim`
- Dynamic Quantization (QUInt8) to reduce model size for browser delivery
- Copying `waste_classifier.onnx` and `waste_classes.json` directly to `apps/web/public/models/`

## 2. Browser Integration
The React application loads the ONNX model using a Web Worker (`apps/web/src/ai/engine/worker.ts`).
- **ONNX Runtime Web:** We use `onnxruntime-web` to execute the model using WebGPU (fallback to WebAssembly).
- **Concurrency Guard:** The AI Engine implements an initialization lock to prevent React 18 Strict Mode from spawning duplicate sessions.
- **WASM Threading:** WebAssembly threading is configured robustly to fetch the correct SIMD binaries.

## 3. Post-Processing & Intelligence
The raw logits from the ONNX model are processed locally:
1. **Temperature Scaling:** Applied to soften extreme confidence values.
2. **Top-5 Voting:** Reduces jitter and stabilizes the prediction.
3. **Waste Intelligence Engine:** Maps the raw class to detailed actionable insights (Bin, EcoScore, Carbon saved) using local JSON databases.

## 4. Production Build
Build the web application normally:
```bash
cd apps/web
npm run build
```
The ONNX models are copied into the final `dist/` bundle automatically since they live in `public/`.
