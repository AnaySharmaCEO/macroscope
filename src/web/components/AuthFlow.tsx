import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/hooks';
import { OTPInput } from 'input-otp';
import { ActionButton } from '../ui/components/ActionButton';

// Inline Slot component styled to fit the tokens system
const Slot = ({ char, isActive, hasFakeCaret }: any) => {
  return (
    <div
      className="relative w-10 h-14 text-2xl flex items-center justify-center border font-mono transition-all"
      style={{
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--surface-2)',
        borderColor: isActive ? 'var(--accent)' : 'var(--border)',
        boxShadow: isActive ? 'var(--focus-ring)' : 'none',
        color: 'var(--text-1)',
      }}
    >
      {char !== null && <span>{char}</span>}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-caret-blink">
          <div className="w-[1px] h-8 bg-[var(--accent)]" />
        </div>
      )}
    </div>
  );
};

export function AuthFlow() {
  const { isOtpStage, email, sendOtp, verifyOtp, resetAuthFlow, loading, error: authError } = useAuth();

  // Screen 1: Email Form State
  const [inputEmail, setInputEmail] = useState('');
  
  // Screen 2: OTP Form State
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail) return;
    try {
      await sendOtp(inputEmail);
      setCooldown(30); // 30s cooldown on first send
    } catch (err) {
      // Error is handled via useAuth globally
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    try {
      await sendOtp(email);
      setCooldown(30);
    } catch (err) {}
  };

  const handleOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || otp.length !== 6) return;
    try {
      await verifyOtp(email, otp);
    } catch (err) {
      // Handled globally
    }
  };

  // Auto-submit OTP
  const handleOtpChange = (val: string) => {
    setOtp(val);
    if (val.length === 6) {
      if (email) verifyOtp(email, val);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--text-1)',
      }}
    >
      <div 
        className="w-full max-w-sm p-8 border space-y-8"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          borderRadius: 'var(--card-radius)',
        }}
      >
        <div className="text-center space-y-1.5">
          <h1 className="font-serif text-3xl font-semibold text-[var(--text-1)] tracking-tight">MacroScope</h1>
          <p className="text-sm text-[var(--text-2)]">Personal performance OS</p>
        </div>

        {authError && (
          <div 
            className="p-3 border text-xs text-center leading-relaxed"
            style={{
              backgroundColor: 'var(--danger-soft)',
              borderColor: 'var(--danger-border)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {authError}
          </div>
        )}

        {!isOtpStage ? (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-2)]">Email address</label>
              <input 
                type="email" 
                required
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  borderRadius: 'var(--input-radius)',
                  color: 'var(--input-text)',
                  fontSize: 'var(--input-font-size)',
                  padding: 'var(--input-padding)',
                }}
                className="w-full border transition-colors duration-150 focus:outline-none focus:border-[var(--input-border-focus)] focus:ring-2 focus:ring-[var(--accent)]/30"
                placeholder="you@domain.com"
                autoFocus
              />
            </div>

            <div className="pt-2">
              <ActionButton 
                type="submit" 
                variant="primary"
                disabled={loading || !inputEmail}
                fullWidth
              >
                {loading ? 'Initializing...' : 'Continue with email'}
              </ActionButton>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6 flex flex-col items-center">
            <div className="text-center space-y-1">
              <p className="text-xs text-[var(--text-2)]">
                Enter the 6-digit access code sent to
              </p>
              <p className="text-sm font-semibold text-[var(--text-1)]">{email}</p>
            </div>

            <OTPInput
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              autoFocus
              render={({ slots }) => (
                <div className="flex justify-center gap-2">
                  {slots.map((slot, idx) => (
                    <Slot key={idx} {...slot} />
                  ))}
                </div>
              )}
            />

            <div className="w-full pt-2">
              <ActionButton 
                type="submit" 
                variant="primary"
                disabled={loading || otp.length !== 6}
                fullWidth
              >
                {loading ? 'Verifying...' : 'Verify code'}
              </ActionButton>
            </div>

            <div className="flex flex-col items-center space-y-2 pt-1 text-xs">
              <button 
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="text-[var(--text-2)] hover:text-[var(--text-1)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
              </button>
              
              <button 
                type="button"
                onClick={resetAuthFlow}
                disabled={loading}
                className="text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors cursor-pointer"
              >
                Change email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Add simple Slot component right here to avoid import issues if radix/input-otp doesn't export it exactly this way
// Note: Depending on the `input-otp` version, `Slot` might not be exported directly, or the API might defer.
// Let's ensure Slot is correctly mapped if it doesn't exist, but standard input-otp > 1.0 does exactly this.
