
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { guestService } from '../services/guestService';

export default function Welcome() {
  const navigate = useNavigate();

  const handleGuestLogin = () => {
    guestService.loginAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
            <Leaf className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>
        
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 dark:text-white">
          EcoSort AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Smart Waste Classification & Recycling Guide
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-4">
          <Link
            to="/login"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Link>

          <Link
            to="/signup"
            className="w-full flex justify-center items-center py-3 px-4 border border-green-600 dark:border-green-500 rounded-md shadow-sm text-sm font-medium text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Create Account
          </Link>

          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center pt-4">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm pt-4">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or</span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            className="mt-4 w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
