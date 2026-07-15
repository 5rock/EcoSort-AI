# Product Roadmap

This document outlines the future vision and planned features for EcoSort AI beyond the initial Hackathon MVP.

## Phase 1: MVP (Current)
- Offline-first PWA architecture
- MobileNetV2 ONNX inference (8 classes)
- Local Authentication & Guest Mode
- Regional Waste Rules mapping
- History & Analytics Dashboard

## Phase 2: Enhanced AI & Accuracy
- **Model Upgrade**: Transition from MobileNetV2 to EfficientNet-Lite for higher accuracy.
- **Object Detection**: Implement YOLOv8 to allow scanning multiple waste items in a single frame and drawing bounding boxes on the camera feed.
- **Barcode Scanning**: Integrate barcode/QR code lookup as a secondary identification method for packaged goods.

## Phase 3: Cloud Synchronization & Social
- **Cloud Backend**: Optional account synchronization using Firebase or Supabase.
- **Leaderboards**: Gamification elements to reward users who recycle frequently.
- **Community Contributions**: Allow users to flag incorrect AI classifications and upload their images to a public dataset for community model training.

## Phase 4: Hardware Integration
- **Smart Bin API**: Expose local endpoints to allow physical IoT trash cans (powered by Raspberry Pi) to query the EcoSort AI engine.
