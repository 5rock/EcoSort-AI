import os
import argparse
import yaml
import json
import torch
import time
from train import get_model

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, required=True, help="Path to YAML config")
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
        
    base_dir = os.path.join(os.path.dirname(__file__), "..")
    checkpoint_dir = os.path.join(base_dir, "models", "checkpoints")
    
    class_idx_path = os.path.join(checkpoint_dir, f"{config['MODEL_NAME']}_class_indices.json")
    if os.path.exists(class_idx_path):
        with open(class_idx_path, 'r') as f:
            class_to_idx = json.load(f)
    else:
        class_to_idx = {"dummy": 0}
        
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = get_model(config['MODEL_NAME'], len(class_to_idx)).to(device)
    model.eval()
    
    dummy_input = torch.randn(1, 3, config['IMAGE_SIZE'], config['IMAGE_SIZE']).to(device)
    
    # Warmup
    for _ in range(10):
        with torch.no_grad():
            _ = model(dummy_input)
            
    # Measure
    start_time = time.time()
    iters = 100
    with torch.no_grad():
        for _ in range(iters):
            _ = model(dummy_input)
            
    end_time = time.time()
    avg_inference_time = ((end_time - start_time) / iters) * 1000 # ms
    
    model_path = os.path.join(checkpoint_dir, f"{config['MODEL_NAME']}_best_model.pt")
    model_size_mb = os.path.getsize(model_path) / (1024 * 1024) if os.path.exists(model_path) else 0
    
    report = [
        f"# Benchmark Report: {config['MODEL_NAME']}\n",
        "## Performance",
        f"- **Device**: {device}",
        f"- **Average Inference Time ({device})**: {avg_inference_time:.2f} ms",
        f"- **PyTorch Model Size**: {model_size_mb:.2f} MB"
    ]
    
    report_path = os.path.join(base_dir, "reports", f"{config['MODEL_NAME']}_benchmark.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report))
        
    print(f"Benchmark complete for {config['MODEL_NAME']}.")

if __name__ == "__main__":
    main()
