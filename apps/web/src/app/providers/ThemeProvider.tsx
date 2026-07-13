import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '../../stores/themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      // Remove all theme classes first (for cleanliness, though we only use .dark now)
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        if (mediaQuery.matches) {
          root.classList.add('dark');
        }
      } else if (theme === 'dark') {
        root.classList.add('dark');
      }
    };

    applyTheme();

    const handleChange = () => {
      if (theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return <>{children}</>;
}
