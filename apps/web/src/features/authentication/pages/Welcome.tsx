import { useNavigate } from 'react-router-dom';
import { guestService } from '../services/guestService';
import { Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Welcome() {
  const navigate = useNavigate();

  const handleGuest = () => {
    guestService.loginAsGuest();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-2 p-8 border border-gray-100 dark:border-gray-700 text-center"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Leaf size={40} className="text-primary" />
        </div>
        
        <h1 className="text-3xl font-black mb-2">EcoSort AI</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
          🌱 Smart Waste Intelligence<br/>
          100% On-Device AI
        </p>

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleGuest}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-elevation-2 hover:shadow-elevation-3 transition-all"
          >
            Continue as Guest
          </button>
          
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">OR</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          <button 
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Sign In
          </button>
          
          <button 
            onClick={() => navigate('/signup')}
            className="w-full py-4 bg-white dark:bg-gray-800 text-primary border-2 border-primary/20 dark:border-primary/50 font-bold rounded-2xl hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
          >
            Create Account
          </button>
        </div>

        <p className="mt-8 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Your images stay on your device.
        </p>
      </motion.div>
    </div>
  );
}
