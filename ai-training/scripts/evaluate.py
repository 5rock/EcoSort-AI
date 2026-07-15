import os
import argparse
import yaml
import json
import torch
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
import numpy as np

# We import from train.py to reuse Dataset and Model building
from train import WasteDataset, get_transforms, get_model

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, required=True, help="Path to YAML config")
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
        
    base_dir = os.path.join(os.path.dirname(__file__), "..")
    test_dir = os.path.join(base_dir, "datasets", "test")
    checkpoint_dir = os.path.join(base_dir, "models", "checkpoints")
    report_dir = os.path.join(base_dir, "reports")
    os.makedirs(report_dir, exist_ok=True)
    
    class_idx_path = os.path.join(checkpoint_dir, f"{config['MODEL_NAME']}_class_indices.json")
    with open(class_idx_path, 'r') as f:
        class_to_idx = json.load(f)
        
    test_transform = get_transforms(config['IMAGE_SIZE'], is_train=False)
    test_dataset = WasteDataset(test_dir, transform=test_transform)
    test_loader = DataLoader(test_dataset, batch_size=config['BATCH_SIZE'], shuffle=False)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = get_model(config['MODEL_NAME'], len(class_to_idx)).to(device)
    
    model_path = os.path.join(checkpoint_dir, f"{config['MODEL_NAME']}_best_model.pt")
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=device))
    else:
        print(f"Warning: {model_path} not found. Evaluating randomly initialized model.")
        
    model.eval()
    all_preds = []
    all_labels = []
    all_probs = []
    
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            probs = torch.nn.functional.softmax(outputs, dim=1)
            _, preds = torch.max(outputs, 1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())
            
    # Calculate metrics
    acc = accuracy_score(all_labels, all_preds)
    precision, recall, f1, _ = precision_recall_fscore_support(all_labels, all_preds, average='weighted', zero_division=0)
    
    # Top-3 Accuracy
    top3_correct = 0
    for i, probs in enumerate(all_probs):
        top3_preds = np.argsort(probs)[-3:][::-1]
        if all_labels[i] in top3_preds:
            top3_correct += 1
    top3_acc = top3_correct / len(all_labels) if len(all_labels) > 0 else 0
    
    report = [
        f"# Evaluation Report: {config['MODEL_NAME']}\n",
        "## Overall Metrics",
        f"- **Top-1 Accuracy**: {acc:.4f}",
        f"- **Top-3 Accuracy**: {top3_acc:.4f}",
        f"- **Precision**: {precision:.4f}",
        f"- **Recall**: {recall:.4f}",
        f"- **F1 Score**: {f1:.4f}\n"
    ]
    
    report_path = os.path.join(report_dir, f"{config['MODEL_NAME']}_evaluation.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report))
        
    print(f"Evaluation complete. Report generated at ai-training/reports/{config['MODEL_NAME']}_evaluation.md")

if __name__ == "__main__":
    main()
