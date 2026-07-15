
import { UserCircle } from 'lucide-react';
import { guestService } from '../services/guestService';
import { useNavigate } from 'react-router-dom';

export default function GuestCard() {
  const navigate = useNavigate();

  const handleGuestLogin = () => {
    guestService.loginAsGuest();
    navigate('/');
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue without an account</span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleGuestLogin}
          className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <UserCircle className="w-5 h-5 mr-2 text-gray-400" />
          Continue as Guest
        </button>
        <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          Your scans will be saved locally on this device.
        </p>
      </div>
    </div>
  );
}
