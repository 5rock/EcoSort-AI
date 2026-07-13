import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useSettingsStore, type Region } from '../../../stores/settingsStore';

export default function RegionCard() {
  const { t } = useTranslation();
  const { region, setRegion } = useSettingsStore();

  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-700 dark:text-blue-400"><Globe size={20} /></div>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.region_rules')}</span>
      </div>
      <select 
        value={region} 
        onChange={(e) => setRegion(e.target.value as Region)}
        className="bg-gray-50 dark:bg-gray-700 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary py-2 cursor-pointer"
      >
        <option value="global">Global Standard</option>
        <option value="india">India</option>
        <option value="usa">USA</option>
        <option value="uk">UK</option>
      </select>
    </div>
  );
}