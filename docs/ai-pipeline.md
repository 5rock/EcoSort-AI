# AI Pipeline Architecture

The EcoSort AI pipeline is designed for offline, low-latency execution directly within the user's browser environment.

## 1. Web Worker Sandbox
Because ONNX inference and image tensor manipulation can block the main UI thread, all AI operations are sandboxed in a dedicated Web Worker (`aiEngine.worker.ts`). The main thread communicates with the worker via an asynchronous message-passing interface (`aiEngine.ts`).

## 2. Model Loading
Upon application startup, the Web Worker initializes an ONNX Runtime Web session.
- The model `mobilenetv2.onnx` is fetched from the static `public/models/` directory.
- WebAssembly (WASM) is utilized as the primary execution provider.
- A dummy pixel is processed to "warm up" the model, preventing latency spikes on the first actual user scan.

## 3. Inference Pipeline
When the user clicks "Analyze Waste":
1. The captured base64 image is passed to the Web Worker.
2. An HTML `OffscreenCanvas` is used to resize the image to `224x224`.
3. The image data is normalized and converted into a `Float32Array` tensor.
4. `session.run()` executes the model.
5. Softmax is applied to extract confidence scores across the 8 waste classes.
6. The highest confidence result is returned to the main thread.

## 4. Waste Intelligence Layer (`wasteIntelligence.ts`)
The AI engine only outputs a raw classification (e.g., "Plastic", `0.85`). The Waste Intelligence layer takes this result and enriches it:
- Maps the category to regional recycling rules (e.g., specific bin colors for Europe vs. USA).
- Handles edge cases: If the confidence is below 50%, the item is flagged as a "Possible Match" to warn the user of uncertainty.
- Injects sustainability metrics and preparation instructions.
