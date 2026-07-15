import type { InferenceResponse } from '@ecosort/types';

class AIEngine {
  private worker: Worker | null = null;
  private isInitialized = false;
  private resolveInit: ((err?: Error) => void) | null = null;
  private resolveInference: ((value: InferenceResponse & { metrics?: unknown }) => void) | null = null;
  private inferenceProgressCallback: ((step: string) => void) | null = null;
  private initPromise: Promise<void> | null = null;
  private inferenceQueue: Promise<void> = Promise.resolve();

  constructor() {
    if (typeof window !== 'undefined') {
      // Worker initialized via init()
    }
  }

  private handleMessage(e: MessageEvent) {
    const { type, results, level, error, step, metrics } = e.data;
    
    if (type === 'PROGRESS') {
      this.inferenceProgressCallback?.(step);
    } else if (type === 'INIT_DONE') {
      this.isInitialized = true;
      if (this.resolveInit) {
        this.resolveInit();
        this.resolveInit = null;
      }
    } else if (type === 'INFER_DONE') {
      if (this.resolveInference) {
        this.resolveInference({ results, level, metrics });
        this.resolveInference = null;
        this.inferenceProgressCallback = null;
      }
    } else if (type === 'ERROR') {
      const stack = e.data.stack ? `\nStack:\n${e.data.stack}` : '';
      console.error(`AI Engine Pipeline Failure: ${error}${stack}`);
      if (this.resolveInit) {
        this.resolveInit(new Error(error)); // Pass error to reject
        this.resolveInit = null;
      }
      if (this.resolveInference) {
        this.resolveInference({ error: `Pipeline Failure: ${error}` } as InferenceResponse & { metrics?: unknown });
        this.resolveInference = null;
        this.inferenceProgressCallback = null;
      }
    }
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      this.resolveInit = (err?: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
        this.initPromise = null;
      };
      
      try {
        if (!this.worker) {
          this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
          this.worker.onmessage = this.handleMessage.bind(this);
          
          this.worker.onerror = (err) => {
            console.error('Worker initialization error:', err);
            if (this.resolveInit) {
              this.resolveInit(err instanceof Error ? err : new Error('Worker initialization failed'));
              this.resolveInit = null;
            }
            if (this.resolveInference) {
              this.resolveInference({ error: 'Worker initialization failed' } as InferenceResponse & { metrics?: unknown });
              this.resolveInference = null;
              this.inferenceProgressCallback = null;
            }
            reject(err);
            this.initPromise = null;
          };
        }
        
        this.worker.postMessage({ type: 'INIT' });
      } catch (err) {
        reject(err);
        this.initPromise = null;
      }
    });

    return this.initPromise;
  }

  public async classify(imageSrc: string, onProgress?: (step: string) => void): Promise<InferenceResponse & { metrics?: any }> {
    const runInference = async (): Promise<InferenceResponse & { metrics?: any }> => {
      if (!this.isInitialized) await this.init();
      return new Promise((resolve) => {
        this.resolveInference = resolve;
        this.inferenceProgressCallback = onProgress ?? null;
        this.worker?.postMessage({ type: 'INFER', imageSrc });
      });
    };

    const queuedInference = this.inferenceQueue.then(runInference, runInference);
    this.inferenceQueue = queuedInference.then(() => undefined, () => undefined);
    return queuedInference;
  }
}

export const aiEngine = new AIEngine();
