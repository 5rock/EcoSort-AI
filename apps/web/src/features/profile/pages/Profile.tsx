import { UserCircle, CheckCircle2, LogOut, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../authentication/store/authStore';
import { authService } from '../../authentication/services/authService';
import { guestService } from '../../authentication/services/guestService';
import { useNavigate } from 'react-router-dom';
import ThemeCard from '../components/ThemeCard';
import RegionCard from '../components/RegionCard';
import LanguageCard from '../components/LanguageCard';
import CloudSyncCard from '../components/CloudSyncCard';
import AIStatusCard from '../components/AIStatusCard';
import StorageCard from '../components/StorageCard';
import ExportCard from '../components/ExportCard';
import AboutCard from '../components/AboutCard';
import PrivacyDashboard from '../components/PrivacyDashboard';

export default function Profile() {
  const { t } = useTranslation();
  const { user, mode } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (mode === 'guest') {
      if (window.confirm('Are you sure? This will delete all your local scan history and settings.')) {
        await guestService.logoutGuest();
        navigate('/welcome');
      }
    } else {
      await authService.logout();
      navigate('/welcome');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24 space-y-6">
      
      <div className="flex items-center gap-4 mb-8 mt-4">
        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-500 rounded-full flex items-center justify-center text-white shadow-elevation-2 relative">
          <UserCircle size={40} />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-grow">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {mode === 'guest' ? t('profile.guest_user') : user?.email}
          </h2>
          {mode === 'guest' && user?.id && (
            <p className="text-xs font-bold text-gray-400 mt-0.5">{user.id}</p>
          )}
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-gray-500 dark:text-gray-400 font-medium text-xs flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> {t('profile.offline_first')}</span>
            <span className="text-gray-500 dark:text-gray-400 font-medium text-xs flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> {t('profile.privacy_protected')}</span>
            <span className="text-gray-500 dark:text-gray-400 font-medium text-xs flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500"/> {t('profile.local_ai')}</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
          title={mode === 'guest' ? 'Clear Data & Start Fresh' : 'Sign Out'}
        >
          {mode === 'guest' ? <Trash2 size={20} /> : <LogOut size={20} />}
        </button>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">{t('profile.preferences')}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
          <ThemeCard />
          <RegionCard />
          <LanguageCard />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">{t('profile.privacy_ai')}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
          <AIStatusCard />
          <CloudSyncCard />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">{t('profile.storage')}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
          <StorageCard />
          <ExportCard />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">{t('profile.privacy_report')}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 overflow-hidden">
          <PrivacyDashboard />
        </div>
      </section>

      <section className="space-y-3 pb-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">{t('profile.about')}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-elevation-1 border border-gray-100 dark:border-gray-700 overflow-hidden">
          <AboutCard />
        </div>
      </section>

    </div>
  );
}
