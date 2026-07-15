
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import SignupForm from '../components/SignupForm';
import GuestCard from '../components/GuestCard';

export default function Signup() {
  return (
    <AuthLayout 
      title="Create your EcoSort account"
      subtitle="Join the sustainable movement"
    >
      <SignupForm />

      <GuestCard />

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
        <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
