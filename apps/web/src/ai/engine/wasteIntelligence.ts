import type { InferenceResponse, WasteIntelligenceResult } from '@ecosort/types';

export async function processWasteIntelligence(
  inference: InferenceResponse, 
  region: string = 'global'
): Promise<WasteIntelligenceResult | null> {
  if (inference.error || !inference.results || inference.results.length === 0) return null;

  const topResult = inference.results[0];
  const mappedCategory = topResult.mappedCategory;

  if (!mappedCategory) {
    // Unknown or unmapped waste
    return {
      category: 'Unknown',
      confidence: topResult.confidence,
      level: inference.level,
      bin: 'General Waste / Landfill',
      instructions: ['Place in general waste bin.', 'We could not identify this item for recycling.'],
      impact: 'Unsorted waste goes to landfills.',
      warnings: 'If you suspect this is hazardous (batteries, chemicals), please check local guidelines manually.',
      metrics: inference.metrics
    };
  }

  try {
    // Try to fetch regional rules, fallback to global if not found
    let rulesRes = await fetch(`/rules/${region.toLowerCase()}.json`);
    if (!rulesRes.ok) {
      rulesRes = await fetch('/rules/global.json');
    }
    
    const rulesData = await rulesRes.json();
    let rule = rulesData.rules.find((r: any) => r.category === mappedCategory);

    // If region doesn't have rule for this category, fallback to global
    if (!rule) {
      const globalRes = await fetch('/rules/global.json');
      const globalData = await globalRes.json();
      rule = globalData.rules.find((r: any) => r.category === mappedCategory);
    }

    if (!rule) throw new Error('No rule found even in global fallback');

    return {
      category: mappedCategory,
      confidence: topResult.confidence,
      level: inference.level,
      bin: rule.bin,
      instructions: rule.instructions,
      impact: rule.impact,
      warnings: rule.warnings || '',
      metrics: inference.metrics
    };
  } catch (err) {
    console.error("Failed to process waste intelligence:", err);
    return null;
  }
}
