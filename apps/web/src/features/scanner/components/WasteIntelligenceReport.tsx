import { motion } from 'framer-motion';
import { Share2, RefreshCcw, Check, AlertTriangle, Info, ShieldCheck, Download, Star, Cloud, Droplets, Zap, Volume2, Lightbulb } from 'lucide-react';
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
  const playVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stop previous
      const text = `This is ${result.category}. ${result.preparationSteps?.[0] || 'Please recycle properly.'}`;
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

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
            <h2 className="text-2xl font-black capitalize">{result.category}</h2>
            <div className="flex items-center gap-2 mt-1 opacity-90">
              <span className="text-sm font-medium">Bin: {result.bin}</span>
            </div>
          </div>
          
          <button 
            onClick={playVoice}
            className="bg-primary hover:bg-primary-dark text-white p-3 rounded-full shadow-lg border border-white/20 backdrop-blur-md transition-transform active:scale-95"
            title="Listen"
          >
            <Volume2 size={24} />
          </button>
        </div>
      </div>

      {/* Low Confidence State */}
      {result.category === 'Possible Matches' || result.category === 'Unknown' ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-3xl border border-yellow-200 dark:border-yellow-900/30 shadow-sm">
          <h3 className="text-lg font-black text-yellow-800 dark:text-yellow-500 mb-3 flex items-center gap-2">
            <AlertTriangle size={20} /> We're not fully confident.
          </h3>
          <p className="text-yellow-900 dark:text-yellow-100 font-medium mb-4">
            The AI is unsure. Please select the correct category:
          </p>
          
          <div className="space-y-2 mb-6">
            {result.possibleMatches && result.possibleMatches.map((match, idx) => (
              <button 
                key={idx}
                onClick={() => onManualOverride && onManualOverride(match)}
                className="w-full text-left bg-white dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 p-3 rounded-xl border border-yellow-200 dark:border-yellow-700/50 flex justify-between items-center transition-colors"
              >
                <span className="font-bold text-yellow-900 dark:text-yellow-100 capitalize">{match.replace(/_/g, ' ')}</span>
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-500">
                  Select
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
          {/* Quality Warnings (Phase 11) */}
          {result.metrics?.warnings && result.metrics.warnings.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-200 dark:border-orange-800 shadow-sm flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400 font-bold">
                <AlertTriangle size={18} />
                <span>Image Quality Warning</span>
              </div>
              <ul className="list-disc list-inside text-sm text-orange-700 dark:text-orange-300">
                {result.metrics.warnings.map((w: string, i: number) => (
                  <li key={i}>{w === 'IMAGE_TOO_DARK' ? 'Image is very dark.' : w === 'IMAGE_TOO_BRIGHT' ? 'Image is very bright.' : w === 'IMAGE_TOO_BLURRY' ? 'Image is blurry.' : w}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Scan Summary Card (RC2) */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/20 p-6 rounded-3xl border border-green-200 dark:border-green-800/50 shadow-elevation-2 relative overflow-hidden">
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider mb-1">EcoScore</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-green-900 dark:text-green-100 leading-none">{result.ecoScore}</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-500 mb-1">/ 100</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-1.5">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-black text-gray-800 dark:text-gray-200">+{result.xpEarned} XP</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-2xl flex flex-col items-center justify-center text-center backdrop-blur-sm border border-white/40 dark:border-gray-700/50">
                <Cloud size={22} className="text-gray-600 dark:text-gray-400 mb-1" />
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.impactMetrics?.carbon_saved_g}g</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">CO₂ Saved</span>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-2xl flex flex-col items-center justify-center text-center backdrop-blur-sm border border-white/40 dark:border-gray-700/50">
                <Droplets size={22} className="text-blue-500 mb-1" />
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.impactMetrics?.water_saved_l}L</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Water Saved</span>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-2xl flex flex-col items-center justify-center text-center backdrop-blur-sm border border-white/40 dark:border-gray-700/50">
                <Zap size={22} className="text-yellow-500 mb-1" />
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{result.impactMetrics?.energy_saved_kwh}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">kWh Saved</span>
              </div>
            </div>
          </div>

          {/* Smart Preparation Guide */}
          {result.preparationSteps && result.preparationSteps.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Check size={18} className="text-green-500" /> Before Recycling
              </h3>
              <ul className="space-y-3">
                {result.preparationSteps.map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-800 dark:text-gray-200 font-medium bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                    <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full p-1 shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Did You Know (Facts) */}
          {result.facts && result.facts.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Lightbulb size={16} /> Did You Know?
              </h3>
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium leading-relaxed italic">
                "{result.facts[Math.floor(Math.random() * result.facts.length)]}"
              </p>
            </div>
          )}

          {/* AI Explanation (Metadata) */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-3xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info size={16} /> AI Decision
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Detected Confidence</p>
                <p className="text-lg font-black text-gray-800 dark:text-gray-200">
                  {Math.round(result.confidence * 100)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Model Layer</p>
                <p className="text-lg font-black text-gray-800 dark:text-gray-200">
                  {result.modelConfidence ? Math.round(result.modelConfidence * 100) : '--'}%
                </p>
              </div>
            </div>

            {result.metrics && (
              <>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm">
                    Inference: {result.metrics.inferenceTimeMs}ms
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
