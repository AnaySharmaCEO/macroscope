/**
 * MACROSCOPE PERFORMANCE OS - PROFILE SERVICE
 * Handles user profile data operations
 */

import type { UserProfile } from '../types';
import * as api from '../api';

class ProfileService {
  /**
   * Get user profile
   */
  async getProfile(userId: string, email?: string): Promise<UserProfile | null> {
    return await api.getProfile(userId, email);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return await api.saveProfile(userId, updates);
  }

  /**
   * Initialize user profile (onboarding)
   */
  async initializeProfile(userId: string, profile: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    return await api.saveProfile(userId, profile);
  }
}

export const profileService = new ProfileService();
