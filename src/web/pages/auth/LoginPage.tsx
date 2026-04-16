import { useState } from 'react';
import { useAuth } from '../../../core/hooks';

interface Props {
  onSwitchToSignup: () => void;
}

export function LoginPage({ onSwitchToSignup }: Props) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorInput, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">MacroScope</h1>
          <p className="text-zinc-400 mt-2">Performance Operating System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorInput && (
            <div className="p-3 bg-red-900/50 text-red-200 border border-red-800 rounded text-sm">
              {errorInput}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-white transition-colors"
              placeholder="System ID"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-white transition-colors"
              placeholder="Access Key"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 bg-white text-black font-medium rounded hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter System'}
          </button>
        </form>

        <div className="text-center text-sm text-zinc-500">
           New to MacroScope?{' '}
           <button onClick={onSwitchToSignup} className="text-white hover:underline focus:outline-none">
             Initialize Profile
           </button>
        </div>
      </div>
    </div>
  );
}
