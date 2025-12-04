import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div 
        className="w-full max-w-md p-8 rounded-2xl animate-fade-in"
        style={{
          background: 'var(--gradient-card)',
          border: '2px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            Welcome Back! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Sign in to continue your habit journey
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 p-4 rounded-lg text-sm animate-slide-in-down"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover-lift hover-glow"
            style={{
              background: loading ? 'var(--inactive)' : 'var(--gradient-primary)',
              color: 'var(--bg-primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-semibold transition-colors duration-200"
              style={{ color: 'var(--accent-neon)' }}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
