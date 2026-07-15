# EcoSort AI - Training Pipeline

This directory contains the production-quality machine learning pipeline for training the EcoSort custom waste classifier.

## Environment Setup
1. **Python version**: Python 3.11.x is required.
2. **Virtual Environment**:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Pipeline Execution

The pipeline is split into logical phases:

### 1. Data Preparation
- `scripts/clean_dataset.py`: Audits and removes corrupted or invalid images from `datasets/raw/`, outputting to `datasets/processed/`.
- `scripts/split_dataset.py`: Splits processed images into `train/` and `validation/` sets.

### 2. Training
- `scripts/train.py --config configs/dryrun.yaml`: Trains a model (e.g. MobileNetV3) on the split dataset using PyTorch. Saves checkpoints to `models/checkpoints/`. Includes dynamic mixed precision and data augmentation.

### 3. ONNX Export
- `scripts/export_onnx.py --config configs/dryrun.yaml`: Loads the best PyTorch checkpoint and exports an optimized, quantized ONNX graph (`mobilenetv3_quantized.onnx`).
- The exported model is automatically copied to `apps/web/public/models/waste_classifier.onnx` for browser consumption.

## Configuration
Hyperparameters are managed via YAML files in `configs/`.

## Output
Training outputs are logged to `logs/` and `reports/`.

---
*Built for the OSDHack Hackathon Submission (RC2).*