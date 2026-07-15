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
    warnings?: string[];
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
  
  // New RC2 fields
  ecoScore?: number;
  preparationSteps?: string[];
  facts?: string[];
  impactMetrics?: {
    carbon_saved_g: number;
    water_saved_l: number;
    energy_saved_kwh: number;
  };
  xpEarned?: number;
  possibleMatches?: string[];
  
  metrics?: {
    inferenceTimeMs: number;
    backend: string;
    modelVersion: string;
    warnings?: string[];
  };
}
