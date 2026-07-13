import { motion } from 'framer-motion';
import { Share2, RefreshCcw, Check, Trash2, Leaf, AlertTriangle, Info, ShieldCheck, Download } from 'lucide-react';
import type { WasteIntelligenceResult } from '@ecosort/types';

interface Props {
  result: WasteIntelligenceResult;
  imageSrc: string;
  onScanAgain: () => void;
  onSave: () => void;
  isSaved: boolean;
  onManualOverride?: (category: string) => void;
}

export default function WasteIntelligenceReport({ result, imageSrc, onScanAgain, onSave, isSaved, onManualOverride }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-6 pb-24"
    >
      {/* Header Image */}
      <div className="relative">
        <img 
          src={imageSrc} 
          alt="Scanned item" 
          className="w-full h-64 object-cover rounded-3xl shadow-elevation-2"
        />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-lg border border-white/20">
            <h2 className="text-2xl font-black">{result.category}</h2>
            <div className="flex items-center gap-2 mt-1 opacity-90">
              <span className="text-sm font-medium">Recognition Quality</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className={`w-3 h-3 ${star <= (result.level === 'High' ? 5 : result.level === 'Medium' ? 3 : 1) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Confidence State */}
      {result.category === 'Uncertain' ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-3xl border border-yellow-200 dark:border-yellow-900/30 shadow-sm">
          <h3 className="text-lg font-black text-yellow-800 dark:text-yellow-500 mb-3 flex items-center gap-2">
            <AlertTriangle size={20} /> We're not fully confident.
          </h3>
          <p className="text-yellow-900 dark:text-yellow-100 font-medium mb-4">
            The AI is unsure. Please select the correct category:
          </p>
          
          <div className="space-y-2 mb-6">
            {result.rawPredictions && result.rawPredictions.slice(0, 4).map((pred, idx) => (
              <button 
                key={idx}
                onClick={() => onManualOverride && onManualOverride(pred.className)}
                className="w-full text-left bg-white dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 p-3 rounded-xl border border-yellow-200 dark:border-yellow-700/50 flex justify-between items-center transition-colors"
              >
                <span className="font-bold text-yellow-900 dark:text-yellow-100 capitalize">{pred.className.replace(/_/g, ' ')}</span>
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-500">
                  {Math.round(pred.prob * 100)}% Match
                </span>
              </button>
            ))}
          </div>

          <button onClick={onScanAgain} className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-2xl flex justify-center items-center gap-2 transition-colors">
            <RefreshCcw size={20} /> Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Disposal Recommendation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-800/50 flex items-center justify-between shadow-elevation-1">
            <div>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Dispose Here</p>
              <p className="text-xl font-extrabold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Trash2 size={24} /> {result.bin}
              </p>
            </div>
          </div>

          {/* Preparation Instructions */}
          {result.instructions && result.instructions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Check size={16} className="text-green-500" /> Preparation
              </h3>
              <ul className="space-y-3">
                {result.instructions.map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-800 dark:text-gray-200 font-medium">
                    <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full p-1">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Impact & Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.impact && (
              <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-3xl border border-green-100 dark:border-green-900/30 shadow-sm">
                <h3 className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Leaf size={16} /> Environmental Impact
                </h3>
                <p className="text-sm text-green-900 dark:text-green-100 font-medium leading-relaxed">{result.impact}</p>
              </div>
            )}

            {result.warnings && (
              <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-3xl border border-orange-100 dark:border-orange-900/30 shadow-sm">
                <h3 className="text-sm font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} /> Common Mistakes
                </h3>
                <p className="text-sm text-orange-900 dark:text-orange-100 font-medium leading-relaxed">{result.warnings}</p>
              </div>
            )}
          </div>

          {/* AI Explanation (Metadata) */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-3xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info size={16} /> AI Explanation
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Model Confidence</p>
                <p className="text-lg font-black text-gray-800 dark:text-gray-200">
                  {result.modelConfidence ? Math.round(result.modelConfidence * 100) : '--'}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Waste Confidence</p>
                <p className="text-lg font-black text-gray-800 dark:text-gray-200">
                  {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>

            {result.metrics && (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
                  Processed locally on-device in {result.metrics.inferenceTimeMs}ms.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm">
                    {result.metrics.modelVersion}
                  </span>
                  <span className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm uppercase">
                    {result.metrics.backend}
                  </span>
                  <span className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-xs font-bold text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 shadow-sm flex items-center gap-1">
                    <ShieldCheck size={12} /> 100% Private
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-2">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSave}
              disabled={isSaved}
              className={`w-full py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-elevation-2 transition-all ${isSaved ? 'bg-green-500 text-white shadow-none cursor-default' : 'bg-primary text-white hover:shadow-elevation-3'}`}
            >
              {isSaved ? <><Check size={20} /> Saved Successfully</> : <><Download size={20} /> Save Scan</>}
            </motion.button>
            
            <div className="flex gap-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onScanAgain}
                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCcw size={20} /> Scan Again
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 size={20} /> Share
              </motion.button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
