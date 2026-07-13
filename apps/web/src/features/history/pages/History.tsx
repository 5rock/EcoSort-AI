import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../offline/db';
import { Trash2, Search, Activity, FolderOpen, Download, AlertTriangle, Eye, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function History() {
  const scans = useLiveQuery(() => db.scans.orderBy('timestamp').reverse().toArray());
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);



  const confirmDelete = async () => {
    if (deleteId) {
      await db.scans.delete(deleteId);
      setDeleteId(null);
    }
  };

  const exportJSON = () => {
    if (!scans) return;
    const blob = new Blob([JSON.stringify(scans, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `ecosort-history-${new Date().toISOString().split('T')[0]}.json`);
    setShowExportMenu(false);
  };

  const exportCSV = () => {
    if (!scans) return;
    const headers = ['ID', 'Date', 'Category', 'Confidence', 'Bin', 'Region'];
    const rows = scans.map(s => [
      s.id, 
      new Date(s.timestamp).toISOString(), 
      s.category, 
      s.confidence.toString(), 
      s.bin, 
      s.region
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadBlob(blob, `ecosort-history-${new Date().toISOString().split('T')[0]}.csv`);
    setShowExportMenu(false);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredScans = useMemo(() => {
    if (!scans) return [];
    if (!searchTerm) return scans;
    const lowerSearch = searchTerm.toLowerCase();
    return scans.filter(s => 
      s.category.toLowerCase().includes(lowerSearch) || 
      s.bin.toLowerCase().includes(lowerSearch)
    );
  }, [scans, searchTerm]);

  const stats = useMemo(() => {
    if (!scans || scans.length === 0) return null;
    const total = scans.length;
    const categoryCount: Record<string, number> = {};
    scans.forEach(s => {
      categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
    });
    
    // Sort categories by count
    const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0][0];
    
    return { total, topCategory, breakdown: sortedCategories.slice(0, 4) };
  }, [scans]);

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24 relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Your Impact</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-1">Review your scanning history</p>
        </div>
        <div className="flex gap-3 relative">
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={!scans || scans.length === 0}
              className="flex items-center gap-1 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl text-sm font-bold disabled:opacity-50"
            >
              <Download size={16} /> Export <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-10 mt-1 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-elevation-3 border border-gray-100 dark:border-gray-700 overflow-hidden z-20"
                >
                  <button onClick={exportJSON} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">JSON</button>
                  <button onClick={exportCSV} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">CSV</button>
                  <button disabled className="w-full text-left px-4 py-3 text-sm font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed">PDF (Soon)</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 p-5 mb-6">
          <div className="flex items-end justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <span className="text-4xl font-black text-gray-900 dark:text-white">{stats.total}</span>
              <span className="text-sm font-bold text-gray-500 ml-2 uppercase tracking-wider">Total Scans</span>
            </div>
            <Activity className="text-blue-500" size={32} />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.breakdown.map(([cat, count]) => (
              <div key={cat} className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">{cat}</span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-medium"
          placeholder="Search scans by item or bin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {!scans && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      {scans && scans.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700">
          <FolderOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No scans yet</h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Head over to the Scan tab and start analyzing waste to build your history!</p>
        </motion.div>
      )}

      {scans && scans.length > 0 && filteredScans.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 font-medium">No results found for "{searchTerm}"</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Recent Scans</h3>
        <AnimatePresence>
          {filteredScans.map((scan, index) => (
            <motion.div 
              key={scan.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 flex gap-4 transition-shadow hover:shadow-elevation-2"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                {scan.thumbnail ? (
                  <img src={scan.thumbnail} alt={scan.category} className="w-full h-full object-cover" />
                ) : (
                  <FolderOpen className="text-gray-300 dark:text-gray-500" size={24} />
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight">{scan.category}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold text-gray-500">{new Date(scan.timestamp).toLocaleDateString()}</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className={`text-xs font-bold ${scan.confidence >= 0.9 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {(scan.confidence * 100).toFixed(0)}% Match
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg">
                    <Trash2 size={12} />
                    <span>{scan.bin}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-primary focus:ring-2 focus:ring-primary outline-none transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-xl" title="View Details" aria-label="View Details">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => setDeleteId(scan.id)} className="p-2 text-gray-400 hover:text-red-500 focus:ring-2 focus:ring-red-500 outline-none transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-xl" title="Delete Scan" aria-label="Delete Scan">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Scan?</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">This action cannot be undone. Are you sure you want to remove this item from your history?</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-elevation-1"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
