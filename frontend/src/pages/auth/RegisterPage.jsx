import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { FormInput, FormSelect, Button } from '../../components/UI';
import styles from './Auth.module.css';

const STEPS = { DETAILS: 'DETAILS', OTP: 'OTP', DONE: 'DONE' };
const ROLE_OPTIONS = [
  { value: 'STUDENT',   label: '🎓 Student' },
  { value: 'CLUB_HEAD', label: '👑 Club Head' },
  { value: 'FACULTY',   label: '👨‍🏫 Faculty' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.DETAILS);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log("Register payload:", form);
      await authAPI.register(form);
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log("OTP payload:", { email: form.email, otp });
      await authAPI.verifyOtp({ email: form.email, otp });
      setStep(STEPS.DONE);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <img src="/images/logo.png" alt="UniClub" className={styles.logo} />
          <span className={styles.logoText}>UniClub</span>
        </div>

        {step === STEPS.DETAILS && (
          <>
            <h1 className={styles.heading}>Create your account</h1>
            <p className={styles.sub}>Join UniClub and discover your campus</p>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <form onSubmit={handleRegister} className={styles.form}>
              <FormInput label="Full name" name="name" placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
              <FormInput label="College email" name="email" type="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} required />
              <FormInput label="Password" name="password" type="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} required minLength={8} />
              <FormSelect label="I am a..." name="role" options={ROLE_OPTIONS} value={form.role} onChange={handleChange} required />
              <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                Continue
              </Button>
            </form>
            <p className={styles.footer}>Already have an account? <Link to="/login" className={styles.link}>Sign in</Link></p>
          </>
        )}

        {step === STEPS.OTP && (
          <>
            <h1 className={styles.heading}>Verify your email</h1>
            <p className={styles.sub}>We sent a 6-digit OTP to <strong>{form.email}</strong></p>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <form onSubmit={handleVerifyOtp} className={styles.form}>
              <FormInput label="One-time password" name="otp" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
              <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                Verify OTP
              </Button>
            </form>
          </>
        )}

        {step === STEPS.DONE && (
          <div className={styles.successBlock}>
            <div className={styles.checkCircle}>✓</div>
            <h2 className={styles.heading}>Account verified!</h2>
            <p className={styles.sub}>Redirecting you to login…</p>
          </div>
        )}
      </div>
    </div>
  );
}
