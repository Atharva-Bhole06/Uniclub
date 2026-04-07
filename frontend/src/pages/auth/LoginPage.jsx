import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormInput, Button } from '../../components/UI';
import styles from './Auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  console.log("LOGIN PAGE RENDERED");

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      const redirect = {
        STUDENT:   '/student/dashboard',
        CLUB_HEAD: '/clubhead/dashboard',
        FACULTY:   '/faculty/dashboard',
      }[user.role] || '/';
      navigate(redirect);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <div className={styles.navLogo} onClick={() => navigate('/')}>
          <img src="/images/logo.png" alt="UniClub Logo" className={styles.navLogoImg} />
          UniClub
        </div>
        <div>
          <button className="btn-primary" onClick={() => navigate('/')}>Home</button>
        </div>
      </nav>

      <div className={styles.card}>
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your account to continue</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <FormInput
            label="Email address"
            name="email"
            type="email"
            placeholder="you@college.edu"
            value={form.email}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            Sign In
          </Button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
