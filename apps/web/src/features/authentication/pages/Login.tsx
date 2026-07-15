
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import GuestCard from '../components/GuestCard';

export default function Login() {
  return (
    <AuthLayout 
      title="Welcome back to EcoSort AI"
      subtitle="Sign in to your account"
    >
      <LoginForm />
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm">
          <Link to="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
            Forgot your password?
          </Link>
        </div>
      </div>

      <GuestCard />

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
        <Link to="/signup" className="font-medium text-green-600 hover:text-green-500">
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
}
