/**
 * MACROSCOPE PERFORMANCE OS - AUTH SERVICE
 * Handles authentication and session operations
 */

import * as api from '../api';
import type { AuthUser } from '../types';

class AuthService {
  /**
   * Send OTP to email (works for login and signup)
   */
  async sendOtp(email: string): Promise<{ success: boolean }> {
    return await api.login(email);
  }

  /**
   * Verify OTP to complete authentication
   */
  async verifyOtp(email: string, token: string): Promise<{ user: AuthUser; token: string }> {
    const session = await api.verifyOtp(email, token);
    if (!session || !session.user || !session.access_token) {
        throw new Error("Invalid session returned");
    }
    const u: any = session.user;
    return { user: { id: u.id, email: u.email ?? null }, token: session.access_token };
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await api.logout();
  }

  /**
   * Get current session state (e.g. on load)
   */
  async getSession(): Promise<{ user: AuthUser | null; token: string | null }> {
    const session = await api.getSession();
    if (!session) {
      return { user: null, token: null };
    }
    const u: any = session.user;
    return { user: { id: u.id, email: u.email ?? null }, token: session.access_token };
  }

  /**
   * Get current user (throws if not authenticated)
   */
  async getCurrentUser(): Promise<AuthUser> {
    const session = await api.getSession();
    if (!session || !session.user) {
      throw new Error('Not authenticated');
    }
    const u: any = session.user;
    return { id: u.id, email: u.email ?? null };
  }
}

export const authService = new AuthService();
