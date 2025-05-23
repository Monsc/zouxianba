import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserMention = ({ username, handle, avatar }) => {
  const navigate = useNavigate();

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${handle}`);
  };

  return (
    <span className="user-mention" onClick={handleClick}>
      @{handle}
    </span>
  );
};

// 用户标签输入组件
export const UserMentionInput = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.startsWith('@') && query.length > 1) {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/users/search?q=${query.slice(1)}`
          );
          const data = await response.json();
          setUsers(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error searching users:', error);
        }
      } else {
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleInputChange = e => {
    const input = e.target;
    const value = input.value;
    const cursorPos = input.selectionStart;

    // 检查光标位置是否在@符号后
    const lastAtIndex = value.lastIndexOf('@', cursorPos);
    if (lastAtIndex !== -1 && lastAtIndex < cursorPos) {
      setCursorPosition(lastAtIndex);
      setQuery(value.slice(lastAtIndex, cursorPos));
    } else {
      setShowSuggestions(false);
    }
  };

  const handleUserSelect = user => {
    if (onSelect) {
      onSelect(user);
    }
    setShowSuggestions(false);
    setQuery('');
  };

  return (
    <div className="user-mention-input-container">
      <input
        type="text"
        className="user-mention-input"
        onChange={handleInputChange}
        placeholder="输入@提及用户..."
      />

      {showSuggestions && users.length > 0 && (
        <div className="user-mention-suggestions">
          {users.map(user => (
            <div
              key={user._id}
              className="user-mention-suggestion-item"
              onClick={() => handleUserSelect(user)}
            >
              <img src={user.avatar} alt={user.username} className="user-mention-avatar" />
              <div className="user-mention-info">
                <div className="user-mention-name">{user.username}</div>
                <div className="user-mention-handle">@{user.handle}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMention;
