import sys
import os
import shutil
import platform
import importlib.metadata

def get_package_version(pkg_name):
    try:
        return importlib.metadata.version(pkg_name)
    except importlib.metadata.PackageNotFoundError:
        return None

def check_package(name, expected_version_prefix=None):
    if name == 'opencv-python':
        pkg_name = 'opencv-python'
    elif name == 'scikit-learn':
        pkg_name = 'scikit-learn'
    elif name == 'Pillow':
        pkg_name = 'pillow'
    else:
        pkg_name = name

    version = get_package_version(pkg_name)
    if version:
        status = "OK"
        if expected_version_prefix and not version.startswith(expected_version_prefix):
            status = f"WARNING (Expected {expected_version_prefix}.x)"
        return True, version, status
    else:
        return False, "Not Installed", "ERROR"

def main():
    report = ["# Phase 0: Environment Validation Report\n"]
    
    # OS Info
    report.append("## System Information")
    report.append(f"- **OS**: {platform.system()} {platform.release()}")
    
    # Python
    py_version = platform.python_version()
    py_status = "OK" if py_version.startswith("3.11") else f"WARNING (Expected 3.11.x, got {py_version})"
    report.append(f"- **Python**: {py_version} [{py_status}]")
    
    # Disk Space
    total, used, free = shutil.disk_usage("/")
    free_gb = free / (2**30)
    report.append(f"- **Disk Space Free**: {free_gb:.2f} GB")
    
    # RAM
    try:
        import ctypes
        if os.name == 'nt':
            class MemoryStatusEx(ctypes.Structure):
                _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong), 
                            ("ullTotalPhys", ctypes.c_ulonglong), ("ullAvailPhys", ctypes.c_ulonglong),
                            ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
                            ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong),
                            ("sullAvailExtendedVirtual", ctypes.c_ulonglong)]
            stat = MemoryStatusEx()
            stat.dwLength = ctypes.sizeof(MemoryStatusEx)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(stat))
            ram_gb = stat.ullTotalPhys / (2**30)
            report.append(f"- **Total RAM**: {ram_gb:.2f} GB")
    except Exception:
        report.append("- **Total RAM**: Unknown")

    # AI Frameworks
    report.append("\n## AI Frameworks")
    has_torch, torch_ver, torch_status = check_package("torch", "2.7")
    report.append(f"- **PyTorch**: {torch_ver} [{torch_status}]")
    
    if has_torch:
        try:
            # Only import torch to check CUDA if it exists
            import torch
            cuda_avail = torch.cuda.is_available()
            report.append(f"- **CUDA Available**: {cuda_avail}")
            if cuda_avail:
                report.append(f"- **GPU**: {torch.cuda.get_device_name(0)}")
        except Exception as e:
            report.append(f"- **CUDA Available**: Error checking CUDA ({str(e)})")
    
    # Packages
    report.append("\n## Required Packages")
    packages = {
        "torchvision": "0.22",
        "onnx": "1.18",
        "onnxruntime": "1.22",
        "numpy": "2.2",
        "opencv-python": None,
        "albumentations": None,
        "scikit-learn": None,
        "matplotlib": None,
        "seaborn": None,
        "tensorboard": None,
        "tqdm": None,
        "Pillow": None
    }
    
    for pkg, exp_ver in packages.items():
        installed, ver, status = check_package(pkg, exp_ver)
        report.append(f"- **{pkg}**: {ver} [{status}]")
        
    report_dir = os.path.join(os.path.dirname(__file__), "..", "reports")
    os.makedirs(report_dir, exist_ok=True)
    with open(os.path.join(report_dir, "environment_report.md"), "w") as f:
        f.write("\n".join(report))
        
    print("Environment validation complete. Report generated at ai-training/reports/environment_report.md")

if __name__ == "__main__":
    main()
