# Full AI Pipeline Audit

## Inspection Targets
- `aiEngine.ts`
- `worker.ts`
- `imageProcessor.ts`
- `wasteIntelligence.ts`
- `mapper.ts`
- `confidence.ts`

## Discovered Bottlenecks and Flaws

1. **Category Voting (Phase 10)**
   - **Current State:** `worker.ts` uses `calculateGroupScore` (Top-5 Voting) ONLY when the fallback `ImageNet` model is used. For the `isNativeWasteModel`, it strictly uses the Top-1 result.
   - **Required Fix:** Strip all ImageNet logic. Re-route the native waste model predictions through a Top-5 grouping vote to resolve ambiguous confidences (e.g. 50% bottle, 40% plastic bag -> 90% plastic).

2. **Quality Gates (Phase 11)**
   - **Current State:** `imageProcessor.ts` throws a hard exception (`throw new Error('QUALITY_ERROR: IMAGE_TOO_DARK')`) if brightness < 30, > 240, or blur < 15. This aborts inference entirely.
   - **Required Fix:** Remove exceptions. Compute the `Quality Score`, pass it back to the UI as a warning flag, but proceed with inference.

3. **Confidence Calibration (Phase 9)**
   - **Current State:** `worker.ts` runs a standard `softmax` over the raw float32 logits. The resulting probability is passed directly to `confidence.ts`. Softmax probabilities from uncalibrated neural networks are notoriously overconfident.
   - **Required Fix:** Implement Temperature Scaling ($T$) before softmax to smooth the probability distribution.

4. **Browser Optimization (Phase 13)**
   - **Current State:** The ONNX `InferenceSession` is stored in a global `activeModel` variable. However, tensor memory is not explicitly freed (`tensor.dispose()`). Also, we create new `Float32Array` on every frame.
   - **Required Fix:** Cache the input tensor if possible, and ensure the session is efficiently utilized without leaks.

5. **Legacy Code (Phase 16)**
   - **Current State:** `mapper.ts` maps ImageNet IDs (like `n01440764`). `modelLoader.ts` attempts to load `mobilenetv2-7.onnx` and `imagenet_classes.json` on fallback.
   - **Required Fix:** Delete `SYNONYM_GROUPS` for ImageNet. Delete ImageNet model loading. Delete fallback logic.

6. **Model Warmup (Phase 12)**
   - **Current State:** `aiEngine.ts` calls `INIT` on the worker, which loads the session, but it doesn't run a forward pass. The very first frame scanned takes 1000ms+ because WebGPU/WASM compiles shaders on the first `session.run()`.
   - **Required Fix:** Add a dummy tensor `[1, 3, 224, 224]` pass during the `INIT` phase.

Audit Complete. Proceeding to Phase 2 (Dataset Audit).
