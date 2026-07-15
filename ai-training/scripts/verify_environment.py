import sys
print(f"Python Version: {sys.version}")

try:
    import torch
    print(f"[OK] PyTorch version: {torch.__version__}")
    print(f"[OK] CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"   GPU Name: {torch.cuda.get_device_name(0)}")
    else:
        print("   Using CPU-only PyTorch.")
except ImportError:
    print("[FAIL] Failed to import torch")

try:
    import torchvision
    print(f"[OK] TorchVision version: {torchvision.__version__}")
except ImportError:
    print("[FAIL] Failed to import torchvision")

try:
    import albumentations
    print(f"[OK] Albumentations version: {albumentations.__version__}")
except ImportError:
    print("[FAIL] Failed to import albumentations")

try:
    import onnx
    print(f"[OK] ONNX version: {onnx.__version__}")
except ImportError:
    print("[FAIL] Failed to import onnx")

try:
    import onnxruntime as ort
    print(f"[OK] ONNX Runtime version: {ort.__version__}")
except ImportError:
    print("[FAIL] Failed to import onnxruntime")

try:
    import numpy as np
    print(f"[OK] NumPy version: {np.__version__}")
except ImportError:
    print("[FAIL] Failed to import numpy")

try:
    import cv2
    print(f"[OK] OpenCV version: {cv2.__version__}")
except ImportError:
    print("[FAIL] Failed to import cv2")

try:
    import PIL
    print(f"[OK] PIL (Pillow) version: {PIL.__version__}")
except ImportError:
    print("[FAIL] Failed to import PIL")

try:
    import sklearn
    print(f"[OK] Scikit-Learn version: {sklearn.__version__}")
except ImportError:
    print("[FAIL] Failed to import sklearn")

print("\nEnvironment verification complete.")
