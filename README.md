<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/leaf.svg" alt="EcoSort AI Logo" width="120" height="120">
  <h1 align="center">EcoSort AI</h1>
  <p align="center">
    <strong>The World's Most Advanced Offline-First Waste Intelligence Platform.</strong>
  </p>
  <p align="center">
    <i>Identify waste instantly. Sort correctly. Protect privacy. Built for OSDHack 2026.</i>
  </p>
</div>

---

## 🌍 The Problem

Millions of tons of recyclable material end up in landfills every year due to "wish-cycling"—the act of putting something in the recycling bin hoping it will be recycled, which often contaminates the entire batch. People want to recycle correctly, but rules are confusing and constantly changing based on region.

## 💡 The Solution

**EcoSort AI** is an intelligent, region-aware waste sorting assistant that lives entirely on your device. Simply point your camera at an item, and EcoSort AI will instantly analyze it, categorize it, and provide hyper-local disposal instructions—**without ever sending your photos to the cloud.**

---

## 🚀 Key Features (OSDHack 2026 Submission)

### 🧠 100% On-Device AI Inference

EcoSort AI runs a highly optimized **MobileNetV2** model entirely within your browser using **ONNX Runtime Web**.

- **Web Worker Architecture:** The model executes in an isolated Web Worker, ensuring the main UI thread never blocks or drops frames during inference.
- **Hardware Acceleration:** Seamlessly falls back from WebGPU to WASM depending on device capability.

### 🔒 Uncompromising Privacy

By executing the AI model client-side, **your photos stay on your device by default**. We use absolutely **zero cloud APIs** for image inference, making EcoSort AI strictly privacy-first.

### 📶 True Offline PWA Experience

Built as a Progressive Web App (PWA) using Vite, EcoSort AI caches the entire application bundle, UI assets, and the 26MB ONNX model locally.

- After the initial load, **you can disconnect from the internet and the app will function flawlessly**.
- Scan history is saved locally using **IndexedDB (Dexie.js)** with extreme storage optimization (auto-downscaling images to 256x256 WebP).

### 🎯 Smart Waste Mapper (Synonym Group Voting)

We don't just trust the top prediction. EcoSort AI analyzes the **Top 5 Raw ImageNet predictions**, weights their confidence scores, and votes across comprehensive synonym groups (e.g., Plastic, Glass, Organic, E-Waste) to drastically reduce false negatives and provide reliable real-world waste intelligence.

### 🛡️ Pre-Inference Scan Quality Checks

EcoSort AI intelligently analyzes the camera feed for **Brightness** and **Laplacian Blur Variance** _before_ running inference. If the image is too dark or out of focus, it halts the pipeline and prompts the user to improve the lighting—saving precious mobile battery life.

---

## 🛠️ Installation & Local Development

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/ecosort-ai.git
   cd ecosort-ai
   ```

2. **Install dependencies:**

   ```bash
   cd apps/web
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Build for Production (Required for full PWA/Service Worker testing):**
   ```bash
   npm run build
   npm run preview
   ```

---

## 📐 Architecture Overview

Please see the [ARCHITECTURE.md](ARCHITECTURE.md) file for a detailed breakdown of the Data Flow, State Management, and AI Pipeline.

---

## 📄 License

EcoSort AI is open-source software licensed under the **[MIT License](LICENSE)**.

---

<div align="center">
  <i>Built with ❤️ for OSDHack 2026</i>
</div>
