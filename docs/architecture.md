# EcoSort AI - Architecture Overview

EcoSort AI is built as a Progressive Web Application (PWA) prioritizing an offline-first experience, edge AI inference, and robust local data management.

## High-Level Architecture

The architecture is divided into three primary layers:
1. **Presentation Layer (React + Tailwind + Framer Motion)**: Manages UI components, routing, animations, and internationalization.
2. **Business Logic Layer (Zustand + Services)**: Contains application state, authentication logic, and offline data repositories.
3. **Intelligence Layer (Web Worker + ONNX Runtime)**: A dedicated Web Worker handles image preprocessing and runs the MobileNetV2 model via ONNX Runtime Web.

## Core Technologies
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Local Database**: Dexie.js (IndexedDB wrapper)
- **Machine Learning**: ONNX Runtime Web (WASM execution)
- **Routing**: React Router DOM

## Directory Structure Strategy
The project follows a feature-driven directory structure under `apps/web/src/features/`. Each feature (e.g., scanner, authentication, history, profile) is self-contained with its own components, pages, and specific hooks, making the codebase scalable and modular.
