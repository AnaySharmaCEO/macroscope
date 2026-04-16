/**
 * MACROSCOPE PERFORMANCE OS - NAVIGATION CONFIG
 * Centralized navigation structure
 */

import { Activity, Moon, Utensils, LayoutGrid, User, Lightbulb, Settings } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: typeof Activity;
}

export const navigationItems: NavItem[] = [
  {
    id: 'control-center',
    label: 'Home',
    path: '/',
    icon: LayoutGrid,
  },
  {
    id: 'sleep',
    label: 'Sleep',
    path: '/sleep',
    icon: Moon,
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    path: '/nutrition',
    icon: Utensils,
  },
  {
    id: 'activity',
    label: 'Activity',
    path: '/activity',
    icon: Activity,
  },
  {
    id: 'insights',
    label: 'Insights',
    path: '/insights',
    icon: Lightbulb,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];