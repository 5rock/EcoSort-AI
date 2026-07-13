export interface ClassificationResult {
  className: string;
  mappedCategory: string | null;
  confidence: number;
  modelConfidence?: number;
  rawPredictions?: { className: string; prob: number }[];
}

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface InferenceResponse {
  results: ClassificationResult[];
  level: ConfidenceLevel;
  error?: string;
  metrics?: {
    inferenceTimeMs: number;
    backend: string;
    modelVersion: string;
  };
}

export interface WasteIntelligenceResult {
  category: string;
  confidence: number; // This is Waste Confidence
  modelConfidence?: number; // Raw model confidence
  rawPredictions?: { className: string; prob: number }[];
  level: ConfidenceLevel;
  bin: string;
  instructions: string[];
  impact: string;
  warnings: string;
  metrics?: {
    inferenceTimeMs: number;
    backend: string;
    modelVersion: string;
  };
}
