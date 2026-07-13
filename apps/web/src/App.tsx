import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './shared/components/Layout';
import { aiEngine } from './ai/engine/aiEngine';
import { useAuthStore } from './features/authentication/store/authStore';

const Landing = lazy(() => import('./features/onboarding/pages/Landing'));
const Scan = lazy(() => import('./features/scanner/pages/Scan'));
const History = lazy(() => import('./features/history/pages/History'));
const Profile = lazy(() => import('./features/profile/pages/Profile'));

// Auth Pages
const Welcome = lazy(() => import('./features/authentication/pages/Welcome'));
const Login = lazy(() => import('./features/authentication/pages/Login'));
const Signup = lazy(() => import('./features/authentication/pages/Signup'));

const DUMMY_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function App() {
  const { mode } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    aiEngine.init().then(() => {
      aiEngine.classify(DUMMY_PIXEL).catch(() => {});
    }).catch(console.error);
  }, []);

  // Protect all non-auth routes
  const isAuthRoute = location.pathname === '/welcome' || location.pathname === '/login' || location.pathname === '/signup';
  
  if (!mode && !isAuthRoute) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="scan" element={<Scan />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
