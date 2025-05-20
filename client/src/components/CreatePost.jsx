import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '../services/api';
import { Mention, MentionsInput } from 'react-mentions';
import 'react-mentions/dist/style.css';

function CreatePost({ onSubmit, onClose }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // 获取用户列表用于提及功能
    const fetchUsers = async () => {
      try {
        const response = await fetchApi('/api/users/search');
        setUsers(response.data.map(user => ({
          id: user._id,
          display: user.username,
          handle: user.handle
        })));
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    // 获取热门话题
    const fetchHashtags = async () => {
      try {
        const response = await fetchApi('/api/hashtags/popular');
        setHashtags(response.data.map(tag => ({
          id: tag.name,
          display: `#${tag.name}`
        })));
      } catch (err) {
        console.error('Failed to fetch hashtags:', err);
      }
    };

    fetchUsers();
    fetchHashtags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ content, media });
      setContent('');
      setMedia([]);
      onClose?.();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + media.length > 4) {
      alert('最多只能上传4张图片');
      return;
    }
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setMedia([...media, ...newMedia]);
  };

  const removeMedia = (index) => {
    const newMedia = [...media];
    URL.revokeObjectURL(newMedia[index].preview);
    newMedia.splice(index, 1);
    setMedia(newMedia);
  };

  const mentionStyle = {
    backgroundColor: '#e8f5fe',
    color: '#1da1f2',
    padding: '2px 4px',
    borderRadius: '4px',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl bg-white dark:bg-twitter-gray-900 rounded-2xl shadow-xl">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-twitter-gray-200 dark:border-twitter-gray-800">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800"
          >
            ✕
          </button>
          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && media.length === 0) || isSubmitting}
            className="px-4 py-2 bg-twitter-blue text-white rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发布
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-4">
          <div className="flex space-x-4">
            {/* 用户头像 */}
            <img
              src={user?.avatar || 'https://via.placeholder.com/48'}
              alt={user?.username}
              className="w-12 h-12 rounded-full"
            />

            {/* 输入区 */}
            <div className="flex-1">
              <MentionsInput
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="有什么新鲜事？"
                className="w-full min-h-[120px] p-2 bg-transparent border-none focus:ring-0 resize-none text-lg"
                maxLength={280}
                style={{
                  control: {
                    backgroundColor: 'transparent',
                    fontSize: 16,
                    fontWeight: 'normal',
                  },
                  input: {
                    margin: 0,
                    padding: 0,
                  },
                  suggestions: {
                    list: {
                      backgroundColor: 'white',
                      border: '1px solid rgba(0,0,0,0.15)',
                      fontSize: 14,
                    },
                    item: {
                      padding: '5px 10px',
                      borderBottom: '1px solid rgba(0,0,0,0.15)',
                      '&focused': {
                        backgroundColor: '#e8f5fe',
                      },
                    },
                  },
                }}
              >
                <Mention
                  trigger="@"
                  data={users}
                  style={mentionStyle}
                  appendSpaceOnAdd
                  renderSuggestion={(suggestion) => (
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{suggestion.display}</span>
                      <span className="text-twitter-gray-500">@{suggestion.handle}</span>
                    </div>
                  )}
                />
                <Mention
                  trigger="#"
                  data={hashtags}
                  style={mentionStyle}
                  appendSpaceOnAdd
                />
              </MentionsInput>

              {/* 媒体预览 */}
              {media.length > 0 && (
                <div className="grid gap-2 mt-4">
                  {media.map((item, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={item.preview}
                        alt=""
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 工具栏 */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-twitter-gray-200 dark:border-twitter-gray-800">
                <div className="flex space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-twitter-blue rounded-full hover:bg-twitter-blue/10"
                  >
                    🖼️
                  </button>
                  <button className="p-2 text-twitter-blue rounded-full hover:bg-twitter-blue/10">
                    📍
                  </button>
                  <button className="p-2 text-twitter-blue rounded-full hover:bg-twitter-blue/10">
                    😊
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-twitter-gray-500">
                    {content.length}/280
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleMediaSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default CreatePost;
