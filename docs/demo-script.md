# EcoSort AI Hackathon Demo Script

*This script is designed for a 3-5 minute live presentation to judges.*

## 1. The Hook (0:00 - 0:45)
**Action:** Show the Welcome screen.
**Speaker:** "Hello judges, this is EcoSort AI. Every year, millions of tons of recyclable waste end up in landfills simply because people don't know how to sort it correctly. EcoSort AI solves this by putting an intelligent recycling assistant directly in your pocket. It's a Progressive Web App that runs entirely offline, meaning it works instantly, anywhere, with zero cloud server costs and absolute privacy."

## 2. Authentication & Guest Mode (0:45 - 1:15)
**Action:** Click 'Continue as Guest'.
**Speaker:** "We've built a robust local authentication system using IndexedDB and PBKDF2 hashing. But we know users want zero friction, so we implemented a secure Guest Mode. Let's jump right in."

## 3. The Live Scan (1:15 - 2:30)
**Action:** Navigate to the Scanner. Hold up a plastic bottle or use an uploaded image. Click "Analyze Waste".
**Speaker:** "This is the core engine. When I capture this image, we are not sending it to the cloud. A MobileNetV2 AI model is executing directly inside the browser using ONNX Runtime WebAssembly. It classifies the item and queries our local Waste Intelligence layer to give me regional recycling instructions. Notice how fast that was?"

## 4. Edge Cases & Intelligence (2:30 - 3:00)
**Action:** Show an ambiguous image (or point out the architecture).
**Speaker:** "If the AI isn't confident, our Waste Intelligence layer dynamically flags it as a 'Possible Match' rather than guessing blindly, keeping user trust high. Furthermore, the instructions adapt based on your region settings."

## 5. Offline Repositories & History (3:00 - 3:30)
**Action:** Open the History tab, then Profile -> Storage.
**Speaker:** "All scans are stored locally using our custom IndexedDB Repositories. We aggressively optimize storage by only saving downscaled thumbnails. When this guest session ends, the repository automatically purges the data to ensure privacy."

## 6. Closing (3:30 - 4:00)
**Speaker:** "EcoSort AI isn't just a prototype; it's an enterprise-ready foundation. Our `datasets` and `training` pipelines are open-sourced alongside the app, making it trivial to continuously train and deploy smarter models via ONNX. Thank you!"
