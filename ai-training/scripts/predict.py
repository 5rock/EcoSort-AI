import os
import sys
import json
import torch
import torch.nn as nn
import torchvision.models as models
from PIL import Image
import yaml
import albumentations as A
from albumentations.pytorch import ToTensorV2

current_dir = os.path.dirname(__file__)

def get_transforms(img_size):
    return A.Compose([
        A.Resize(img_size, img_size),
        A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
        ToTensorV2()
    ])

def predict(image_path, config_path):
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
        
    base_dir = os.path.join(current_dir, "..")
    checkpoint_dir = os.path.join(base_dir, "models", "checkpoints")
    
    class_idx_path = os.path.join(checkpoint_dir, f"{config['MODEL_NAME']}_class_indices.json")
    with open(class_idx_path, 'r') as f:
        class_to_idx = json.load(f)
        
    idx_to_class = {v: k for k, v in class_to_idx.items()}
    test_transform = get_transforms(config['IMAGE_SIZE'])
    device = torch.device("cpu")
    
    # Initialize model without pretrained weights to avoid downloading
    num_classes = len(class_to_idx)
    model = models.mobilenet_v3_small(weights=None)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, num_classes)
    model = model.to(device)
    
    model_path = os.path.join(checkpoint_dir, f"{config['MODEL_NAME']}_best_model.pt")
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
    else:
        print(f"Error: {model_path} not found.")
        return
        
    model.eval()
    
    try:
        import numpy as np
        image = Image.open(image_path).convert('RGB')
        image_np = np.array(image)
    except Exception as e:
        print(f"Error loading image: {e}")
        return
        
    augmented = test_transform(image=image_np)
    input_tensor = augmented['image'].unsqueeze(0).to(device)
    
    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        
    top3_prob, top3_catid = torch.topk(probs, 3)
    
    print(f"\n--- Prediction Results for {os.path.basename(image_path)} ---")
    print(f"Model: {config['MODEL_NAME']}")
    print("-" * 50)
    
    for i in range(top3_prob.size(1)):
        prob = top3_prob[0, i].item() * 100
        cat_id = top3_catid[0, i].item()
        class_name = idx_to_class[cat_id]
        print(f"{i+1}. {class_name:<15} : {prob:.2f}% confidence")
    print("-" * 50)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python predict.py <path_to_image> <path_to_config>")
        sys.exit(1)
        
    image_path = sys.argv[1]
    config_path = sys.argv[2]
    predict(image_path, config_path)
