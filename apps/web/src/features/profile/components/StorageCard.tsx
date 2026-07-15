import { useTranslation } from 'react-i18next';
import { Database } from 'lucide-react';
import { historyRepository } from '../../../offline/repositories/historyRepository';
import { useEffect, useState } from 'react';

export default function StorageCard() {
  const { t } = useTranslation();
  const [scansCount, setScansCount] = useState(0);
  const [scans, setScans] = useState<any[]>([]);
  
  useEffect(() => {
    historyRepository.getScansByUser().then(data => {
      setScans(data);
      setScansCount(data.length);
    });
  }, []);
  const [storageEstimate, setStorageEstimate] = useState<string>('0 MB');

  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.usage) {
          setStorageEstimate((estimate.usage / (1024 * 1024)).toFixed(1) + ' MB');
        }
      });
    }
  }, [scansCount]);

  const imagesCount = scans.filter(s => s.thumbnail || s.originalImage).length;
  const lastScan = scans.length > 0 ? new Date(Math.max(...scans.map(s => s.timestamp))).toLocaleDateString() : 'N/A';

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-xl text-orange-700 dark:text-orange-400"><Database size={20} /></div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.storage')}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-2">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.scans')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{scansCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.images')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{imagesCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.history_size')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{storageEstimate}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.last_scan')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{lastScan}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.database')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">IndexedDB</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.status')}</span>
          <span className="font-semibold text-green-600 dark:text-green-400">{t('profile.healthy')}</span>
        </div>
      </div>
    </div>
  );
}