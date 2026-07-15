# EcoSort AI Datasets

This directory contains metadata and tooling to support the training, fine-tuning, and export of computer vision models used by EcoSort AI.

## Dataset Sources

For a comprehensive waste classification model, the following external datasets are recommended for future training pipelines:

- [TrashNet](https://github.com/garythung/trashnet) (Common academic waste classification dataset)
- [TACO (Trash Annotations in Context)](http://tacodataset.org/) (Real-world litter images)
- [Open Images](https://storage.googleapis.com/openimages/web/index.html) (General objects for robust background/negative examples)

*Note: Please review and comply with each dataset's respective license before downloading and redistributing the raw images.*

## Supported Classes

Our model is trained to recognize the following 8 core waste categories:
1. Plastic
2. Glass
3. Paper
4. Metal
5. Organic
6. E-Waste
7. Hazardous
8. Mixed

## Future Model Training Process

While EcoSort AI is fully functional with its current MobileNetV2 architecture, the `training/` directory contains scaffolding for extending the model:

1. Add your custom/downloaded images to the respective folders in `samples/`.
2. Install the necessary python dependencies: `pip install -r training/requirements.txt`
3. Run the training script: `python training/train.py`
4. Export the resulting PyTorch/TensorFlow model to ONNX format: `python training/export_onnx.py`
5. Place the exported `.onnx` file in `apps/web/public/models/` for offline web inference.
