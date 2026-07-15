/**
 * Normalizes a direct waste category output (from our custom model)
 * e.g., 'plastic' -> 'Plastic'
 */
export function normalizeWasteCategory(rawCategory: string): string {
  if (!rawCategory) return 'Unknown';
  
  // Standard 9 classes
  const targetClasses: Record<string, string> = {
    'plastic': 'Plastic',
    'glass': 'Glass',
    'paper': 'Paper',
    'metal': 'Metal',
    'organic': 'Organic',
    'ewaste': 'E-Waste',
    'hazardous': 'Hazardous',
    'textile': 'Textile',
    'mixed': 'Mixed'
  };
  
  const lower = rawCategory.toLowerCase();
  if (targetClasses[lower]) {
    return targetClasses[lower];
  }
  
  return rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
}

/**
 * Phase 10: Voting Logic
 * Takes the top N predictions and sums their probabilities by Waste Category.
 * Since the native model outputs standard categories, it simply sums them up if there are duplicates (though unlikely).
 */
export function calculateGroupScore(predictions: { className: string, prob: number }[]): { category: string, confidence: number } | null {
  const scores: Record<string, number> = {};
  
  for (const pred of predictions) {
    const category = normalizeWasteCategory(pred.className);
    scores[category] = (scores[category] || 0) + pred.prob;
  }
  
  let bestCategory: string | null = null;
  let maxScore = 0;
  
  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat;
    }
  }
  
  if (!bestCategory) return null;
  
  return { category: bestCategory, confidence: maxScore };
}


