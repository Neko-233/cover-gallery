'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200"
      aria-label={`切换到${theme === 'light' ? '深色' : '浅色'}主题`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      ) : (
        <Sun className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      )}
    </button>
  );
}