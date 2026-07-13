const SYNONYM_GROUPS: Record<string, string[]> = {
  'Plastic': [
    'water bottle', 'pop bottle', 'sports bottle', 'milk bottle', 'detergent bottle', 'shampoo bottle', 'plastic bag'
  ],
  'Glass': [
    'wine bottle', 'beer bottle', 'vase', 'beaker', 'goblet', 'pitcher'
  ],
  'Organic Waste': [
    'banana', 'apple', 'orange', 'pineapple', 'vegetable', 'food'
  ],
  'Metal Can': [
    'soda can', 'tin', 'aluminum can', 'steel can'
  ],
  'Paper': [
    'newspaper', 'cardboard', 'book', 'notebook', 'magazine', 'pizza box'
  ],
  'E-Waste': [
    'keyboard', 'mouse', 'laptop', 'monitor', 'cellphone', 'charger', 'tablet'
  ],
  'Hazardous': [
    'battery', 'lighter'
  ]
};

/**
 * Normalizes an ImageNet label for fuzzy matching
 */
function normalize(label: string): string {
  return label.toLowerCase().replace(/_/g, ' ');
}

/**
 * Finds the corresponding Waste Category for a single label
 */
export function mapToWasteCategory(imagenetClassName: string): string | null {
  const normalized = normalize(imagenetClassName);
  for (const [category, synonyms] of Object.entries(SYNONYM_GROUPS)) {
    if (synonyms.some(syn => normalized.includes(syn))) {
      return category;
    }
  }
  return null;
}

/**
 * Phase 4: Voting Logic
 * Takes the top N predictions and sums their probabilities by Waste Category.
 */
export function calculateGroupScore(predictions: { className: string, prob: number }[]): { category: string, confidence: number } | null {
  const scores: Record<string, number> = {};
  
  for (const pred of predictions) {
    const category = mapToWasteCategory(pred.className);
    if (category) {
      scores[category] = (scores[category] || 0) + pred.prob;
    }
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

