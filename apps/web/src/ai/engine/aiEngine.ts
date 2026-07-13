import type { InferenceResponse } from '@ecosort/types';

class AIEngine {
  private worker: Worker | null = null;
  private isInitialized = false;
  private resolvers: { [key: string]: Function } = {};
  private progressCallbacks: { [key: string]: (step: string) => void } = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = this.handleMessage.bind(this);
    }
  }

  private handleMessage(e: MessageEvent) {
    const { type, results, level, error, step, metrics } = e.data;
    
    if (type === 'PROGRESS') {
      if (this.progressCallbacks['infer']) {
        this.progressCallbacks['infer'](step);
      }
    } else if (type === 'INIT_DONE') {
      this.isInitialized = true;
      if (this.resolvers['init']) {
        this.resolvers['init']();
        delete this.resolvers['init'];
      }
    } else if (type === 'INFER_DONE') {
      if (this.resolvers['infer']) {
        this.resolvers['infer']({ results, level, metrics });
        delete this.resolvers['infer'];
        delete this.progressCallbacks['infer'];
      }
    } else if (type === 'ERROR') {
      const stack = e.data.stack ? `\nStack:\n${e.data.stack}` : '';
      console.error(`AI Engine Pipeline Failure: ${error}${stack}`);
      if (this.resolvers['infer']) {
        this.resolvers['infer']({ error: `Pipeline Failure: ${error}` });
        delete this.resolvers['infer'];
        delete this.progressCallbacks['infer'];
      }
    }
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return Promise.resolve();
    return new Promise((resolve) => {
      this.resolvers['init'] = resolve;
      this.worker?.postMessage({ type: 'INIT' });
    });
  }

  public async classify(imageSrc: string, onProgress?: (step: string) => void): Promise<InferenceResponse & { metrics?: any }> {
    if (!this.isInitialized) await this.init();
    return new Promise((resolve) => {
      this.resolvers['infer'] = resolve;
      if (onProgress) {
        this.progressCallbacks['infer'] = onProgress;
      }
      this.worker?.postMessage({ type: 'INFER', imageSrc });
    });
  }
}

export const aiEngine = new AIEngine();
