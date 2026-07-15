import * as ort from 'onnxruntime-web';
import { processImage } from '../preprocessing/imageProcessor';
import { calculateGroupScore, normalizeWasteCategory } from '../postprocessing/mapper';
import { getConfidenceLevel } from '../postprocessing/confidence';
import type { ClassificationResult } from '@ecosort/types';
import { loadModelWithFallback } from './modelLoader';
import type { ModelInfo } from './modelLoader';

// Configure ONNX Runtime environment
ort.env.wasm.numThreads = 2; // Force > 1 so it fetches ort-wasm-simd-threaded.jsep.wasm (missing in 1.27.0 single thread)
ort.env.wasm.simd = true;
// Set explicit path so it doesn't fallback to index.html and fail silently
ort.env.wasm.wasmPaths = '/node_modules/onnxruntime-web/dist/';

let activeModel: ModelInfo | null = null;

// Phase 9: Confidence Calibration (Temperature Scaling)
const TEMPERATURE = 1.5;

function softmaxWithTemperature(arr: Float32Array): Float32Array {
  const scaled = arr.map(x => x / TEMPERATURE);
  const max = Math.max(...Array.from(scaled));
  const exps = scaled.map(x => Math.exp(x - max));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return new Float32Array(exps.map(x => x / sumExps));
}

self.onmessage = async (e: MessageEvent) => {
  const { type, imageSrc } = e.data;
  
  if (type === 'INIT') {
    try {
      if (!activeModel) activeModel = await loadModelWithFallback();
      
      // Model Warmup is now handled inside loadModelWithFallback to safely test WebGPU
      self.postMessage({ type: 'INIT_DONE' });
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: (err as Error).message });
    }
  } else if (type === 'INFER' && imageSrc) {
    let tensor: ort.Tensor | null = null;
    try {
      if (!activeModel) activeModel = await loadModelWithFallback();
      const { session, classes, backend, modelVersion } = activeModel;

      self.postMessage({ type: 'PROGRESS', step: 'Preprocessing Image' });
      const processed = await processImage(imageSrc);
      tensor = processed.tensor;
      const warnings = processed.warnings;
      
      const feeds = { [session.inputNames[0]]: tensor };
      
      self.postMessage({ type: 'PROGRESS', step: `Running Local AI (${modelVersion})` });
      const startInference = performance.now();
      const results = await session.run(feeds);
      const inferenceTimeMs = Math.round(performance.now() - startInference);
      
      self.postMessage({ type: 'PROGRESS', step: 'Post Processing' });
      const outputName = session.outputNames[0];
      const outputTensor = results[outputName];
      
      // Memory cleanup (Phase 13)
      tensor.dispose();
      
      const probabilities = softmaxWithTemperature(outputTensor.data as Float32Array);
      outputTensor.dispose();
      
      const top5Indices = Array.from(probabilities)
        .map((prob, idx) => ({ prob, idx }))
        .sort((a, b) => b.prob - a.prob)
        .slice(0, 5);
      
      const rawPredictions = top5Indices.map(item => ({
        className: classes[item.idx] || `Unknown-${item.idx}`,
        prob: item.prob
      }));
      
      let topResults: ClassificationResult[] = [];
      
      // Phase 10: Category Voting (now applies to all outputs)
      const groupScore = calculateGroupScore(rawPredictions);
      if (groupScore) {
        topResults.push({
          className: 'Voted Group',
          mappedCategory: groupScore.category,
          confidence: groupScore.confidence,
          modelConfidence: rawPredictions[0].prob, // Raw highest individual prob
          rawPredictions
        });
      } else {
        topResults.push({
          className: rawPredictions[0].className,
          mappedCategory: normalizeWasteCategory(rawPredictions[0].className),
          confidence: rawPredictions[0].prob,
          modelConfidence: rawPredictions[0].prob,
          rawPredictions
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
          backend,
          modelVersion,
          warnings
        }
      });

    } catch (err) {
      if (tensor) {
          tensor.dispose();
      }
      const errorObj = err as Error;
      self.postMessage({ 
        type: 'ERROR', 
        error: errorObj.message, 
        stack: errorObj.stack 
      });
    }
  }
};
