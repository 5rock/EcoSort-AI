import type { InferenceResponse, WasteIntelligenceResult } from '@ecosort/types';
import { knowledgeEngine } from './knowledgeEngine';
import { impactEngine } from './impactEngine';

export async function processWasteIntelligence(
  inference: InferenceResponse, 
  region: string = 'global'
): Promise<WasteIntelligenceResult | null> {
  if (inference.error || !inference.results || inference.results.length === 0) return null;

  const topResult = inference.results[0];
  const mappedCategory = topResult.mappedCategory;

  // 1. Low Confidence Mode
  if (!mappedCategory || topResult.confidence < 0.6) {
    const rawMatches = inference.results
      .map(r => r.mappedCategory)
      .filter(Boolean);
    const uniqueMatches = Array.from(new Set(rawMatches)).slice(0, 4) as string[];

    return {
      category: topResult.confidence < 0.6 && uniqueMatches.length > 0 ? 'Possible Matches' : 'Unknown',
      confidence: topResult.confidence,
      modelConfidence: topResult.modelConfidence,
      rawPredictions: topResult.rawPredictions,
      level: inference.level,
      bin: 'General Waste / Landfill',
      instructions: ['Place in general waste bin.', 'We could not reliably identify this item.'],
      impact: 'Unsorted waste goes to landfills.',
      warnings: 'If you suspect this is hazardous, please check local guidelines manually.',
      possibleMatches: uniqueMatches,
      ecoScore: 0,
      xpEarned: 0,
      metrics: inference.metrics
    };
  }

  try {
    // 2. Fetch Base Regional Rules
    let rulesRes = await fetch(`/rules/${region.toLowerCase()}.json`).catch(() => null);
    if (!rulesRes || !rulesRes.ok) rulesRes = await fetch('/rules/global.json');
    const rulesData = await rulesRes.json();
    let rule = rulesData.rules.find((r: any) => r.category === mappedCategory) || 
               (await (await fetch('/rules/global.json')).json()).rules.find((r: any) => r.category === mappedCategory);

    if (!rule) throw new Error('No rule found even in global fallback');

    // 3. Fetch Gamification & Knowledge Data (RC2)
    const knowledge = await knowledgeEngine.getKnowledge(mappedCategory);
    const impactMetrics = await impactEngine.getImpactForCategory(mappedCategory);

    // Calculate EcoScore based on confidence + base score
    let ecoScore = 50;
    let prepSteps = rule.instructions;
    let facts = [rule.impact];
    
    if (knowledge) {
      ecoScore = Math.min(100, Math.round(knowledge.ecoScoreBase * topResult.confidence + (knowledge.ecoScoreBase * 0.2)));
      prepSteps = knowledge.preparation;
      facts = knowledge.facts;
    }

    // Default XP based on category priority
    const xpMap: Record<string, number> = {
      'Hazardous': 50,
      'E-Waste': 40,
      'Metal': 25,
      'Glass': 20,
      'Plastic': 15,
      'Paper': 15,
      'Organic': 10,
      'Mixed': 5
    };
    const xpEarned = xpMap[mappedCategory] || 10;

    return {
      category: mappedCategory,
      confidence: topResult.confidence,
      modelConfidence: topResult.modelConfidence,
      rawPredictions: topResult.rawPredictions,
      level: inference.level,
      bin: rule.bin,
      instructions: rule.instructions,
      impact: rule.impact,
      warnings: rule.warnings || '',
      
      // RC2 Additions
      ecoScore,
      preparationSteps: prepSteps,
      facts,
      impactMetrics,
      xpEarned,
      
      metrics: inference.metrics
    };
  } catch (err) {
    console.error("Failed to process waste intelligence:", err);
    return null;
  }
}
