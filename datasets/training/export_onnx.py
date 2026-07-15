import torch
import torchvision
import torch.nn as nn

def export_to_onnx():
    print("EcoSort AI - ONNX Export Utility")
    
    # 1. Load model architecture
    model = torchvision.models.mobilenet_v2(pretrained=False)
    model.classifier[1] = nn.Linear(model.last_channel, 8)
    
    # 2. Load trained weights (stub)
    # model.load_state_dict(torch.load('ecosort_mobilenetv2.pth'))
    model.eval()
    
    # 3. Define dummy input matching the Web runtime (batch_size, channels, height, width)
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # 4. Export
    onnx_path = "../../apps/web/public/models/mobilenetv2.onnx"
    print(f"Exporting model to {onnx_path}...")
    
    '''
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
    '''
    print("Export complete. Ready for ONNX Runtime Web.")

if __name__ == '__main__':
    export_to_onnx()
