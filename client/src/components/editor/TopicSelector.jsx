import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { apiService } from '../../services/api';

const TopicSelector = ({ onSelect, selectedTopics = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const searchTopics = async () => {
      if (!searchTerm.trim()) {
        setTopics([]);
        return;
      }

      setLoading(true);
      try {
        const res = await apiService.searchTopics(searchTerm);
        setTopics(res.filter(topic => !selectedTopics.includes(topic)));
      } catch (error) {
        console.error('搜索话题失败:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchTopics, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedTopics]);

  const handleSelect = (topic) => {
    onSelect([...selectedTopics, topic]);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemove = (topicToRemove) => {
    onSelect(selectedTopics.filter(topic => topic !== topicToRemove));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTopics.map(topic => (
          <div
            key={topic}
            className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
          >
            <span>#{topic}</span>
            <button
              type="button"
              onClick={() => handleRemove(topic)}
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
            placeholder="搜索话题..."
            className="flex-1 ml-2 outline-none bg-transparent"
          />
        </div>

        {showDropdown && (searchTerm.trim() || loading) && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border">
            {loading ? (
              <div className="p-4 text-center text-gray-500">搜索中...</div>
            ) : topics.length === 0 ? (
              <div className="p-4 text-center text-gray-500">未找到相关话题</div>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {topics.map(topic => (
                  <li
                    key={topic}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => handleSelect(topic)}
                  >
                    #{topic}
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

export default TopicSelector; 