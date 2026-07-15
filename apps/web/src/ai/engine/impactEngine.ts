export interface ImpactMetrics {
  carbon_saved_g: number;
  water_saved_l: number;
  energy_saved_kwh: number;
}

export interface ImpactKnowledge {
  source: string;
  [category: string]: ImpactMetrics | string;
}

class ImpactEngine {
  private metrics: Record<string, ImpactMetrics> = {};
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const response = await fetch('/knowledge/impact.json');
      if (response.ok) {
        const data: ImpactKnowledge = await response.json();
        for (const key in data) {
          if (key !== 'source') {
            this.metrics[key.toLowerCase()] = data[key] as ImpactMetrics;
          }
        }
      }
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to load impact metrics', error);
    }
  }

  async getImpactForCategory(category: string): Promise<ImpactMetrics> {
    await this.init();
    const normalized = category.toLowerCase();
    if (this.metrics[normalized]) {
      return this.metrics[normalized];
    }
    
    // Default fallback if not found
    return {
      carbon_saved_g: 0,
      water_saved_l: 0,
      energy_saved_kwh: 0
    };
  }
}

export const impactEngine = new ImpactEngine();
