/**
 * MACROSCOPE PERFORMANCE OS - ROOT LAYOUT
 * Responsive layout that switches between desktop and mobile modes
 */

import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '../ui/components/Sidebar';
import { BottomNav } from '../ui/components/BottomNav';
import { TopBar } from '../components/TopBar';
import { AlertsPanel } from '../components/AlertsPanel';
import { GoalsPanel } from '../components/GoalsPanel';
import { useResponsive } from '../hooks/useResponsive';

export function RootLayout() {
  const { isMobile } = useResponsive();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showGoals, setShowGoals] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Top Bar - Fixed */}
        <div className="fixed top-0 left-0 right-0 z-40">
          <TopBar
            onOpenAlerts={() => setShowAlerts(true)}
            onOpenGoals={() => setShowGoals(true)}
          />
        </div>

        {/* Main content with padding for top bar and bottom nav */}
        <main className="pt-14 pb-16">
          <Outlet />
        </main>

        {/* Bottom navigation - Fixed */}
        <BottomNav />

        {/* Panels - Full screen overlays */}
        {showAlerts && (
          <div className="fixed inset-0 z-50 bg-background">
            <AlertsPanel onBack={() => setShowAlerts(false)} />
          </div>
        )}
        {showGoals && (
          <div className="fixed inset-0 z-50 bg-background">
            <GoalsPanel onBack={() => setShowGoals(false)} />
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Bar */}
      <TopBar
        onOpenAlerts={() => setShowAlerts(true)}
        onOpenGoals={() => setShowGoals(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Panels - Full overlay */}
      {showAlerts && (
        <div className="fixed inset-0 z-50 bg-background">
          <AlertsPanel onBack={() => setShowAlerts(false)} />
        </div>
      )}
      {showGoals && (
        <div className="fixed inset-0 z-50 bg-background">
          <GoalsPanel onBack={() => setShowGoals(false)} />
        </div>
      )}
    </div>
  );
}