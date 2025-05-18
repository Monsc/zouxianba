import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, searchPosts } from '../services/api';
import PostCard from '../components/PostCard';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults({ users: [], posts: [] });
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const [users, posts] = await Promise.all([searchUsers(query), searchPosts(query)]);
        setResults({ users, posts });
      } catch (err) {
        setError('Failed to search. Please try again.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <input
            type="text"
            className="search-input"
            placeholder="Search users and posts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading-spinner" />
        ) : (
          <>
            {results.users.length > 0 && (
              <div className="search-section">
                <h2 className="section-title">Users</h2>
                <div className="users-list">
                  {results.users.map(user => (
                    <div
                      key={user._id}
                      className="user-card"
                      onClick={() => navigate(`/profile/${user._id}`)}
                    >
                      <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.username}
                        className="user-avatar"
                      />
                      <div className="user-info">
                        <span className="username">{user.username}</span>
                        <span className="handle">@{user.handle}</span>
                        {user.bio && <p className="user-bio">{user.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.posts.length > 0 && (
              <div className="search-section">
                <h2 className="section-title">Posts</h2>
                <div className="posts-list">
                  {results.posts.map(post => (
                    <PostCard key={post._id} post={post} onLike={() => {}} />
                  ))}
                </div>
              </div>
            )}

            {query.trim().length >= 2 &&
              !isLoading &&
              results.users.length === 0 &&
              results.posts.length === 0 && (
                <div className="no-results">No results found for "{query}"</div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

export default Search;
