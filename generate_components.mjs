import fs from 'fs';
import path from 'path';

const componentsDir = path.join('apps/web/src/features/profile/components');
fs.mkdirSync(componentsDir, { recursive: true });

const generateComponent = (name, content) => {
  fs.writeFileSync(path.join(componentsDir, `${name}.tsx`), content);
};

generateComponent('ThemeCard', `import { useTranslation } from 'react-i18next';
import { Monitor } from 'lucide-react';
import { useSettingsStore, type Theme } from '../../../../stores/settingsStore';

export default function ThemeCard() {
  const { t } = useTranslation();
  const { theme, setTheme } = useSettingsStore();

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
}`);

generateComponent('RegionCard', `import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useSettingsStore, type Region } from '../../../../stores/settingsStore';

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
}`);

generateComponent('LanguageCard', `import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useSettingsStore, type Language } from '../../../../stores/settingsStore';

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
}`);

generateComponent('CloudSyncCard', `import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

export default function CloudSyncCard() {
  const { t } = useTranslation();

  return (
    <div className="p-4 flex items-start justify-between">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-gray-100 dark:bg-gray-700/40 rounded-xl text-gray-500 dark:text-gray-400"><Shield size={20} /></div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.cloud_sync')}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">{t('profile.guest_mode')}</span>
        </div>
        <p className="text-xs text-gray-500 ml-11 mt-1 font-medium">{t('profile.sign_in_enable')}:</p>
        <ul className="text-xs text-gray-400 ml-11 mt-1 space-y-1 list-disc list-inside">
          <li>{t('profile.encrypted_backup')}</li>
          <li>{t('profile.multi_device')}</li>
          <li>{t('profile.sync_across')}</li>
        </ul>
      </div>
      <div className="w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-full relative shadow-inner cursor-not-allowed mt-1">
        <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-gray-400 rounded-full shadow-sm"></div>
      </div>
    </div>
  );
}`);

generateComponent('AIStatusCard', `import { useTranslation } from 'react-i18next';

export default function AIStatusCard() {
  const { t } = useTranslation();

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
          <span className="text-xs text-gray-500">{t('profile.ai_internet')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.ai_not_required')}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{t('profile.ai_privacy')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.ai_images_stay')}</span>
        </div>
      </div>
    </div>
  );
}`);

generateComponent('StorageCard', `import { useTranslation } from 'react-i18next';
import { Database } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../../offline/db';
import { useEffect, useState } from 'react';

export default function StorageCard() {
  const { t } = useTranslation();
  const scansCount = useLiveQuery(() => db.scans.count()) || 0;
  const scans = useLiveQuery(() => db.scans.toArray()) || [];
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
}`);

generateComponent('ExportCard', `import { useTranslation } from 'react-i18next';
import { FileJson, FileText, ChevronRight } from 'lucide-react';
import { db } from '../../../../offline/db';
import { motion } from 'framer-motion';

export default function ExportCard() {
  const { t } = useTranslation();

  const handleExportJSON = async () => {
    const data = await db.scans.toArray();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`ecosort-data-\${new Date().toISOString().split('T')[0]}.json\`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = async () => {
    const data = await db.scans.toArray();
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => typeof v === 'string' ? \`"\${v}"\` : v).join(',')).join('\\n');
    const blob = new Blob([headers + '\\n' + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`ecosort-data-\${new Date().toISOString().split('T')[0]}.csv\`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
      <motion.button 
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
        whileTap={{ scale: 0.98 }}
        onClick={handleExportJSON}
        className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300"><FileJson size={20} /></div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.export_json')}</span>
        </div>
        <ChevronRight size={20} className="text-gray-400" />
      </motion.button>

      <motion.button 
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
        whileTap={{ scale: 0.98 }}
        onClick={handleExportCSV}
        className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300"><FileText size={20} /></div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{t('profile.export_csv')}</span>
        </div>
        <ChevronRight size={20} className="text-gray-400" />
      </motion.button>
    </div>
  );
}`);

generateComponent('AboutCard', `import { useTranslation } from 'react-i18next';
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
}`);

generateComponent('PrivacyDashboard', `import { useTranslation } from 'react-i18next';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../../offline/db';

export default function PrivacyDashboard() {
  const { t } = useTranslation();
  const scans = useLiveQuery(() => db.scans.toArray()) || [];
  const imagesCount = scans.filter(s => s.thumbnail || s.originalImage).length;

  const handleDeleteAll = async () => {
    if (confirm(t('profile.delete_history') + '?')) {
      await db.scans.clear();
      alert('History cleared successfully.');
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
}`);
