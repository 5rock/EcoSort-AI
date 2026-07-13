import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { useAuthStore } from '../../authentication/store/authStore';

export default function CloudSyncCard() {
  const { t } = useTranslation();
  const { mode, cloudSyncEnabled, setCloudSync } = useAuthStore();
  const isGuest = mode === 'guest';

  const handleToggle = () => {
    if (!isGuest) {
      setCloudSync(!cloudSyncEnabled);
    }
  };

  return (
    <div className="p-4 flex items-start justify-between">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-gray-100 dark:bg-gray-700/40 rounded-xl text-gray-500 dark:text-gray-400"><Shield size={20} /></div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.cloud_sync')}</span>
          {isGuest && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">{t('profile.guest_mode')}</span>
          )}
        </div>
        
        {isGuest ? (
          <>
            <p className="text-xs text-gray-500 ml-11 mt-1 font-medium">{t('profile.sign_in_enable')}:</p>
            <ul className="text-xs text-gray-400 ml-11 mt-1 space-y-1 list-disc list-inside">
              <li>{t('profile.encrypted_backup')}</li>
              <li>{t('profile.multi_device')}</li>
              <li>{t('profile.sync_across')}</li>
            </ul>
          </>
        ) : (
          <p className="text-xs text-gray-500 ml-11 mt-1 font-medium">
            Sync your scan history and preferences securely across all your devices.
          </p>
        )}
      </div>
      
      <button 
        onClick={handleToggle}
        disabled={isGuest}
        className={`w-12 h-6 rounded-full relative mt-1 transition-colors ${
          isGuest ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-inner' 
          : cloudSyncEnabled ? 'bg-primary cursor-pointer' : 'bg-gray-300 dark:bg-gray-600 cursor-pointer'
        }`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all ${
          cloudSyncEnabled ? 'left-7 bg-white' : 'left-1 bg-white dark:bg-gray-400'
        }`}></div>
      </button>
    </div>
  );
}