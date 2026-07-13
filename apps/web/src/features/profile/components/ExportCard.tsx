import { useTranslation } from 'react-i18next';
import { FileJson, FileText, ChevronRight } from 'lucide-react';
import { db } from '../../../offline/db';
import { motion } from 'framer-motion';

export default function ExportCard() {
  const { t } = useTranslation();

  const handleExportJSON = async () => {
    const data = await db.scans.toArray();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecosort-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = async () => {
    const data = await db.scans.toArray();
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(v => typeof v === 'string' ? `"${v}"` : v).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecosort-data-${new Date().toISOString().split('T')[0]}.csv`;
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
}