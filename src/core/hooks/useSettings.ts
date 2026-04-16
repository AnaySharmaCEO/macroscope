/**
 * MACROSCOPE PERFORMANCE OS - SETTINGS HOOK
 * Manages app settings and configuration
 */

import { useState, useEffect } from 'react';
import type { SystemSettings, UserAccount } from '../types';
import { settingsService } from '../services';
import { useAuth } from './useAuth';

export function useSettings() {
  const { userId, user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) throw new Error('Not authenticated');

      const [settingsData, accountData] = await Promise.all([
        settingsService.getSettings(userId),
        settingsService.getAccount(userId, user?.email ?? undefined),
      ]);

      setSettings(settingsData);
      setAccount(accountData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    try {
      setError(null);
      if (!userId) throw new Error('Not authenticated');
      const updatedSettings = await settingsService.updateSettings(userId, updates);
      setSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  const updateAccount = async (updates: Partial<UserAccount>) => {
    try {
      setError(null);
      if (!userId) throw new Error('Not authenticated');
      const updatedAccount = await settingsService.updateAccount(userId, user?.email ?? undefined, updates);
      setAccount(updatedAccount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account');
      throw err;
    }
  };

  const exportData = async () => {
    try {
      setError(null);
      await settingsService.exportData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    }
  };

  const clearAllData = async () => {
    try {
      setError(null);
      if (!userId) throw new Error('Not authenticated');
      await settingsService.clearAllData(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data');
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      setError(null);
      if (!userId) throw new Error('Not authenticated');
      await settingsService.deleteAccount(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    account,
    loading,
    error,
    updateSettings,
    updateAccount,
    exportData,
    clearAllData,
    deleteAccount,
    refresh: fetchSettings,
  };
}
