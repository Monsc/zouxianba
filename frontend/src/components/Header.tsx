import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>Twitter Clone</h1>
        </Link>

        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              className="action-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <img
                src={user.avatar}
                alt={user.username}
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
              <span>{user.username}</span>
            </button>

            {isMenuOpen && (
              <div
                className="modal"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '8px',
                  minWidth: '200px',
                }}
              >
                <Link
                  to={`/profile/${user.id}`}
                  className="btn btn-secondary"
                  style={{ display: 'block', marginBottom: '8px' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="btn btn-secondary"
                  style={{ display: 'block', marginBottom: '8px' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  className="btn btn-secondary"
                  onClick={handleLogout}
                  style={{ width: '100%' }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}; 