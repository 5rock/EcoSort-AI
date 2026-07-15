import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Worker
class Worker {
  url: string;
  onmessage: (msg: any) => void;
  
  constructor(stringUrl: string) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }

  postMessage(msg: any) {
    if (msg.type === 'INIT') {
      setTimeout(() => this.onmessage({ data: { type: 'INIT_DONE' } }), 10);
    }
  }
}

(globalThis as any).Worker = Worker;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
