/**
 * MACROSCOPE PERFORMANCE OS - ROUTER CONFIGURATION
 * React Router data mode configuration
 */

import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { ControlCenterPage } from './pages/ControlCenterPage';
import { SleepPage } from './pages/SleepPage';
import { NutritionPage } from './pages/NutritionPage';
import { ActivityPage } from './pages/ActivityPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: ControlCenterPage },
      { path: 'sleep', Component: SleepPage },
      { path: 'nutrition', Component: NutritionPage },
      { path: 'activity', Component: ActivityPage },
      { path: 'insights', Component: InsightsPage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
]);