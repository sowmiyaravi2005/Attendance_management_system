import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Building2, Lock, User, ShieldAlert, Sparkles, Loader2, Mail, UserPlus, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { login, register, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Sign Up form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    const result = await login(username.trim(), password);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!signUpPassword) {
      setError('Please enter a password.');
      return;
    }
    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signUpPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    const result = await register(fullName.trim(), email.trim(), signUpPassword);
    if (!result.success) {
      setError(result.error);
    } else {
      // Success: switch to login and pre-fill the email so the user doesn't have to retype it
      const registeredEmail = email.trim().toLowerCase();
      setIsSignUp(false);
      setSuccessMessage(`Account created! Welcome, ${fullName.trim()}. Sign in below using your email.`);
      // Pre-fill the login username field with the registered email
      setUsername(registeredEmail);
      setPassword('');
      setFullName('');
      setEmail('');
      setSignUpPassword('');
      setConfirmPassword('');
    }
  };

  const setQuickCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  const toggleMode = (signUp) => {
    setIsSignUp(signUp);
    setError('');
    if (!signUp) setSuccessMessage('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0b0f19 70%)'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '36px',
        borderRadius: '24px',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(99,102,241,0.2)'
      }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)',
            marginBottom: '16px'
          }}>
            <Building2 size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Twite AI Attendance</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isSignUp ? 'Create a New Employee Account' : 'Enterprise Employee & Attendance Portal'}
          </p>
        </div>

        {successMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#10b981',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            <span style={{ fontSize: '1rem' }}>✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#f43f5e',
            fontSize: '0.85rem'
          }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {!isSignUp ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="#a5b4fc" />
                <span>Email or Username</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your@email.com or username"
                autoComplete="username"
                autoCapitalize="none"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} color="#a5b4fc" />
                <span>Password</span>
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-signin"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="spin-icon" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Don't have an account? Sign Up option */}
            <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Don’t have an account?{' '}
              <button
                type="button"
                onClick={() => toggleMode(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a5b4fc',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  padding: 0,
                  fontSize: '0.875rem'
                }}
                className="signup-link"
              >
                Sign Up
              </button>
            </div>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUpSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#a5b4fc" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="#a5b4fc" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} color="#a5b4fc" />
                <span>Password</span>
              </label>
              <input
                type="password"
                className="form-input"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder="Create password (min. 6 chars)"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} color="#a5b4fc" />
                <span>Confirm Password</span>
              </label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-signin"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="spin-icon" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Create Account</span>
                </>
              )}
            </button>

            {/* Already have an account? Login option */}
            <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => toggleMode(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a5b4fc',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  padding: 0,
                  fontSize: '0.875rem'
                }}
              >
                Login
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Credentials Assistant (Shown on Login view) */}
        {!isSignUp && (
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#f59e0b" />
              <span>QUICK DEMO ACCESS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setQuickCredentials('admin', 'admin123')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center', flexDirection: 'column', padding: '8px', gap: '2px' }}
              >
                <span style={{ fontWeight: 700, color: '#a5b4fc' }}>Admin Demo</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>admin / admin123</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickCredentials('manager', 'manager123')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center', flexDirection: 'column', padding: '8px', gap: '2px' }}
              >
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>Manager Demo</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>manager / manager123</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
