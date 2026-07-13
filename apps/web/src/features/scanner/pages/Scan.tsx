import { useState, useEffect } from 'react';
import CameraView from '../components/CameraView';
import WasteIntelligenceReport from '../components/WasteIntelligenceReport';
import AIStatusPanel from '../components/AIStatusPanel';
import { aiEngine } from '../../../ai/engine/aiEngine';
import { processWasteIntelligence } from '../../../ai/engine/wasteIntelligence';
import type { WasteIntelligenceResult } from '@ecosort/types';
import { db } from '../../../offline/db';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../../../stores/settingsStore';
import { CheckCircle2, Cpu, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

type ScanStage = 'camera' | 'preview' | 'analyzing' | 'result' | 'error';

export default function Scan() {
  const [stage, setStage] = useState<ScanStage>('camera');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<WasteIntelligenceResult | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const { region, imageStorage } = useSettingsStore();

  useEffect(() => {
    aiEngine.init().then(() => setModelReady(true)).catch(() => setModelReady(false));
  }, []);

  const handleCapture = (imageSrc: string) => {
    setImage(imageSrc);
    setStage('preview');
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setStage('analyzing');
    setIsSaved(false);
    setErrorMessage('');

    try {
      const inference = await aiEngine.classify(image, (step) => {
        setProgressStep(step);
      });
      
      if (inference.error) {
        throw new Error(inference.error);
      }
      
      setProgressStep('Applying Recycling Rules');
      
      if (inference.level === 'Low') {
        setResult({
          category: 'Uncertain',
          confidence: (inference.results?.[0]?.confidence || 0),
          level: 'Low',
          bin: 'N/A',
          instructions: ['Please capture another image. We are not confident in this prediction.'],
          impact: '',
          warnings: '',
          metrics: inference.metrics
        });
      } else {
        const intelligence = await processWasteIntelligence(inference, region); 
        if (intelligence) {
          setProgressStep('Generating Waste Intelligence Report');
          await new Promise(res => setTimeout(res, 300));
          setResult({
            ...intelligence,
            modelConfidence: inference.results?.[0]?.modelConfidence,
            rawPredictions: inference.results?.[0]?.rawPredictions
          });
        } else {
          throw new Error('Failed to map waste intelligence.');
        }
      }
      setStage('result');
    } catch (err) {
      console.error("Analysis Error:", err);
      setErrorMessage((err as Error).message || 'An unknown error occurred during analysis.');
      setStage('error');
    }
  };

  const handleManualOverride = async (className: string) => {
    if (!result) return;
    setStage('analyzing');
    setProgressStep('Applying Manual Correction');
    
    try {
      const mockInference = {
         results: [{ className: className, mappedCategory: null, confidence: 1.0 }],
         level: 'High' as const,
         metrics: result.metrics
      };
      const intelligence = await processWasteIntelligence(mockInference, region);
      if (intelligence) {
        setResult({
           ...intelligence,
           modelConfidence: result.modelConfidence, // Keep original confidence for transparency
           rawPredictions: result.rawPredictions // Keep original predictions
        });
        setStage('result');
      } else {
        throw new Error('Failed to map manual correction.');
      }
    } catch (err) {
      console.error("Override Error:", err);
      setErrorMessage((err as Error).message || 'Failed to apply manual correction.');
      setStage('error');
    }
  };

  const handleSave = async () => {
    if (!result || isSaved) return;
    
    let thumbnail: string | undefined;
    let originalImage: string | undefined;

    if (imageStorage === 'thumbnail' || imageStorage === 'original') {
      thumbnail = await generateThumbnail(image!);
    }
    
    if (imageStorage === 'original') {
      originalImage = image!;
    }

    await db.scans.add({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      category: result.category,
      confidence: result.confidence,
      region,
      bin: result.bin,
      synced: false,
      instructions: result.instructions,
      impact: result.impact,
      warnings: result.warnings,
      thumbnail,
      originalImage,
      modelVersion: result.metrics?.modelVersion,
      processingTime: result.metrics?.inferenceTimeMs,
      device: result.metrics?.backend
    });

    setIsSaved(true);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setErrorMessage('');
    setStage('camera');
    setIsSaved(false);
  };

  return (
    <div className="flex flex-col items-center p-4 h-full max-w-2xl mx-auto">
      
      <div className="w-full flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scanner</h2>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${modelReady ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'}`}>
          {modelReady ? <CheckCircle2 size={14} /> : <Cpu size={14} className="animate-pulse" />}
          <span>{modelReady ? 'AI Offline Ready' : 'Loading AI...'}</span>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        
        {stage === 'camera' && (
          <motion.div 
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col gap-6"
          >
            <CameraView onCapture={handleCapture} />
            <AIStatusPanel />
          </motion.div>
        )}

        {stage === 'preview' && image && (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col gap-4 pb-8"
          >
            <img 
              src={image} 
              alt="Preview" 
              className="w-full rounded-3xl shadow-elevation-2 aspect-[3/4] object-cover" 
            />
            <div className="flex gap-3 mt-4">
              <button 
                onClick={reset}
                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Capture Again
              </button>
              <button 
                onClick={handleAnalyze}
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-elevation-2 hover:shadow-elevation-3 transition-shadow"
              >
                Analyze Waste
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'analyzing' && image && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col gap-6 pb-8"
          >
            <div className="relative">
              <img 
                src={image} 
                alt="Analyzing" 
                className="w-full rounded-3xl shadow-elevation-2 aspect-[3/4] object-cover blur-sm brightness-75" 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 w-full max-w-sm">
                  <Cpu size={48} className="mx-auto text-primary mb-4 animate-bounce" />
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Analyzing...</h3>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-primary rounded-full w-1/2 animate-[pulse_1s_ease-in-out_infinite]" style={{ transformOrigin: 'left' }}></div>
                  </div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{progressStep || 'Initializing'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'error' && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col gap-4 pb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-1 border border-red-100 dark:border-red-900/30 p-8 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex flex-col items-center justify-center mx-auto mb-4">
                <XCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                {errorMessage.startsWith('QUALITY_ERROR') ? 'Scan Quality Too Low' : 'Analysis Failed'}
              </h3>
              
              {errorMessage.startsWith('QUALITY_ERROR') ? (
                <div className="text-left text-sm text-gray-700 dark:text-gray-300 font-medium mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <p className="mb-2 font-bold text-gray-900 dark:text-white">
                    {errorMessage.includes('TOO_DARK') && "The image is too dark to analyze."}
                    {errorMessage.includes('TOO_BRIGHT') && "The image is too bright (overexposed)."}
                    {errorMessage.includes('TOO_BLURRY') && "The image is out of focus."}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Move closer to the object</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Improve lighting</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Use a plain background</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Capture one object only</li>
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">
                  {errorMessage}
                </p>
              )}
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleAnalyze}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-elevation-2 hover:shadow-elevation-3 transition-shadow flex justify-center items-center gap-2"
                >
                  <RefreshCw size={20} /> Retry Analysis
                </button>
                <button 
                  onClick={reset}
                  className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex justify-center items-center gap-2"
                >
                  <AlertCircle size={20} /> Capture Again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {stage === 'result' && result && image && (
          <WasteIntelligenceReport 
            key="result"
            result={result}
            imageSrc={image}
            onScanAgain={reset}
            onSave={handleSave}
            isSaved={isSaved}
            onManualOverride={handleManualOverride}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to resize image to 256x256 for thumbnail
async function generateThumbnail(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Crop center
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256);
        resolve(canvas.toDataURL('image/webp', 0.8));
      } else {
        resolve(dataUrl); // Fallback
      }
    };
    img.src = dataUrl;
  });
}
