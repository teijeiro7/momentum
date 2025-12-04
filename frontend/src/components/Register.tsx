import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8"
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
            Join Us! 🚀
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Create your account and start building better habits
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

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
              minLength={3}
              className="w-full px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="your@email.com"
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
              minLength={6}
              className="w-full px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              placeholder="Confirm your password"
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="mt-6 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold transition-colors duration-200"
              style={{ color: 'var(--accent-neon)' }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
