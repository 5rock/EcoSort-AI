import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useSettingsStore, type Language } from '../../../stores/settingsStore';

export default function LanguageCard() {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettingsStore();

  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl text-purple-700 dark:text-purple-400"><Globe size={20} /></div>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.language')}</span>
      </div>
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary py-2 cursor-pointer"
      >
        <option value="en">{t('profile.language_en')}</option>
        <option value="hi">{t('profile.language_hi')}</option>
        <option value="es">{t('profile.language_es')}</option>
        <option value="fr">{t('profile.language_fr')}</option>
        <option value="de">{t('profile.language_de')}</option>
      </select>
    </div>
  );
}