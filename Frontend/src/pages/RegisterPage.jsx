import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import './AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  
  // Check if we're resuming OTP verification
  const [persistedData, setPersistedData] = useState(null);
  const [step, setStep] = useState('register'); // 'register' or 'verify-otp'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Load persisted registration data on mount
  useEffect(() => {
    const saved = localStorage.getItem('registrationData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPersistedData(data);
        setStep('verify-otp');
        setRegisteredEmail(data.email);
        setFormData(prev => ({
          ...prev,
          username: data.username,
          email: data.email,
          password: data.password,
          passwordConfirm: data.password,
        }));
      } catch (err) {
        console.error('Failed to load registration data:', err);
        localStorage.removeItem('registrationData');
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.username || !formData.email || !formData.password || !formData.passwordConfirm) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/send-otp', {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
      });

      // Save registration data to localStorage so it persists on reload
      localStorage.setItem('registrationData', JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }));

      setRegisteredEmail(formData.email);
      setStep('verify-otp');
      setFormData({ ...formData, otp: '' });
    } catch (err) {
      // Clear persisted data if there's an error
      localStorage.removeItem('registrationData');
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);

    // Remove spaces from OTP
    const cleanOtp = formData.otp.replace(/\s/g, '');

    if (!cleanOtp || cleanOtp.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await API.post('/auth/verify-otp', {
        email: registeredEmail,
        otp: cleanOtp,
      });

      // OTP verified successfully - store token in API headers
      API.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
      
      // Clear persisted registration data
      localStorage.removeItem('registrationData');
      
      // Call register to update context and initialize socket
      await register(
        formData.username,
        formData.email,
        formData.password,
        formData.passwordConfirm
      );
      
      // Redirect to home page
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    // Clear persisted data when going back
    localStorage.removeItem('registrationData');
    setStep('register');
    setError(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      otp: '',
    });
    setRegisteredEmail('');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {step === 'register' ? (
          <>
            <h2>Create your account</h2>

            <form className="auth-form" onSubmit={handleSendOtp}>
              {error && <div className="error-message">{error}</div>}
              {authError && <div className="error-message">{authError}</div>}

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
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

              <div className="form-group">
                <label htmlFor="passwordConfirm">Confirm Password</label>
                <input
                  id="passwordConfirm"
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  minLength="6"
                  disabled={loading}
                />
              </div>

              <button type="submit" className="button-submit" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            </form>

            <p className="auth-link">
              Already have an account?{' '}
              <Link to="/login" className="link">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2>Verify Email</h2>
            <p className="verify-info">
              We've sent a 4-digit verification code to <strong>{registeredEmail}</strong>
            </p>

            <form className="auth-form" onSubmit={handleVerifyOtp}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="otp">Enter Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="0000"
                  required
                  maxLength="4"
                  pattern="[0-9]{4}"
                  disabled={loading}
                  inputMode="numeric"
                  style={{
                    fontSize: '24px',
                    letterSpacing: '10px',
                    textAlign: 'center',
                  }}
                />
              </div>

              <button type="submit" className="button-submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <button
                type="button"
                className="button-back"
                onClick={handleBackToRegister}
                disabled={loading}
                style={{
                  marginTop: '10px',
                  background: '#6c757d',
                }}
              >
                Back to Registration
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
