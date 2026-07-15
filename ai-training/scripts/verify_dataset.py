import os
from PIL import Image

def verify_dataset():
    raw_dir = os.path.join(os.path.dirname(__file__), "..", "datasets", "raw")
    report_path = os.path.join(os.path.dirname(__file__), "..", "reports", "dataset_report.md")
    
    if not os.path.exists(raw_dir):
        print(f"Directory {raw_dir} does not exist.")
        return
        
    classes = [d for d in os.listdir(raw_dir) if os.path.isdir(os.path.join(raw_dir, d))]
    
    stats = {}
    corrupted = []
    unsupported = []
    
    supported_formats = {".jpg", ".jpeg", ".png"}
    
    for cls in classes:
        cls_dir = os.path.join(raw_dir, cls)
        files = os.listdir(cls_dir)
        valid_count = 0
        
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext not in supported_formats:
                unsupported.append(os.path.join(cls, f))
                continue
                
            file_path = os.path.join(cls_dir, f)
            try:
                with Image.open(file_path) as img:
                    img.verify()  # verify that it is, in fact, an image
                valid_count += 1
            except Exception as e:
                corrupted.append((os.path.join(cls, f), str(e)))
                
        stats[cls] = valid_count
        
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# Dataset Verification Report\n\n")
        f.write("## Statistics\n")
        total = 0
        for cls, count in stats.items():
            f.write(f"- **{cls}**: {count} valid images\n")
            total += count
        f.write(f"\n**Total Valid Images**: {total}\n\n")
        
        f.write("## Issues Found\n")
        if not corrupted and not unsupported:
            f.write("✅ No corrupted or unsupported files found.\n")
        else:
            if corrupted:
                f.write("### Corrupted Files\n")
                for c, err in corrupted:
                    f.write(f"- {c} ({err})\n")
            if unsupported:
                f.write("### Unsupported Formats\n")
                for u in unsupported:
                    f.write(f"- {u}\n")
                    
    print("Dataset verification complete. Report saved to reports/dataset_report.md")

if __name__ == "__main__":
    verify_dataset()
