# AI Evaluation & Browser Validation

## Evaluation Methodology
Evaluation is performed in two stages:
1. **Python Validation Loop**: Evaluates PyTorch tensors strictly on Accuracy, Precision, Recall, and F1 per class.
2. **Browser End-to-End Validation**: Evaluates the exported ONNX model within the React application handling raw image bytes, Canvas 2D resizing, and WebWorker message passing.

## Quality Gates Added
To prevent catastrophic failures in production, the following evaluations were added:
- **Brightness Variance & Blur Detection**: The frontend `imageProcessor.ts` calculates image variance. If it falls below a threshold, the model still infers but emits `warnings` (e.g., "IMAGE_TOO_BLURRY") to guide the user.
- **Top-5 Voting mechanism**: Reduces single-frame inference jitter by storing a sliding window of the last 5 results.
- **Temperature Scaling**: `softmaxWithTemperature(1.5)` prevents the model from outputting `99.99%` confidence on completely out-of-distribution images, yielding a calibrated `[0.0 - 1.0]` confidence score.

## Result
The UI gracefully degrades. If the confidence is below 35%, it outputs `Uncertain` and triggers the manual override UI, ensuring users always get correct recycling data.
