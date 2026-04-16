import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/hooks';
import { OTPInput } from 'input-otp';

// Inline Slot component styled to fit the dark mode aesthetics
const Slot = ({ char, isActive, hasFakeCaret }: any) => {
  return (
    <div
      className={`relative w-10 h-14 text-2xl flex items-center justify-center border rounded-md transition-all ${
        isActive
          ? 'border-white ring-2 ring-white/20 z-10'
          : 'border-zinc-800 bg-zinc-900/50'
      }`}
    >
      {char !== null && <span>{char}</span>}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-caret-blink">
          <div className="w-[1px] h-8 bg-white" />
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
      // Error is handled via useAuth globally (or we render it below)
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">MacroScope</h1>
          <p className="text-zinc-400 mt-2">Performance Operating System</p>
        </div>

        {authError && (
          <div className="p-3 bg-red-900/50 text-red-200 border border-red-800 rounded text-sm text-center">
            {authError}
          </div>
        )}

        {!isOtpStage ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">System ID (Email)</label>
              <input 
                type="email" 
                required
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-white transition-colors"
                placeholder="Enter your email"
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !inputEmail}
              className="w-full py-2 px-4 bg-white text-black font-medium rounded hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-colors disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6 flex flex-col items-center">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-zinc-300">
                Enter the 6-digit access code sent to<br/>
                <span className="text-white font-semibold">{email}</span>
              </p>
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

            <button 
              type="submit" 
              disabled={loading || otp.length !== 6}
              className="w-full py-2 px-4 bg-white text-black font-medium rounded hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Access'}
            </button>

            <div className="flex flex-col items-center space-y-3 pt-2 text-sm">
              <button 
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="text-zinc-400 hover:text-white disabled:opacity-50 transition-colors focus:outline-none"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
              </button>
              
              <button 
                type="button"
                onClick={resetAuthFlow}
                disabled={loading}
                className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
              >
                Change Email
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
