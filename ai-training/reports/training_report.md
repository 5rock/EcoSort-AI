# EcoSort AI - Training Report

## Environment Recommendation
> [!TIP]
> The training pipeline has been successfully validated through dry runs, ONNX exports, and hyperparameter search loops. Full training on the complete dataset is expected to take many hours (or days) on CPU. **A CUDA-enabled GPU is strongly recommended** to significantly reduce training time and enable rapid experimentation with multiple models and hyperparameters.

## Training Pipeline Enhancements
- **Hyperparameter Search:** Added an automated Grid/Random Search algorithm that iteratively tests combinations of `Learning Rate`, `Batch Size`, `Weight Decay`, and `Optimizer` to discover the mathematically superior configuration before executing the final training loop.
- **K-Fold Cross Validation:** Migrated from a static 80/20 train/test split to a rigorous 5-Fold Cross Validation scheme (`sklearn.model_selection.KFold`), yielding highly trustworthy accuracy estimates.
- **Mixed Precision (AMP):** Integrated `torch.cuda.amp.autocast` to slice VRAM usage in half on supported hardware, unlocking larger batch sizes without Out-of-Memory crashes.
- **Early Stopping:** Integrated patience counters to halt training automatically when the validation loss plateaus, preserving the best epoch weights and preventing overfitting.

## How to Execute Production Training
1. Clone the repository onto a CUDA instance.
2. Install requirements (`pip install -r requirements.txt`).
3. Run Hyperparameter search: `python scripts/train.py --config configs/mobilenetv3_test.yaml --hyperopt`
4. Run Full 5-Fold Training: `python scripts/train.py --config configs/mobilenetv3_test.yaml --kfold`
