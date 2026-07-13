import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Image as ImageIcon, RefreshCcw, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
}

const TIPS = [
  "Ensure the item is well-lit.",
  "Keep the item in the center of the frame.",
  "Avoid blurry images for best accuracy.",
  "A plain background works best."
];

export default function CameraView({ onCapture }: CameraViewProps) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-elevation-3">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode }}
        className="w-full h-full object-cover"
      />
      
      {/* Scanning Tips Overlay */}
      <div className="absolute top-4 left-0 right-0 flex justify-center px-4">
        <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 text-white/90 text-sm font-medium">
          <Info size={16} className="text-white/70" />
          <AnimatePresence mode="wait">
            <motion.span
              key={tipIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="min-w-[200px] text-center"
            >
              {TIPS[tipIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Overlay Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-10 px-6">
        <motion.label 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-4 bg-black/40 backdrop-blur-xl rounded-full cursor-pointer hover:bg-black/60 focus-within:ring-2 focus-within:ring-primary outline-none transition-colors border border-white/20"
          aria-label="Upload Image"
        >
          <ImageIcon className="text-white" size={24} />
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </motion.label>

        <motion.button
          onClick={capture}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Capture Photo"
          className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center relative bg-white/20 backdrop-blur-sm focus:ring-4 focus:ring-primary outline-none"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Camera className="text-primary-dark" size={32} />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
          className="p-4 bg-black/40 backdrop-blur-xl rounded-full hover:bg-black/60 focus:ring-2 focus:ring-primary outline-none transition-colors border border-white/20"
          aria-label="Flip Camera"
        >
          <RefreshCcw className="text-white" size={24} />
        </motion.button>
      </div>
    </div>
  );
}
