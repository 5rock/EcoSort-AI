import { useTranslation } from 'react-i18next';

import { useState, useEffect } from 'react';

export default function AIStatusCard() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="font-bold text-green-700 dark:text-green-400">{t('profile.ai_status')}</span>
      </div>
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.ai_runtime')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">ONNX Runtime Web</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.ai_model')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">MobileNetV2</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.ai_backend')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">WebGPU / WASM</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.ai_inference')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.ai_100_local')}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Network Status</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isOnline ? 'Connected' : 'Offline'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.ai_privacy')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.ai_images_stay')}</span>
        </div>
      </div>
    </div>
  );
}