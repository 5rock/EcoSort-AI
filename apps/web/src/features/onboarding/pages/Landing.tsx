import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Shield, Leaf, Zap, ChevronRight, Lightbulb } from 'lucide-react';

export default function Landing() {
  const features = [
    { icon: Zap, title: 'Instant Recognition', desc: 'Scan waste and get immediate sorting instructions powered by local AI.' },
    { icon: Shield, title: 'Privacy First', desc: 'All image processing happens directly on your device. No cloud uploads.' },
    { icon: Leaf, title: 'Sustainable Future', desc: 'Help reduce landfill contamination by sorting recyclables correctly.' },
    { icon: Camera, title: 'Works Offline', desc: 'Identify waste anytime, anywhere, even without an internet connection.' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-primary-light/40 to-transparent dark:from-primary/10 dark:to-transparent blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 pt-12 pb-24 flex flex-col items-center">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-xs font-medium text-primary-dark dark:text-primary mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            EcoSort AI v2 is Live
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            Sort Waste. <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              Save the Planet.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            The world's most advanced, privacy-first, offline AI waste sorting assistant. Identify any item in milliseconds.
          </p>
          
          <Link to="/scan">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-full text-lg font-bold shadow-[0_8px_16px_-6px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_20px_-6px_rgba(16,185,129,0.6)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span>Start Scanning</span>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Eco Tip Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-elevation-2 mb-12 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Lightbulb size={120} />
          </div>
          <div className="flex items-center gap-3 text-yellow-500 dark:text-yellow-400 font-bold mb-3 relative z-10">
            <Lightbulb size={24} />
            <h3 className="text-lg">Today's Eco Tip</h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium relative z-10">
            Always rinse plastic containers before recycling them! Food residue can contaminate an entire batch of recyclables, sending them straight to the landfill.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + (idx * 0.1) }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-elevation-1 border border-gray-100 dark:border-gray-700 hover:shadow-elevation-2 transition-shadow"
            >
              <div className="w-12 h-12 bg-primary-light/50 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary-dark dark:text-primary mb-4">
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
