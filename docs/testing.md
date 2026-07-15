# Testing Strategy

EcoSort AI utilizes a modern testing stack to ensure stability and correctness across the offline database, AI pipeline, and React components.

## Testing Stack
- **Test Runner**: Vitest (fast, Vite-native)
- **DOM Testing**: React Testing Library & jsdom
- **Mocking**: MSW (Mock Service Worker) for network mocking, and custom stubs for IndexedDB (Dexie).

## Test Organization
Tests are co-located with their respective modules using the `*.test.ts` or `*.test.tsx` convention.

- `src/offline/repositories/*.test.ts`: Unit tests for Dexie database wrappers.
- `src/ai/engine/*.test.ts`: Unit tests for the Waste Intelligence logic and confidence thresholding.
- `src/features/*/components/*.test.tsx`: Component tests verifying rendering and user interactions.

## Running Tests
To execute the test suite:
```bash
# Run all tests
npm run test

# Run with UI dashboard
npm run test:ui

# Generate coverage report
npm run coverage
```

## Mocking the AI Engine
Running ONNX WebAssembly in a Node.js testing environment (like jsdom) is challenging. We mock the `aiEngine` and the `Worker` class in our tests to simulate inference results and verify that our application logic (like the "Possible Matches" threshold) handles the outputs correctly.
