/**
 * MACROSCOPE PERFORMANCE OS - TOP BAR
 * Application top bar with streak and alerts
 */

import { useState, useEffect } from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { useAlerts } from '../../core/hooks';

interface TopBarProps {
  onOpenAlerts: () => void;
  onOpenGoals?: () => void;
}

export function TopBar({ onOpenAlerts }: TopBarProps) {
  const { unacknowledgedCount, loading: alertsLoading } = useAlerts();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const currentTheme = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 
      (localStorage.getItem('macroscope_theme') as 'dark' | 'light') || 'dark';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('macroscope_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('macroscope-preferences-update'));
  };

  return (
    <header 
      style={{
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}
      className="h-14 px-6 flex items-center justify-end gap-2.5 transition-colors duration-200"
    >
      {/* Notification Bell Button with --live dot */}
      <button
        type="button"
        onClick={onOpenAlerts}
        aria-label="View alerts"
        style={{
          width: 'var(--btn-icon-size, 36px)',
          height: 'var(--btn-icon-size, 36px)',
          backgroundColor: 'var(--btn-icon-bg, var(--surface))',
          borderColor: 'var(--btn-icon-border, var(--border))',
          borderRadius: 'var(--btn-icon-radius, var(--radius-pill))',
          color: 'var(--text-2)',
        }}
        className="relative flex items-center justify-center border transition-colors hover:text-[var(--text)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <Bell className="w-4 h-4" />
        {!alertsLoading && unacknowledgedCount > 0 && (
          <span 
            style={{
              backgroundColor: 'var(--live)',
            }}
            className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-[var(--bg)]"
          />
        )}
      </button>

      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        style={{
          width: 'var(--btn-icon-size, 36px)',
          height: 'var(--btn-icon-size, 36px)',
          backgroundColor: 'var(--btn-icon-bg, var(--surface))',
          borderColor: 'var(--btn-icon-border, var(--border))',
          borderRadius: 'var(--btn-icon-radius, var(--radius-pill))',
          color: 'var(--text-2)',
        }}
        className="flex items-center justify-center border transition-colors hover:text-[var(--text)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>
    </header>
  );
}