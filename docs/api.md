# API Documentation

EcoSort AI is currently a strictly offline-first application and does not rely on a centralized backend API for its core functionality.

## Local APIs

### 1. The AI Inference API (Web Worker)
The core "API" of the application is the message-passing interface between the main thread and the Web Worker.

**Initialization**
```typescript
aiEngine.worker.postMessage({ type: 'INIT' });
// Expects: { type: 'INIT_DONE' }
```

**Inference**
```typescript
aiEngine.worker.postMessage({ type: 'INFER', imageSrc: 'data:image/jpeg;base64,...' });
// Expects: { type: 'INFER_DONE', results: [{ mappedCategory: 'Plastic', confidence: 0.95 }] }
```

### 2. The Repository API (Dexie.js)
The application interacts with IndexedDB through standard asynchronous methods defined in our Repositories (e.g., `historyRepository.ts`).

Example:
```typescript
await historyRepository.addScan({
  id: 'uuid',
  timestamp: 1678886400000,
  category: 'Glass',
  confidence: 0.88,
  // ...
});
```

## Future Cloud Integration
While fully offline, the architecture is designed to support future synchronization. The `ScanHistoryRecord` schema includes a `synced` boolean flag. In future iterations, a sync service could run in the background to push unsynced records to a cloud REST API or GraphQL endpoint when network connectivity is available.
