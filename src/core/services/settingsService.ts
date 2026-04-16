/**
 * MACROSCOPE PERFORMANCE OS - SETTINGS SERVICE
 * Handles app settings and configuration
 */

import type { SystemSettings, UserAccount } from '../types';
import * as api from '../api';

const LS_THEME_KEY = 'macroscope_theme';
const LS_UNITS_KEY = 'macroscope_units';
const LS_NOTIF_KEY = 'macroscope_notifications';

class SettingsService {
  /**
   * Get system settings
   */
  async getSettings(userId: string): Promise<SystemSettings> {
    const profile = await api.getProfile(userId);
    const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
    
    const theme = (storage ? storage.getItem(LS_THEME_KEY) : null) as SystemSettings['theme'] || 'dark';
    const units = (storage ? storage.getItem(LS_UNITS_KEY) : null) as SystemSettings['units'] || 'metric';
    const notificationsRaw = storage ? storage.getItem(LS_NOTIF_KEY) : null;
    const notifications = notificationsRaw === null ? true : notificationsRaw === 'true';

    const profileTargets = await api.getProfileTargets(userId);

    // Map DB-backed targets (profiles.*) into SystemSettings
    // Goal mode is primarily UX; we map it from profile.goal (best-effort).
    const goalMode: SystemSettings['goalMode'] =
      profile?.goal === 'lose' ? 'cut' : profile?.goal === 'gain' ? 'bulk' : 'maintain';

    return {
      sleepTarget: profile?.typicalSleepHours ?? 7.5,
      calorieTarget: Number(profileTargets?.calorie_target ?? 2200),
      activityTarget: profile?.stepTarget ?? 8000,
      goalMode,
      theme,
      units,
      notifications,
    };
  }

  /**
   * Update system settings
   */
  async updateSettings(userId: string, updates: Partial<SystemSettings>): Promise<SystemSettings> {
    const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
    
    // Persist local-only preferences
    if (storage) {
      if (updates.theme) storage.setItem(LS_THEME_KEY, updates.theme);
      if (updates.units) storage.setItem(LS_UNITS_KEY, updates.units);
      if (updates.notifications !== undefined) storage.setItem(LS_NOTIF_KEY, String(updates.notifications));
    }

    // Persist DB-backed targets
    const profileUpdates: any = {};
    if (updates.sleepTarget !== undefined) profileUpdates.typicalSleepHours = updates.sleepTarget;
    if (updates.activityTarget !== undefined) profileUpdates.stepTarget = updates.activityTarget;

    if (updates.goalMode !== undefined) {
      profileUpdates.goal =
        updates.goalMode === 'cut' ? 'lose' : updates.goalMode === 'bulk' ? 'gain' : 'maintain';
    }

    if (Object.keys(profileUpdates).length > 0) {
      await api.saveProfile(userId, profileUpdates);
    }

    // calorieTarget is DB-computed (calculate_targets) and also user-editable in your Settings UI;
    // we store it in profiles.calorie_target directly if user sets it explicitly.
    if (updates.calorieTarget !== undefined) {
      await api.setCalorieTarget(userId, updates.calorieTarget);
    }

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
      window.dispatchEvent(new Event('macroscope-preferences-update'));
    }
    return await this.getSettings(userId);
  }

  /**
   * Get user account info
   */
  async getAccount(userId: string, email?: string): Promise<UserAccount> {
    const profile = await api.getProfile(userId, email);
    return {
      name: profile?.name ?? 'User',
      email: email ?? '',
    };
  }

  /**
   * Update user account
   */
  async updateAccount(userId: string, email: string | undefined, updates: Partial<UserAccount>): Promise<UserAccount> {
    if (updates.name !== undefined) {
      await api.saveProfile(userId, { name: updates.name });
    }

    // Updating email requires a Supabase auth flow + confirmation email; keep Settings stable by
    // treating email as read-only here for now.
    return await this.getAccount(userId, email);
  }

  /**
   * Export user data
   */
  async exportData(): Promise<void> {
    // TODO: Implement actual data export
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Clear all user data
   */
  async clearAllData(userId: string): Promise<void> {
    await api.clearData(userId);
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<void> {
    await api.deleteAccount(userId);
  }
}

export const settingsService = new SettingsService();
