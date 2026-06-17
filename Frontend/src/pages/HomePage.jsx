import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dashboardImage from '../../public/happy.png';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="home-shell">
      <header className="home-header">
        <div>
          <span className="tagline">Welcome back</span>
          <h2>Hello {user?.username || 'User'}</h2>
        </div>
        <div className="header-buttons">
          <button
            className="button-primary Join-Rooms"
            onClick={() => navigate('/rooms')}
          >
            Join Rooms
          </button>
          <button className="button-secondary logout" onClick={handleLogout}>
            Logout
          </button>
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

        <section className="user-info-section">
          <div className="user-card">
            <h2>Your Profile</h2>
            <div className="user-details">
              <div className="detail-item">
                <span className="label">Username</span>
                <span className="value">{user?.username || 'Loading...'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Email</span>
                <span className="value">{user?.email || 'Loading...'}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
