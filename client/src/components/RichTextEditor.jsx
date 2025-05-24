import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Hash, AtSign } from 'lucide-react';

export function RichTextEditor({ value, onChange, maxLength = 280, placeholder = '有什么新鲜事？' }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const textareaRef = useRef(null);
  const [suggestions, setSuggestions] = useState({
    show: false,
    type: null,
    items: [],
    position: { top: 0, left: 0 },
    selectedIndex: 0
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
      checkForMentionsAndTopics(newValue);
    }
  };

  const checkForMentionsAndTopics = async (text) => {
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPosition);
    const lastWord = textBeforeCursor.split(/\s/).pop();

    if (lastWord.startsWith('@')) {
      const query = lastWord.slice(1);
      if (query.length > 0) {
        try {
          const users = await apiService.searchUsers(query);
          setSuggestions({
            show: true,
            type: 'mention',
            items: users,
            position: getCaretCoordinates(),
            selectedIndex: 0
          });
        } catch (error) {
          console.error('搜索用户失败:', error);
        }
      } else {
        setSuggestions({ show: false, type: null, items: [], position: { top: 0, left: 0 }, selectedIndex: 0 });
      }
    } else if (lastWord.startsWith('#')) {
      const query = lastWord.slice(1);
      if (query.length > 0) {
        try {
          const topics = await apiService.searchTopics(query);
          setSuggestions({
            show: true,
            type: 'topic',
            items: topics,
            position: getCaretCoordinates(),
            selectedIndex: 0
          });
        } catch (error) {
          console.error('搜索话题失败:', error);
        }
      } else {
        setSuggestions({ show: false, type: null, items: [], position: { top: 0, left: 0 }, selectedIndex: 0 });
      }
    } else {
      setSuggestions({ show: false, type: null, items: [], position: { top: 0, left: 0 }, selectedIndex: 0 });
    }
  };

  const getCaretCoordinates = () => {
    const textarea = textareaRef.current;
    const position = textarea.selectionStart;
    const text = textarea.value;
    const textBeforeCaret = text.substring(0, position);
    const lines = textBeforeCaret.split('\n');
    const currentLineNumber = lines.length - 1;
    const currentLine = lines[currentLineNumber];
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const top = currentLineNumber * lineHeight + textarea.offsetTop;
    const left = currentLine.length * 8 + textarea.offsetLeft; // 估算字符宽度

    return { top, left };
  };

  const handleSuggestionClick = (item) => {
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.slice(0, cursorPosition);
    const textAfterCursor = textarea.value.slice(cursorPosition);
    const lastWord = textBeforeCursor.split(/\s/).pop();
    const newText = textBeforeCursor.slice(0, -lastWord.length) + 
      (suggestions.type === 'mention' ? `@${item.handle}` : `#${item.name}`) + 
      ' ' + textAfterCursor;
    
    onChange(newText);
    setSuggestions({ show: false, type: null, items: [], position: { top: 0, left: 0 }, selectedIndex: 0 });
    textarea.focus();
  };

  const handleKeyDown = (e) => {
    if (suggestions.show) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestions(prev => ({
          ...prev,
          selectedIndex: (prev.selectedIndex + 1) % prev.items.length
        }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestions(prev => ({
          ...prev,
          selectedIndex: (prev.selectedIndex - 1 + prev.items.length) % prev.items.length
        }));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSuggestionClick(suggestions.items[suggestions.selectedIndex]);
      } else if (e.key === 'Escape') {
        setSuggestions({ show: false, type: null, items: [], position: { top: 0, left: 0 }, selectedIndex: 0 });
      }
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-gray-900 dark:text-white bg-transparent border-0 focus:ring-0 resize-none min-h-[100px]"
        rows={1}
      />
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
            onClick={() => {
              const textarea = textareaRef.current;
              const cursorPosition = textarea.selectionStart;
              const text = textarea.value;
              const newText = text.slice(0, cursorPosition) + '@' + text.slice(cursorPosition);
              onChange(newText);
              textarea.focus();
              textarea.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
            }}
          >
            <AtSign className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
            onClick={() => {
              const textarea = textareaRef.current;
              const cursorPosition = textarea.selectionStart;
              const text = textarea.value;
              const newText = text.slice(0, cursorPosition) + '#' + text.slice(cursorPosition);
              onChange(newText);
              textarea.focus();
              textarea.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
            }}
          >
            <Hash className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {value.length}/{maxLength}
        </div>
      </div>

      {/* 建议列表 */}
      {suggestions.show && suggestions.items.length > 0 && (
        <div
          className="absolute z-10 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          style={{
            top: `${suggestions.position.top + 24}px`,
            left: `${suggestions.position.left}px`
          }}
        >
          <div className="max-h-60 overflow-y-auto">
            {suggestions.items.map((item, index) => (
              <button
                key={item._id}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  index === suggestions.selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
                onClick={() => handleSuggestionClick(item)}
              >
                {suggestions.type === 'mention' ? (
                  <div className="flex items-center space-x-2">
                    <img
                      src={item.avatar}
                      alt={item.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        @{item.handle}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 