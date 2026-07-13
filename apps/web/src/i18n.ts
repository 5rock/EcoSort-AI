import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useSettingsStore } from './stores/settingsStore';

import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import es from './locales/es/translation.json';
import fr from './locales/fr/translation.json';
import de from './locales/de/translation.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de }
};

// Safely read from localStorage synchronously to avoid hydration flickers
const storedSettings = localStorage.getItem('ecosort-settings');
let initialLng = 'en';
if (storedSettings) {
  try {
    const parsed = JSON.parse(storedSettings);
    if (parsed && parsed.state && parsed.state.language) {
      initialLng = parsed.state.language;
    }
  } catch (e) {
    console.warn('Failed to parse language from localStorage', e);
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

// Listen for store changes to keep i18n synced
useSettingsStore.subscribe((state) => {
  if (i18n.language !== state.language) {
    i18n.changeLanguage(state.language);
  }
});

export default i18n;
