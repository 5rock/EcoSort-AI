import { useState, useMemo, useEffect } from 'react';
import { historyRepository } from '../../../offline/repositories/historyRepository';
import { gamificationRepository } from '../../../offline/repositories/gamificationRepository';
import { Trash2, Activity, FolderOpen, AlertTriangle, Cloud, Droplets, Zap, Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScanHistoryRecord } from '../../../offline/db';
import { useAuthStore } from '../../authentication/stores/authStore';

export default function CarbonDashboard() {
  const [scans, setScans] = useState<ScanHistoryRecord[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuthStore();
  
  useEffect(() => {
    const loadData = async () => {
      const userId = user?.id;
      const fetchedScans = await historyRepository.getScansByUser(userId);
      setScans(fetchedScans);
      
      if (userId) {
        const userProfile = await gamificationRepository.getProfile(userId);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    };
    loadData();
  }, [user?.id]);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (deleteId) {
      await historyRepository.deleteScan(deleteId);
      setScans(scans.filter(s => s.id !== deleteId));
      setDeleteId(null);
    }
  };

  const impactStats = useMemo(() => {
    let carbon = 0, water = 0, energy = 0, xp = 0;
    scans.forEach(s => {
      carbon += s.carbonSaved || 0;
      water += s.waterSaved || 0;
      energy += s.energySaved || 0;
      xp += s.xpEarned || 0;
    });
    return { carbon, water, energy, xp, totalScans: scans.length };
  }, [scans]);

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24 relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Your Impact</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-1">Sustainability Dashboard</p>
        </div>
      </div>

      {/* Gamification Card */}
      {profile && (
        <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-3xl p-6 text-white mb-6 shadow-elevation-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20">
            <Trophy size={120} />
          </div>
          <div className="flex justify-between items-end relative z-10">
            <div>
              <p className="text-sm font-bold text-emerald-100 uppercase tracking-wider mb-1">Level {profile.level}</p>
              <h3 className="text-3xl font-black mb-1">Eco Warrior</h3>
              <p className="text-emerald-50 font-medium text-sm">Total XP: {profile.xp}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/30">
              <Star className="fill-yellow-400 text-yellow-400" size={20} />
              <span className="font-bold">{impactStats.xp} XP Earned</span>
            </div>
          </div>
          
          <div className="mt-5 bg-black/10 rounded-full h-3 overflow-hidden border border-white/20">
            <div 
              className="bg-yellow-400 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${(profile.xp % 100)}%` }} 
            />
          </div>
          <p className="text-xs text-emerald-100 font-medium mt-2 text-right">
            {100 - (profile.xp % 100)} XP to Level {profile.level + 1}
          </p>
        </div>
      )}

      {/* Environmental Impact Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center">
          <Activity className="text-blue-500 mb-2" size={28} />
          <span className="text-3xl font-black text-gray-900 dark:text-gray-100">{impactStats.totalScans}</span>
          <span className="text-xs font-bold text-gray-500 uppercase mt-1">Total Scans</span>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center">
          <Cloud className="text-gray-500 mb-2" size={28} />
          <span className="text-3xl font-black text-gray-900 dark:text-gray-100">{(impactStats.carbon / 1000).toFixed(1)}kg</span>
          <span className="text-xs font-bold text-gray-500 uppercase mt-1">CO₂ Saved</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center">
          <Droplets className="text-blue-400 mb-2" size={28} />
          <span className="text-3xl font-black text-gray-900 dark:text-gray-100">{impactStats.water.toFixed(1)}L</span>
          <span className="text-xs font-bold text-gray-500 uppercase mt-1">Water Saved</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center">
          <Zap className="text-yellow-500 mb-2" size={28} />
          <span className="text-3xl font-black text-gray-900 dark:text-gray-100">{impactStats.energy.toFixed(1)}</span>
          <span className="text-xs font-bold text-gray-500 uppercase mt-1">kWh Saved</span>
        </div>
      </div>
      
      {scans && scans.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700">
          <FolderOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No scans yet</h3>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Head over to the Scan tab and start analyzing waste to build your history!</p>
        </motion.div>
      )}

      {scans && scans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Recent Scans</h3>
          <AnimatePresence>
            {scans.slice(0, 10).map((scan, index) => (
              <motion.div 
                key={scan.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 flex gap-4 transition-shadow hover:shadow-elevation-2"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center shadow-inner relative">
                  {scan.thumbnail ? (
                    <img src={scan.thumbnail} alt={scan.category} className="w-full h-full object-cover" />
                  ) : (
                    <FolderOpen className="text-gray-300 dark:text-gray-500" size={24} />
                  )}
                  {scan.ecoScore && (
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm">
                      {scan.ecoScore}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-tight capitalize">{scan.category}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-bold text-gray-500">{new Date(scan.timestamp).toLocaleDateString()}</span>
                        {scan.xpEarned && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-xs font-bold text-yellow-500">+{scan.xpEarned} XP</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg">
                      <Trash2 size={12} />
                      <span>{scan.bin}</span>
                    </div>
                    
                    <div className="flex gap-2">
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
      )}

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
