import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.register(email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <button 
        onClick={() => navigate('/welcome')}
        className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm mb-8 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <h1 className="text-3xl font-black mb-2">Create Account</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
          Join EcoSort AI to sync across devices.
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-semibold border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-4 bg-primary text-white font-bold rounded-2xl shadow-elevation-2 hover:shadow-elevation-3 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 dark:text-gray-400 font-medium">
          Already have an account? <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">Sign in</button>
        </p>
      </motion.div>
    </div>
  );
}
