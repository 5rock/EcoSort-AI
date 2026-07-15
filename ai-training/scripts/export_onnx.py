import os
import argparse
import yaml
import json
import torch
from train import get_model
import onnx
from onnxsim import simplify
from onnxruntime.quantization import quantize_dynamic, QuantType
import shutil

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=str, required=True, help="Path to YAML config")
    args = parser.parse_args()
    
    with open(args.config, 'r') as f:
        config = yaml.safe_load(f)
        
    base_dir = os.path.join(os.path.dirname(__file__), "..")
    checkpoint_dir = os.path.join(base_dir, "models", "checkpoints")
    export_dir = os.path.join(base_dir, "models", "exports")
    os.makedirs(export_dir, exist_ok=True)
    
    class_idx_path = os.path.join(checkpoint_dir, f"{config['MODEL_NAME']}_class_indices.json")
    if os.path.exists(class_idx_path):
        with open(class_idx_path, 'r') as f:
            class_to_idx = json.load(f)
    else:
        class_to_idx = {"dummy": 0}
        
    model_path = os.path.join(checkpoint_dir, f"{config['MODEL_NAME']}_best_model.pt")
    if not os.path.exists(model_path):
        print(f"Warning: {model_path} not found. Exporting randomly initialized model.")
        
    num_classes = len(class_to_idx)
    model = get_model(config['MODEL_NAME'], num_classes)
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location='cpu'))
    else:
        print(f"Warning: {model_path} not found. Exporting randomly initialized model.")
    model.eval()
    
    dummy_input = torch.randn(1, 3, config['IMAGE_SIZE'], config['IMAGE_SIZE'])
    
    onnx_path = os.path.join(export_dir, f"{config['MODEL_NAME']}.onnx")
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )
    
    print(f"Exported PyTorch model to {onnx_path}")
    
    # Simplify
    print("Running onnxsim...")
    try:
        onnx_model = onnx.load(onnx_path)
        model_simp, check = simplify(onnx_model)
        assert check, "Simplified ONNX model could not be validated"
        onnx.save(model_simp, onnx_path)
        print("ONNX simplification successful.")
    except Exception as e:
        print(f"onnxsim failed or not installed: {e}")
        
    # Quantize
    print("Running dynamic quantization...")
    quantized_path = os.path.join(export_dir, f"{config['MODEL_NAME']}_quantized.onnx")
    try:
        quantize_dynamic(
            model_input=onnx_path,
            model_output=quantized_path,
            weight_type=QuantType.QUInt8
        )
        print(f"Quantized model saved to {quantized_path}")
    except Exception as e:
        print(f"Quantization failed or not installed: {e}")
        quantized_path = onnx_path # fallback
        
    # Copy to web app
    webapp_model_dir = os.path.join(base_dir, "..", "apps", "web", "public", "models")
    os.makedirs(webapp_model_dir, exist_ok=True)
    
    dest_path = os.path.join(webapp_model_dir, "waste_classifier.onnx")
    shutil.copy2(quantized_path, dest_path)
    
    # Save classes list for the webapp
    classes_list = ["" for _ in range(num_classes)]
    for cls_name, idx in class_to_idx.items():
        classes_list[idx] = cls_name
        
    classes_dest_path = os.path.join(webapp_model_dir, "waste_classes.json")
    with open(classes_dest_path, 'w') as f:
        json.dump(classes_list, f)
    
    print(f"Copied final ONNX model to {dest_path}")
    print(f"Saved classes to {classes_dest_path}")
    print("Export pipeline complete.")

if __name__ == "__main__":
    main()
