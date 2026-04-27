import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FormInput, Button } from '../../components/UI';
import DotMatrixBackground from '../../components/UI/DotMatrixBackground';
import styles from './Auth.module.css';

const API_URL = 'http://localhost:8080/api/auth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/forgot-password`, { email });
      setMessage(res.data.message || 'OTP sent successfully.');
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/verify-reset-otp`, { email, otp });
      setMessage(res.data.message || 'OTP verified.');
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired OTP.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/reset-password`, { email, newPassword });
      setMessage(res.data.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <DotMatrixBackground />

      {/* Navbar is position:fixed — lives outside any wrapper */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo} onClick={() => navigate('/')}>
          <img src="/images/logo.png" alt="UniClub Logo" className={styles.navLogoImg} />
          UniClub
        </div>
        <div>
          <button className="btn-primary" onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </nav>

      {/* Centered content — transparent wrapper, no background */}
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Forgot Password</h1>
          <p className={styles.sub}>
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Create a new password"}
          </p>

          {error && <div className={styles.errorBanner}>{error}</div>}
          {message && (
            <div style={{ background: 'rgba(201,242,143,0.1)', color: '#c9f28f', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid rgba(201,242,143,0.2)' }}>
              {message}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className={styles.form}>
              <FormInput label="Email address" name="email" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className={styles.form}>
              <FormInput label="OTP Code" name="otp" type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Verifying OTP...' : 'Verify OTP'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                Back
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className={styles.form}>
              <FormInput label="New Password" name="newPassword" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <FormInput label="Confirm New Password" name="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
