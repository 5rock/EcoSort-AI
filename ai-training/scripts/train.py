import os
import argparse
import yaml
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, Subset
from torch.utils.tensorboard import SummaryWriter
import torchvision.models as models
import albumentations as A
from albumentations.pytorch import ToTensorV2
import cv2
import numpy as np
from tqdm import tqdm
import csv
import timm
from sklearn.model_selection import KFold
import random
import shutil

class WasteDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.classes = sorted(os.listdir(root_dir))
        self.class_to_idx = {c: i for i, c in enumerate(self.classes)}
        self.images = []
        self.labels = []
        
        for c in self.classes:
            c_dir = os.path.join(root_dir, c)
            if not os.path.isdir(c_dir): continue
            for f in os.listdir(c_dir):
                if f.endswith(('.jpg', '.jpeg', '.png')):
                    self.images.append(os.path.join(c_dir, f))
                    self.labels.append(self.class_to_idx[c])
                    
    def __len__(self):
        return len(self.images)
        
    def __getitem__(self, idx):
        img_path = self.images[idx]
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        if self.transform:
            augmented = self.transform(image=image)
            image = augmented['image']
            
        return image, self.labels[idx], img_path

def get_transforms(img_size, is_train=True):
    if is_train:
        return A.Compose([
            A.Resize(img_size, img_size),
            A.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1, p=0.5),
            A.RandomBrightnessContrast(p=0.5),
            A.MotionBlur(p=0.2),
            A.GaussianBlur(p=0.2),
            A.GaussNoise(p=0.2),
            A.Rotate(limit=30, p=0.5),
            A.Perspective(p=0.2),
            A.CoarseDropout(num_holes_range=(1, 8), hole_height_range=(1, 32), hole_width_range=(1, 32), p=0.2),
            A.HorizontalFlip(p=0.5),
            A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ToTensorV2()
        ])
    else:
        return A.Compose([
            A.Resize(img_size, img_size),
            A.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
            ToTensorV2()
        ])

def get_model(model_name, num_classes):
    if model_name == "mobilenetv3":
        model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
        model.classifier[3] = nn.Linear(model.classifier[3].in_features, num_classes)
    elif model_name == "efficientnet_b0":
        model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
        model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)
    elif model_name == "efficientnet_lite0":
        model = timm.create_model('efficientnet_lite0', pretrained=True, num_classes=num_classes)
    else:
        raise ValueError(f"Unknown model: {model_name}")
    return model

def run_training_loop(config, train_loader, val_loader, num_classes, fold_idx, device, base_dir, save_hard_examples=False):
    model = get_model(config['MODEL_NAME'], num_classes).to(device)
    criterion = nn.CrossEntropyLoss()
    
    if config['OPTIMIZER'] == 'AdamW':
        optimizer = optim.AdamW(model.parameters(), lr=float(config['LEARNING_RATE']), weight_decay=float(config.get('WEIGHT_DECAY', 1e-4)))
    else:
        optimizer = optim.Adam(model.parameters(), lr=float(config['LEARNING_RATE']))
        
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=2)
    scaler = torch.cuda.amp.GradScaler(enabled=config.get('MIXED_PRECISION', False))
    
    best_val_acc = -1.0
    patience_counter = 0
    checkpoint_dir = os.path.join(base_dir, "models", "checkpoints")
    hard_examples_dir = os.path.join(base_dir, "reports", "hard_examples")
    
    if save_hard_examples:
        os.makedirs(hard_examples_dir, exist_ok=True)
        
    for epoch in range(config['EPOCHS']):
        model.train()
        train_loss = 0.0
        train_correct = 0
        
        pbar = tqdm(train_loader, desc=f"Fold {fold_idx} Epoch {epoch+1}/{config['EPOCHS']} [TRAIN]", leave=False)
        for images, labels, _ in pbar:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            
            with torch.cuda.amp.autocast(enabled=config.get('MIXED_PRECISION', False)):
                outputs = model(images)
                loss = criterion(outputs, labels)
                
            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            scaler.step(optimizer)
            scaler.update()
            
            train_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            train_correct += torch.sum(preds == labels.data)
            
        train_epoch_loss = train_loss / len(train_loader.dataset)
        train_epoch_acc = train_correct.double() / len(train_loader.dataset)
        
        model.eval()
        val_loss = 0.0
        val_correct = 0
        
        with torch.no_grad():
            for images, labels, paths in tqdm(val_loader, desc=f"Fold {fold_idx} Epoch {epoch+1}/{config['EPOCHS']} [VAL]", leave=False):
                images, labels = images.to(device), labels.to(device)
                with torch.cuda.amp.autocast(enabled=config.get('MIXED_PRECISION', False)):
                    outputs = model(images)
                    loss = criterion(outputs, labels)
                    
                val_loss += loss.item() * images.size(0)
                probs = torch.softmax(outputs, dim=1)
                confs, preds = torch.max(probs, 1)
                val_correct += torch.sum(preds == labels.data)
                
                # Misclassification Analysis
                if save_hard_examples and (epoch == config['EPOCHS'] - 1 or config.get('DRY_RUN', False)):
                    for i in range(len(preds)):
                        if preds[i] != labels[i]:
                            true_label = val_loader.dataset.dataset.classes[labels[i].item()]
                            pred_label = val_loader.dataset.dataset.classes[preds[i].item()]
                            conf = confs[i].item()
                            img_path = paths[i]
                            
                            target_dir = os.path.join(hard_examples_dir, f"true_{true_label}_pred_{pred_label}")
                            os.makedirs(target_dir, exist_ok=True)
                            
                            filename = f"conf_{conf:.2f}_{os.path.basename(img_path)}"
                            shutil.copy(img_path, os.path.join(target_dir, filename))
                            
                            with open(os.path.join(hard_examples_dir, "misclassifications_log.csv"), "a", newline="") as f:
                                writer = csv.writer(f)
                                writer.writerow([img_path, true_label, pred_label, conf, "Model predicted incorrect class"])
                                
        val_epoch_loss = val_loss / len(val_loader.dataset)
        val_epoch_acc = val_correct.double() / len(val_loader.dataset)
        scheduler.step(val_epoch_acc)
        
        print(f"Fold {fold_idx} Ep {epoch+1} - Train Loss: {train_epoch_loss:.4f} Acc: {train_epoch_acc:.4f} | Val Loss: {val_epoch_loss:.4f} Acc: {val_epoch_acc:.4f}")
        
        if val_epoch_acc > best_val_acc:
            best_val_acc = val_epoch_acc
            patience_counter = 0
            if fold_idx == 0:  # Only save best model overall for fold 0 or final
                torch.save(model.state_dict(), os.path.join(checkpoint_dir, f"{config['MODEL_NAME']}_best_model.pt"))
        else:
            patience_counter += 1
            if patience_counter >= config.get('EARLY_STOPPING_PATIENCE', 5):
                print("Early stopping triggered!")
                break
                
    return best_val_acc.item()

