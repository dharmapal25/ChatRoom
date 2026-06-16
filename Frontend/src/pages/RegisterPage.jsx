import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  clearPendingRegistration,
  loadPendingRegistration,
  savePendingRegistration,
} from '../utils/otpStorage';
import '../styles/AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [step, setStep] = useState('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const restorePendingRegistration = async () => {
      const pending = await loadPendingRegistration();

      if (pending) {
        setFormData({
          username: pending.username || '',
          email: pending.email || '',
          password: pending.password || '',
        });
        setOtp(pending.otp || '');
        setOtpExpiresAt(pending.expiresAt || null);
        setStep('otp');
        setMessage('OTP verification restored. Please enter the code from your email.');
      }
    };

    restorePendingRegistration();
  }, []);

  const persistPendingRegistration = async (nextOtp = otp, nextExpiresAt = otpExpiresAt) => {
    await savePendingRegistration({
      ...formData,
      otp: nextOtp,
      expiresAt: nextExpiresAt,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await sendOtp(
        formData.username,
        formData.email,
        formData.password
      );

      const expiresAt = response.expiresAt || Date.now() + 10 * 60 * 1000;
      setOtpExpiresAt(expiresAt);
      setStep('otp');
      setOtp('');
      setMessage('OTP sent to your email. It will expire in 10 minutes.');
      await persistPendingRegistration('', expiresAt);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);

    if (step === 'otp') {
      await persistPendingRegistration(value);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter the 6 digit OTP');
      return;
    }

    setLoading(true);

    try {
      await verifyOtp(formData.username, formData.email, formData.password, otp);
      clearPendingRegistration();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDetails = () => {
    setStep('details');
    setError(null);
    setMessage(null);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{step === 'otp' ? 'Verify your email' : 'Create your account'}</h2>

        <form className="auth-form" onSubmit={step === 'otp' ? handleVerifyOtp : handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {authError && <div className="error-message">{authError}</div>}
          {message && <div className="success-message">{message}</div>}

          {step === 'details' ? (
            <>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  minLength="3"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  minLength="6"
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <>
              <div className="otp-summary">
                OTP sent to <strong>{formData.email}</strong>
              </div>

              <div className="form-group">
                <label htmlFor="otp">6 digit OTP</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="123456"
                  required
                  minLength="6"
                  maxLength="6"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <button type="submit" className="button-submit" disabled={loading}>
            {loading
              ? step === 'otp' ? 'Verifying...' : 'Sending OTP...'
              : step === 'otp' ? 'Verify OTP' : 'Send OTP'}
          </button>

          {step === 'otp' && (
            <button
              type="button"
              className="button-link"
              onClick={handleEditDetails}
              disabled={loading}
            >
              Edit signup details
            </button>
          )}
        </form>

        <p className="auth-link">
          Already have an account?{' '}
          <Link to="/login" className="link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
