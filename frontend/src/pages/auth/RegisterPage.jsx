import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { FormInput, FormSelect, Button } from '../../components/UI';
import styles from './Auth.module.css';

const STEPS = { DETAILS: 'DETAILS', OTP: 'OTP', DONE: 'DONE' };
const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'FACULTY', label: 'Faculty' },
];

const DEPT_OPTIONS = [
  { value: '', label: 'Select Department' },
  { value: 'CS', label: 'CS' },
  { value: 'IT', label: 'IT' },
  { value: 'AIML', label: 'AIML' },
  { value: 'AIDS', label: 'AIDS' },
  { value: 'Others', label: 'Others' }
];

const YEAR_OPTIONS = [
  { value: '', label: 'Select Year' },
  { value: 'FE', label: 'FE' },
  { value: 'SE', label: 'SE' },
  { value: 'TE', label: 'TE' },
  { value: 'BE', label: 'BE' }
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.DETAILS);
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', confirmPassword: '', 
    role: 'STUDENT', moodleId: '', department: '', year: '' 
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      console.log("Register payload:", form);
      await authAPI.register(form);
      if (form.role === 'FACULTY') {
        setStep(STEPS.DONE);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setStep(STEPS.OTP);
      }
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

        {step === STEPS.DETAILS && (
          <>
            <h1 className={styles.heading}>Create your account</h1>
            <p className={styles.sub}>Join UniClub and discover your campus</p>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <form onSubmit={handleRegister} className={styles.form}>
              <FormSelect label="Select Role" name="role" options={ROLE_OPTIONS} value={form.role} onChange={handleChange} required />
              
              <FormInput label="Full name" name="name" placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
              <FormInput label={form.role === 'FACULTY' ? "Email" : "College email"} name="email" type="email" placeholder={form.role === 'FACULTY' ? "you@college.edu" : "student@college.edu"} value={form.email} onChange={handleChange} required />
              
              {form.role === 'STUDENT' && (
                <>
                  <FormInput label="Moodle ID" name="moodleId" placeholder="12345678" value={form.moodleId} onChange={handleChange} required />
                  <FormSelect label="Department" name="department" options={DEPT_OPTIONS} value={form.department} onChange={handleChange} required />
                  <FormSelect label="Year" name="year" options={YEAR_OPTIONS} value={form.year} onChange={handleChange} required />
                </>
              )}

              <FormInput label="Password" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
              <FormInput label="Re-enter Password" name="confirmPassword" type="password" placeholder="Min 6 characters" value={form.confirmPassword} onChange={handleChange} required minLength={6} />
              
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
