/**
 * MACROSCOPE PERFORMANCE OS - APP ENTRY POINT
 */

import { RouterProvider } from 'react-router';
import { router } from '../web/routes';
import { OnboardingFlow } from '../web/components/OnboardingFlow';
import { AuthProvider, useAuth } from '../core/hooks/useAuth';
import { AuthFlow } from '../web/components/AuthFlow';
import { useEffect } from 'react';

const applyThemeClass = () => {
  const theme = localStorage.getItem('macroscope_theme') || 'dark';
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
};

function AppContent() {
  const { user, isFullyOnboarded, loading, refreshContext } = useAuth();

  const handleOnboardingComplete = async () => {
    await refreshContext();
  };

  useEffect(() => {
    applyThemeClass();
    const onPrefs = () => applyThemeClass();
    window.addEventListener('macroscope-preferences-update', onPrefs);
    window.addEventListener('storage', onPrefs);
    return () => {
      window.removeEventListener('macroscope-preferences-update', onPrefs);
      window.removeEventListener('storage', onPrefs);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Loading MacroScope...</div>
      </div>
    );
  }

  // Not logged in -> Show Auth screens
  if (!user) {
    return <AuthFlow />;
  }

  // Logged in but no profile -> Show Onboarding
  if (!isFullyOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Fully authenticated and onboarded -> Main App
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}