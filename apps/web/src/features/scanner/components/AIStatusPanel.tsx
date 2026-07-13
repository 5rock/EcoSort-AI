import { Cpu, ShieldCheck, Zap, ServerOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIStatusPanel() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-elevation-1 border border-gray-100 dark:border-gray-700 w-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Local AI Status</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">
            <Cpu size={12} /> Model
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">MobileNetV2</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">
            <Zap size={12} /> Runtime
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">ONNX Web</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">
            <ServerOff size={12} /> Internet
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Not Required</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-2xl border border-green-100 dark:border-green-800/30">
          <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 mb-1 uppercase">
            <ShieldCheck size={12} /> Privacy
          </div>
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">100% On-Device</p>
        </div>
      </div>
    </motion.div>
  );
}
