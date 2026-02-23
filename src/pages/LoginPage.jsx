import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginEmail, loginGoogle, signupEmail } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && role) navigate(role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
  }, [user, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') await signupEmail(form);
      else await loginEmail(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card polished-auth">
        <h1>CertiTrack</h1>
        <p className="auth-subtitle">Professional Certificate Tracking System</p>

        <div className="toggle-group">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Sign Up
          </button>
        </div>

        <h2>{mode === 'signup' ? 'Create Account' : 'Sign In'}</h2>
        <p className="auth-hint">Login to manage your certificates.</p>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label>
              Full Name
              <input
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>
          )}
          <label>
            Gmail
            <input
              type="email"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Continue'}
          </button>
        </form>

        <div className="or-divider">OR</div>

        <button className="btn-google" onClick={() => loginGoogle()}>
          Continue with Google
        </button>
        <small>⚠️ Note: For security, we do not store your Gmail password. Google login uses Firebase sign-in.</small>
      </div>
    </div>
  );
}
