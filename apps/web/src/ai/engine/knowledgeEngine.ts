export interface WasteKnowledge {
  category: string;
  ecoScoreBase: number;
  description: string;
  preparation: string[];
  commonMistakes: string[];
  facts: string[];
}

class KnowledgeEngine {
  private cache: Map<string, WasteKnowledge> = new Map();

  async getKnowledge(category: string): Promise<WasteKnowledge | null> {
    const normalizedCategory = category.toLowerCase();
    
    if (this.cache.has(normalizedCategory)) {
      return this.cache.get(normalizedCategory)!;
    }

    try {
      const response = await fetch(`/knowledge/${normalizedCategory}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch knowledge for ${category}`);
      }
      const data: WasteKnowledge = await response.json();
      this.cache.set(normalizedCategory, data);
      return data;
    } catch (error) {
      console.warn(`Knowledge for category ${category} not found.`, error);
      return null;
    }
  }

  // Optional: Prefetch all if needed
  async prefetchCommon(): Promise<void> {
    const common = ['plastic', 'glass', 'paper', 'metal', 'organic'];
    await Promise.allSettled(common.map(cat => this.getKnowledge(cat)));
  }
}

export const knowledgeEngine = new KnowledgeEngine();
