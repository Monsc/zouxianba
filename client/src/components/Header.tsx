import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-content">
        <h1 
          className="header-title"
          onClick={() => navigate('/')}
        >
          ZouXianBa
        </h1>
        <div className="header-actions">
          {user && (
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.username}
              className="header-avatar"
              onClick={() => navigate(`/profile/${user.id}`)}
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header; 