/**
 * MACROSCOPE PERFORMANCE OS - PROFILE HOOK
 * Manages user profile state and operations
 */

import { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { profileService } from '../services';
import { useAuth } from './useAuth';

export function useProfile() {
  const { userId, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) throw new Error('Not authenticated');
      const data = await profileService.getProfile(userId, user?.email ?? undefined);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError(null);
      if (!userId) throw new Error('Not authenticated');
      const updatedProfile = await profileService.updateProfile(userId, updates);
      setProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  const initializeProfile = async (data: Omit<UserProfile, 'id'>) => {
    try {
      setError(null);
      if (!userId) throw new Error('Not authenticated');
      const newProfile = await profileService.initializeProfile(userId, data);
      setProfile(newProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize profile');
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    initializeProfile,
    refresh: fetchProfile,
  };
}
