/**
 * MACROSCOPE PERFORMANCE OS - AUTH HOOK & CONTEXT
 * Provides global authentication state and methods
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthUser } from '../types';
import { authService, profileService } from '../services';
import { supabase } from '../../lib/supabaseClient';

interface AuthContextType {
  user: AuthUser | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
  isFullyOnboarded: boolean;
  email: string | null; // email entered in OTP flow
  isOtpStage: boolean;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  resetAuthFlow: () => void;
  logout: () => Promise<void>;
  refreshContext: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullyOnboarded, setIsFullyOnboarded] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isOtpStage, setIsOtpStage] = useState(false);

  // Check if onboarding is truly complete by reading onboarding_complete flag directly.
  // We do NOT use profileService.getProfile because that auto-creates a skeleton row,
  // meaning !!profile would always be true after first login.
  const checkOnboardingComplete = async (userId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', userId)
      .maybeSingle();
    return data?.onboarding_complete === true;
  };

  const checkSession = async () => {
    try {
      setLoading(true);
      const session = await authService.getSession();
      setUser(session.user);
      
      if (session.user) {
        const complete = await checkOnboardingComplete(session.user.id);
        setIsFullyOnboarded(complete);
      } else {
        setIsFullyOnboarded(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session check failed');
      setUser(null);
      setIsFullyOnboarded(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const sendOtp = async (inputEmail: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.sendOtp(inputEmail);
      setEmail(inputEmail);
      setIsOtpStage(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (inputEmail: string, token: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user: authedUser } = await authService.verifyOtp(inputEmail, token);
      setUser(authedUser);
      
      const complete = await checkOnboardingComplete(authedUser.id);
      setIsFullyOnboarded(complete);
      
      // Cleanup auth flow state
      setEmail(null);
      setIsOtpStage(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsFullyOnboarded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Ensure api layer gets email for archive
  useEffect(() => {
    const s = typeof window !== 'undefined' ? window.localStorage : undefined;
    if (user?.email && s) {
      s.setItem('macroscope_user_email', user.email);
    }
  }, [user?.email]);

  const resetAuthFlow = () => {
    setEmail(null);
    setIsOtpStage(false);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: user?.id ?? null,
        loading,
        error,
        isFullyOnboarded,
        email,
        isOtpStage,
        sendOtp,
        verifyOtp,
        resetAuthFlow,
        logout,
        refreshContext: checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
