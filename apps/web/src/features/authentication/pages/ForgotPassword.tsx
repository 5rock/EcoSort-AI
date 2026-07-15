
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

export default function ForgotPassword() {
  return (
    <AuthLayout 
      title="Reset your password"
      subtitle="Enter your email to receive reset instructions"
    >
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
          <div className="mt-1">
            <input
              type="email"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert('Password reset link sent! (Mocked)')}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Send Reset Link
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
