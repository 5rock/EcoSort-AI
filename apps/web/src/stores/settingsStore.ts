import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Region = 'global' | 'india' | 'usa' | 'uk';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi';
export type ImageStorageMode = 'none' | 'thumbnail' | 'original';

interface SettingsState {
  region: Region;
  language: Language;
  imageStorage: ImageStorageMode;
  setRegion: (region: Region) => void;
  setLanguage: (lang: Language) => void;
  setImageStorage: (mode: ImageStorageMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      region: 'global',
      language: 'en',
      imageStorage: 'thumbnail', // Recommended default
      setRegion: (region) => set({ region }),
      setLanguage: (language) => set({ language }),
      setImageStorage: (imageStorage) => set({ imageStorage }),
    }),
    {
      name: 'ecosort-settings',
    }
  )
);
