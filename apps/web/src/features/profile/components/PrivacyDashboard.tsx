import { useTranslation } from 'react-i18next';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { historyRepository } from '../../../offline/repositories/historyRepository';
import { useEffect, useState } from 'react';

export default function PrivacyDashboard() {
  const { t } = useTranslation();
  const [scans, setScans] = useState<any[]>([]);
  
  useEffect(() => {
    historyRepository.getScansByUser().then(setScans);
  }, []);

  const imagesCount = scans.filter(s => s.thumbnail || s.originalImage).length;

  const handleDeleteAll = async () => {
    if (confirm(t('profile.privacy.confirmDelete'))) {
      await historyRepository.clearUserScans();
      setScans([]);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-700 dark:text-indigo-400"><ShieldCheck size={20} /></div>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.privacy_dashboard')}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.images_stored')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{imagesCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.uploaded')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">0</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">AI Processing</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.local_ai')}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.cloud_access')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.disabled')}</span>
        </div>
      </div>
      
      <button 
        onClick={handleDeleteAll}
        className="mt-4 w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 text-sm"
      >
        <Trash2 size={18} /> {t('profile.delete_all_images')}
      </button>
    </div>
  );
}