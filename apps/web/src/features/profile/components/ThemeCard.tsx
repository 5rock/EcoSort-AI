import { useTranslation } from 'react-i18next';
import { Monitor } from 'lucide-react';
import { useThemeStore, type Theme } from '../../../stores/themeStore';

export default function ThemeCard() {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300"><Monitor size={20} /></div>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.theme')}</span>
      </div>
      <select 
        value={theme} 
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary py-2 cursor-pointer"
      >
        <option value="system">{t('profile.theme_system')}</option>
        <option value="light">{t('profile.theme_light')}</option>
        <option value="dark">{t('profile.theme_dark')}</option>
      </select>
    </div>
  );
}