def hyperparameter_search(dataset, device, base_dir, num_classes):
    print("Starting Hyperparameter Search...")
    search_space = {
        'LEARNING_RATE': [0.001, 0.0005, 0.0001],
        'BATCH_SIZE': [16, 32],
        'WEIGHT_DECAY': [1e-4, 1e-5],
        'OPTIMIZER': ['AdamW', 'Adam'],
        'MODEL_NAME': ['mobilenetv3']
    }
    
    best_acc = -1
    best_config = None
    
    # Random search 5 combinations
    for i in range(5):
        config = {
            'LEARNING_RATE': random.choice(search_space['LEARNING_RATE']),
            'BATCH_SIZE': random.choice(search_space['BATCH_SIZE']),
            'WEIGHT_DECAY': random.choice(search_space['WEIGHT_DECAY']),
            'OPTIMIZER': random.choice(search_space['OPTIMIZER']),
            'MODEL_NAME': random.choice(search_space['MODEL_NAME']),
            'EPOCHS': 3, # Fast eval
            'IMAGE_SIZE': 224,
            'MIXED_PRECISION': False
        }
        
        print(f"\n--- Testing Config {i+1}/5: {config} ---")
        
        processed_dir = os.path.join(base_dir, "datasets", "processed")
        train_full_dataset = WasteDataset(processed_dir, transform=get_transforms(config['IMAGE_SIZE'], is_train=True))
        val_full_dataset = WasteDataset(processed_dir, transform=get_transforms(config['IMAGE_SIZE'], is_train=False))
        
        indices = list(range(len(train_full_dataset)))
        if getattr(dataset, 'indices', None) is not None:
            # It's a subset (dry_run)
            indices = dataset.indices
            
        split_idx = int(len(indices) * 0.8)
        train_idx = indices[:split_idx]
        val_idx = indices[split_idx:]
        
        train_sub = Subset(train_full_dataset, train_idx)
        val_sub = Subset(val_full_dataset, val_idx)
        
        train_loader = DataLoader(train_sub, batch_size=config['BATCH_SIZE'], shuffle=True, num_workers=0)
        val_loader = DataLoader(val_sub, batch_size=config['BATCH_SIZE'], shuffle=False, num_workers=0)
        
        acc = run_training_loop(config, train_loader, val_loader, num_classes, 0, device, base_dir, save_hard_examples=False)
        
        if acc > best_acc:
            best_acc = acc
            best_config = config
            
    print(f"\nBest Config Found (Acc {best_acc:.4f}): {best_config}")
    with open(os.path.join(base_dir, 'configs', 'best_hyperparams.yaml'), 'w') as f:
        yaml.dump(best_config, f)
    
    return best_config

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, required=True, help="Path to YAML config")
    parser.add_argument("--dry-run", action="store_true", help="Run with a tiny subset")
    parser.add_argument("--kfold", action="store_true", help="Run 5-Fold Cross Validation")
    parser.add_argument("--hyperopt", action="store_true", help="Run Hyperparameter Search")
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
        
    base_dir = os.path.join(os.path.dirname(__file__), "..")
    processed_dir = os.path.join(base_dir, "datasets", "processed")
    checkpoint_dir = os.path.join(base_dir, "models", "checkpoints")
    os.makedirs(checkpoint_dir, exist_ok=True)
    
    full_dataset = WasteDataset(processed_dir, transform=None) # Transforms applied later
    
    # Save class mapping
    class_idx_path = os.path.join(checkpoint_dir, f"{config['MODEL_NAME']}_class_indices.json")
    with open(class_idx_path, 'w') as f:
        json.dump(full_dataset.class_to_idx, f)
        
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Execution Device: {device}")
    
    if args.dry_run:
        config['DRY_RUN'] = True
        full_dataset = Subset(full_dataset, range(20))
        full_dataset.dataset = WasteDataset(processed_dir) # Hack for subset compatibility
        
    if args.hyperopt:
        config = hyperparameter_search(full_dataset, device, base_dir, len(full_dataset.dataset.classes if args.dry_run else full_dataset.classes))
        config['EPOCHS'] = 10 # Increase for final train
    
    if args.kfold:
        print("\nStarting 5-Fold Cross Validation...")
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        fold_accs = []
        
        # Create separate dataset instances with proper transforms
        train_full_dataset = WasteDataset(processed_dir, transform=get_transforms(config['IMAGE_SIZE'], is_train=True))
        val_full_dataset = WasteDataset(processed_dir, transform=get_transforms(config['IMAGE_SIZE'], is_train=False))
        
        # Subsampling for dry run
        indices = list(range(len(train_full_dataset)))
        if args.dry_run:
            indices = list(range(20))
            
        for fold, (train_idx_raw, val_idx_raw) in enumerate(kf.split(indices)):
            print(f"\n=== FOLD {fold+1}/5 ===")
            
            # Map back to subset indices
            train_idx = [indices[i] for i in train_idx_raw]
            val_idx = [indices[i] for i in val_idx_raw]
            
            train_sub = Subset(train_full_dataset, train_idx)
            val_sub = Subset(val_full_dataset, val_idx)
            
            # Balancing
            class_counts = [0] * len(train_full_dataset.classes)
            for i in train_idx:
                label = train_full_dataset.labels[i]
                class_counts[label] += 1
                
            weights = [1.0 / c if c > 0 else 0 for c in class_counts]
            sample_weights = [weights[train_full_dataset.labels[i]] for i in train_idx]
            sampler = torch.utils.data.WeightedRandomSampler(sample_weights, len(sample_weights))
            
            train_loader = DataLoader(train_sub, batch_size=config['BATCH_SIZE'], sampler=sampler, num_workers=0)
            val_loader = DataLoader(val_sub, batch_size=config['BATCH_SIZE'], shuffle=False, num_workers=0)
            
            acc = run_training_loop(config, train_loader, val_loader, len(class_counts), fold, device, base_dir, save_hard_examples=(fold==0))
            fold_accs.append(acc)
            
        print(f"\n=== 5-Fold CV Complete ===")
        print(f"Average Val Acc: {np.mean(fold_accs):.4f} +/- {np.std(fold_accs):.4f}")
        
    else:
        # Standard Train/Val Split 80/20
        train_full_dataset = WasteDataset(processed_dir, transform=get_transforms(config['IMAGE_SIZE'], is_train=True))
        val_full_dataset = WasteDataset(processed_dir, transform=get_transforms(config['IMAGE_SIZE'], is_train=False))
        
        indices = list(range(len(train_full_dataset)))
        if args.dry_run:
            indices = list(range(20))
            
        split_idx = int(len(indices) * 0.8)
        train_idx = indices[:split_idx]
        val_idx = indices[split_idx:]
        
        train_sub = Subset(train_full_dataset, train_idx)
        val_sub = Subset(val_full_dataset, val_idx)
        
        train_loader = DataLoader(train_sub, batch_size=config['BATCH_SIZE'], shuffle=True, num_workers=0)
        val_loader = DataLoader(val_sub, batch_size=config['BATCH_SIZE'], shuffle=False, num_workers=0)
        
        run_training_loop(config, train_loader, val_loader, len(train_full_dataset.classes), 0, device, base_dir, save_hard_examples=True)

if __name__ == "__main__":
    main()
