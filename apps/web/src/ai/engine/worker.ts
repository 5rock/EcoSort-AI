import * as ort from 'onnxruntime-web';
import { processImage } from '../preprocessing/imageProcessor';
import { calculateGroupScore } from '../postprocessing/mapper';
import { getConfidenceLevel } from '../postprocessing/confidence';
import type { ClassificationResult } from '@ecosort/types';

// Initialize ONNX runtime environment for worker
ort.env.wasm.numThreads = 1;
ort.env.wasm.simd = true;

let session: ort.InferenceSession | null = null;
let classes: { [key: string]: [string, string] } | null = null;
let currentBackend = 'wasm';

async function loadModel() {
  if (!session) {
    self.postMessage({ type: 'PROGRESS', step: 'Loading Model' });
    try {
      session = await ort.InferenceSession.create('/models/mobilenetv2.onnx', { executionProviders: ['webgpu'] });
      currentBackend = 'webgpu';
    } catch {
      session = await ort.InferenceSession.create('/models/mobilenetv2.onnx', { executionProviders: ['wasm'] });
      currentBackend = 'wasm';
    }
  }
  if (!classes) {
    const res = await fetch('/models/imagenet_classes.json');
    classes = await res.json();
  }
}

// Softmax function to convert logits to probabilities
function softmax(arr: Float32Array): Float32Array {
  const max = Math.max(...Array.from(arr));
  const exps = arr.map(x => Math.exp(x - max));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return new Float32Array(exps.map(x => x / sumExps));
}

self.onmessage = async (e: MessageEvent) => {
  const { type, imageSrc } = e.data;
  
  if (type === 'INIT') {
    try {
      await loadModel();
      self.postMessage({ type: 'INIT_DONE' });
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: (err as Error).message });
    }
  } else if (type === 'INFER' && imageSrc) {
    try {
      await loadModel();
      if (!session || !classes) throw new Error('Model not loaded');

      self.postMessage({ type: 'PROGRESS', step: 'Preprocessing Image' });
      const loadStart = performance.now();
      const tensor = await processImage(imageSrc);
      const feeds = { [session.inputNames[0]]: tensor };
      
      self.postMessage({ type: 'PROGRESS', step: 'Running Local AI' });
      const startInference = performance.now();
      const results = await session.run(feeds);
      const inferenceTimeMs = Math.round(performance.now() - startInference);
      
      self.postMessage({ type: 'PROGRESS', step: 'Post Processing' });
      const outputName = session.outputNames[0];
      const outputTensor = results[outputName];
      
      console.log('--- Phase 1: Verify Model Output ---');
      console.log('Model load time:', Math.round(performance.now() - loadStart), 'ms');
      console.log('Backend:', currentBackend);
      console.log('Output tensor name:', outputName);
      console.log('Tensor shape:', outputTensor.dims);
      
      const values = Array.from(outputTensor.data as Float32Array);
      console.log('First 20 tensor values:', values.slice(0, 20));
      
      // If sum is very close to 1, it's already probabilities!
      const sum = values.reduce((a, b) => a + b, 0);
      const isProbabilities = Math.abs(sum - 1.0) < 0.01;
      const probabilities = isProbabilities ? (outputTensor.data as Float32Array) : softmax(outputTensor.data as Float32Array);
      
      // Log top 5 predictions for debugging
      const top5Indices = Array.from(probabilities)
        .map((prob, idx) => ({ prob, idx }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, 5);
      
      console.log('ArgMax index:', top5Indices[0].idx);
      console.log('--- Top 5 Raw ImageNet Predictions ---');
      top5Indices.forEach((item, i) => {
        const cls = classes![item.idx.toString()][1];
        console.log(`${i + 1}. ${cls} - ${(item.prob * 100).toFixed(1)}%`);
      });
      console.log('--------------------------------------');

      const rawPredictions = top5Indices.map(item => ({
        className: classes![item.idx.toString()][1],
        prob: item.prob
      }));
      
      const groupScore = calculateGroupScore(rawPredictions);
      
      let topResults: ClassificationResult[] = [];
      if (groupScore) {
        topResults.push({
          className: 'Voted Synonym Group',
          mappedCategory: groupScore.category,
          confidence: groupScore.confidence,
          modelConfidence: rawPredictions[0].prob,
          rawPredictions: rawPredictions
        });
      } else {
        topResults.push({
          className: rawPredictions[0].className,
          mappedCategory: null,
          confidence: rawPredictions[0].prob,
          modelConfidence: rawPredictions[0].prob,
          rawPredictions: rawPredictions
        });
      }

      const topConfidence = topResults[0].confidence;
      const level = getConfidenceLevel(topConfidence);

      self.postMessage({ 
        type: 'INFER_DONE', 
        results: topResults, 
        level,
        metrics: {
          inferenceTimeMs,
          backend: currentBackend,
          modelVersion: 'MobileNetV2'
        }
      });

    } catch (err) {
      const errorObj = err as Error;
      self.postMessage({ 
        type: 'ERROR', 
        error: errorObj.message, 
        stack: errorObj.stack 
      });
    }
  }
};
