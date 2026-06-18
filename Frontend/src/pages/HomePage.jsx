import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import dashboardImage from '../../public/happy.png';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goToPage = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="home-shell">
      <header className="home-header">
        <div>
          <span className="tagline">Welcome back</span>
          <h2>Hello {user?.username || 'User'}</h2>
        </div>
        <div className="menu-wrap">
          <button
            className="menu-toggle"
            type="button"
            aria-label="Open dashboard menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <FaBars aria-hidden="true" />
          </button>

          {isMenuOpen && (
            <div className="menu-panel">
              <button type="button" onClick={() => goToPage('/rooms')}>
                Join Room
              </button>
              <button type="button" onClick={() => goToPage('/create-room')}>
                Create Room
              </button>
              <button
                type="button"
                className="menu-logout"
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div className="dashboard-text">
            <h1>Welcome to FlashChat</h1>
            <p className="dashboard-intro">
              Connect with people around the world in real time. Join rooms,
              create private spaces, and keep conversations moving.
            </p>

            <div className="dashboard-features">
              <div className="feature-block">
                <h3>Real-time Messaging</h3>
                <p>Send and receive messages instantly with live room updates.</p>
              </div>
              <div className="feature-block">
                <h3>Global Community</h3>
                <p>Find active rooms and connect with people from anywhere.</p>
              </div>
              <div className="feature-block">
                <h3>Easy Management</h3>
                <p>Create rooms, review join requests, and manage access.</p>
              </div>
            </div>

            <div className="dashboard-actions">
              <button className="action-btn primary" onClick={() => navigate('/rooms')}>
                Browse Rooms
              </button>
              <button
                className="action-btn secondary"
                onClick={() => navigate('/create-room')}
              >
                Create Room
              </button>
            </div>
          </div>

          <div className="dashboard-image">
            <img src={dashboardImage} alt="Dashboard" draggable={false} />
          </div>
        </section>
      </main>

      {showLogoutConfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="logout-modal">
            <h3>Are you sure want to logout?</h3>
            <div className="modal-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                No
              </button>
              <button
                type="button"
                className="button-primary danger"
                onClick={handleLogout}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
