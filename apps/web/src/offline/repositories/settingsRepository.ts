export const settingsRepository = {
  get(key: string): string | null {
    return localStorage.getItem(key);
  },
  
  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  },
  
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  
  clearAllSettings(): void {
    const ecoKeys = Object.keys(localStorage).filter(k => k.startsWith('eco_') || k === 'theme');
    ecoKeys.forEach(k => localStorage.removeItem(k));
  }
};
