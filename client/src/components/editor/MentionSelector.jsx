import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { apiService } from '../../services/api';

const MentionSelector = ({ onSelect, selectedUsers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const res = await apiService.searchUsers(searchTerm);
        setUsers(res.filter(user => !selectedUsers.includes(user._id)));
      } catch (error) {
        console.error('搜索用户失败:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedUsers]);

  const handleSelect = (user) => {
    onSelect([...selectedUsers, user]);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemove = (userIdToRemove) => {
    onSelect(selectedUsers.filter(user => user._id !== userIdToRemove));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedUsers.map(user => (
          <div
            key={user._id}
            className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
          >
            <span>@{user.username}</span>
            <button
              type="button"
              onClick={() => handleRemove(user._id)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center border rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="搜索用户..."
            className="flex-1 ml-2 outline-none bg-transparent"
          />
        </div>

        {showDropdown && (searchTerm.trim() || loading) && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border">
            {loading ? (
              <div className="p-4 text-center text-gray-500">搜索中...</div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-gray-500">未找到相关用户</div>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {users.map(user => (
                  <li
                    key={user._id}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleSelect(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium">@{user.username}</div>
                        {user.name && (
                          <div className="text-sm text-gray-500">{user.name}</div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentionSelector; 