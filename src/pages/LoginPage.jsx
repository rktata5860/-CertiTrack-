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
      <div className="auth-card glass-card">
        <h1>CertiTrack</h1>
        <p>Manage certifications, renewals, and proof documents professionally.</p>
        <div className="toggle-group">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" disabled={loading}>{loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Login'}</button>
        </form>
        <button className="btn-secondary" onClick={() => loginGoogle()}>
          Continue with Google
        </button>
        <small>Secure sign-in for both User and Admin roles.</small>
      </div>
    </div>
  );
}
