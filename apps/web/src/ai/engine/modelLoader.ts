import * as ort from 'onnxruntime-web';

export interface ModelInfo {
  session: ort.InferenceSession;
  classes: string[];
  backend: string;
  modelVersion: string;
}

// Ensure we use absolute URLs in the worker context
const getAbsoluteUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `${self.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
};

export async function loadModelWithFallback(modelPath: string = '/models/waste_classifier.onnx'): Promise<ModelInfo> {
  const absoluteModelPath = getAbsoluteUrl(modelPath);
  const sessionData = await loadOnnxSession(absoluteModelPath);
  
  const classesUrl = getAbsoluteUrl('/models/waste_classes.json');
  const res = await fetch(classesUrl);
  const classesDict = await res.json();
  
  let classes: string[] = [];
  if (Array.isArray(classesDict)) {
    classes = classesDict;
  } else {
    classes = Object.values(classesDict);
  }
  
  return {
    session: sessionData.session,
    classes,
    backend: sessionData.backend,
    modelVersion: 'WasteClassifier-v2' // Upgraded to v2
  };
}

async function loadOnnxSession(modelPath: string): Promise<{ session: ort.InferenceSession, backend: string }> {
  try {
    const session = await ort.InferenceSession.create(modelPath, { executionProviders: ['webgpu'] });
    
    // WebGPU might successfully 'create' but fail during actual inference in WebWorkers.
    // We run a quick warmup to ensure the backend is fully functional.
    const dummyTensor = new ort.Tensor('float32', new Float32Array(3 * 224 * 224), [1, 3, 224, 224]);
    try {
      await session.run({ [session.inputNames[0]]: dummyTensor });
    } finally {
      dummyTensor.dispose();
    }
    
    return { session, backend: 'webgpu' };
  } catch (err) {
    console.warn('WebGPU failed or is unsupported, falling back to WASM backend.', err);
    const session = await ort.InferenceSession.create(modelPath, { executionProviders: ['wasm'] });
    return { session, backend: 'wasm' };
  }
}
