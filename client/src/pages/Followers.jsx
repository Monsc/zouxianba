import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Followers() {
  const { userId } = useParams();
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}/followers`)
      .then(res => res.json())
      .then(data => {
        setFollowers(
          data.map(u => ({
            id: u._id,
            username: u.username,
            handle: u.handle,
            avatar: u.avatar,
          }))
        );
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load followers.');
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div className="followers-page">
      <h2>Followers</h2>
      <ul>
        {followers.map(user => (
          <li
            key={user._id}
            onClick={() => navigate(`/profile/${user._id}`)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.username}
              width={32}
              height={32}
            />
            <span>
              {user.username} (@{user.handle})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Followers;
