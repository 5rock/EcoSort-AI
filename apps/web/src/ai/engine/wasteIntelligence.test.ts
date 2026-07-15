import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processWasteIntelligence } from './wasteIntelligence';

// Mock the global fetch API to simulate fetching rules.json
globalThis.fetch = vi.fn();

describe('processWasteIntelligence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        rules: [
          {
            category: 'Plastic',
            bin: 'Recycling Bin',
            instructions: ['Rinse', 'Crush'],
            impact: 'Reduces ocean pollution'
          }
        ]
      })
    });
  });

  it('should return Unknown for unmapped categories', async () => {
    const inference = { results: [{ mappedCategory: undefined, confidence: 0.9 }], level: 'High' };
    const result = await processWasteIntelligence(inference as any);
    expect(result?.category).toBe('Unknown');
  });

  it('should return Possible Matches for low confidence predictions', async () => {
    const inference = { results: [{ mappedCategory: 'Plastic', confidence: 0.4 }], level: 'Low' };
    const result = await processWasteIntelligence(inference as any);
    expect(result?.category).toBe('Possible Matches');
  });

  it('should return mapped category for high confidence predictions', async () => {
    const inference = { results: [{ mappedCategory: 'Plastic', confidence: 0.85 }], level: 'High' };
    const result = await processWasteIntelligence(inference as any);
    expect(result?.category).toBe('Plastic');
    expect(result?.bin).toBe('Recycling Bin');
  });
});
