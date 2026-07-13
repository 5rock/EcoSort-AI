import { useTranslation } from 'react-i18next';
import { Info, ExternalLink } from 'lucide-react';

export default function AboutCard() {
  const { t } = useTranslation();

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300"><Info size={20} /></div>
        <span className="font-semibold text-gray-900 dark:text-gray-100">EcoSort AI</span>
      </div>
      
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.version')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">2.0.0</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.ai_runtime')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">ONNX Runtime Web</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.ai_model')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">MobileNetV2</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.license')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">MIT</span>
        </div>
      </div>
      
      <div className="flex gap-4 mt-2">
        <a href="#" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
          {t('profile.github')} <ExternalLink size={14} />
        </a>
        <a href="#" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
          {t('profile.privacy_policy')} <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}