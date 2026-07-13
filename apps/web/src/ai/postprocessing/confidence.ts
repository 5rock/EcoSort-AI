import type { ConfidenceLevel } from '@ecosort/types';

export function getConfidenceLevel(probability: number): ConfidenceLevel {
  // Multiply by 100 if it's a 0-1 probability
  const percentage = probability <= 1.0 ? probability * 100 : probability;
  
  if (percentage >= 90) return 'High';
  if (percentage >= 70) return 'Medium';
  return 'Low';
}
