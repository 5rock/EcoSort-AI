

export default function PasswordStrength({ password }: { password?: string }) {
  if (!password) return null;

  let strength = 0;
  if (password.length > 7) strength += 1;
  if (password.length > 10) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  const getStrengthColor = () => {
    switch (strength) {
      case 1:
      case 2:
        return 'bg-red-500';
      case 3:
      case 4:
        return 'bg-yellow-500';
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  const getStrengthLabel = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Fair';
    return 'Strong';
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">Password strength</span>
        <span className={`text-xs font-medium ${strength <= 2 ? 'text-red-500' : strength <= 4 ? 'text-yellow-500' : 'text-green-500'}`}>
          {getStrengthLabel()}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
        <div className={`h-1.5 rounded-full ${getStrengthColor()}`} style={{ width: `${(strength / 5) * 100}%` }}></div>
      </div>
    </div>
  );
}
