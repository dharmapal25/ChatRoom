import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import flash from '../../public/group.png';
import '../styles/AuthPages.css';

export default function FirstPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="auth-page">
      <nav className="navbar">
        <div className="navbar-brand">FlashChat</div>
        <div className="navbar-menu">
          <a href="#docs">Docs</a>
          <a href="#reviews">Reviews</a>
          {!isAuthenticated ? (
            <>
              <button className="btn-secondary" onClick={() => navigate('/login')}>
                Join Room
              </button>
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Login
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
          )}
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Connect and Chat in Real Time</h1>
            <p className="hero-subtitle">
              Create rooms, invite people, and keep conversations moving with a
              simple real-time chat experience.
            </p>

            <div className="features-list">
              <div className="feature-item">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <div>
                  <strong>Real time</strong>
                  <p>Messages and room activity update instantly.</p>
                </div>
              </div>
              <div className="feature-item">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <div>
                  <strong>Secure</strong>
                  <p>Protected routes and verified account access.</p>
                </div>
              </div>
              <div className="feature-item">
                <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <div>
                  <strong>Community</strong>
                  <p>Join shared spaces or create your own room.</p>
                </div>
              </div>
            </div>

            <button className="btn-cta" onClick={() => navigate('/login')}>
              Start Chatting
            </button>
          </div>

          <div className="hero-image">
            <img src={flash} alt="FlashChat Hero" draggable={false} />
          </div>
        </div>
      </section>
    </div>
  );
}
