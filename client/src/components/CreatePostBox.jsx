import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import LoginForm from './LoginForm';

function CreatePostBox() {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleFocus = () => {
    if (textareaRef.current && window.innerWidth <= 600) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!content.trim() && images.length === 0) {
      setError('请输入内容或上传媒体');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await apiService.createPost({ content, images });
      setContent('');
      setImages([]);
    } catch (err) {
      setError('发帖失败，请重试');
      console.error('Error creating post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaChange = e => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      setError('最多只能上传4个文件');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('文件大小必须小于5MB');
        return false;
      }
      return true;
    });

    setImages([...images, ...validFiles]);
  };

  const removeMedia = index => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="create-post-box bg-white dark:bg-[#1a2233] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 transition-colors duration-300">
      <form onSubmit={handleSubmit} className="post-form flex flex-col gap-4">
        {error && (
          <div className="error-message bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded px-3 py-2 text-sm mb-2 border border-red-200 dark:border-red-700">
            {error}
          </div>
        )}

        <div className="post-author flex items-center gap-3 mb-2">
          <img
            src={user?.avatar || '/default-avatar.png'}
            alt={user?.username}
            className="avatar w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover shadow"
          />
          <div className="author-info">
            <span className="username font-bold text-md text-gray-900 dark:text-gray-100">{user?.username || '游客'}</span>
            <span className="handle text-gray-400 dark:text-gray-500 text-sm ml-2">@{user?.handle || 'guest'}</span>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          className="post-input w-full min-h-[80px] rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#192734] text-gray-900 dark:text-gray-100 p-3 text-md resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          placeholder="有什么新鲜事？"
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={280}
          onFocus={handleFocus}
        />

        {images.length > 0 && (
          <div className="media-preview grid grid-cols-2 gap-2 mt-2">
            {images.map((file, index) => (
              <div
                key={index}
                className="media-item relative group rounded-lg overflow-hidden shadow bg-gray-100 dark:bg-[#22303c] border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Media ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  className="remove-media absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeMedia(index)}
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="post-actions flex items-center justify-between mt-2">
          <div className="flex items-center gap-4">
            <label className="media-upload cursor-pointer flex items-center gap-2 text-primary hover:text-blue-400 dark:hover:text-blue-300 transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaChange}
                className="hidden"
              />
              <i className="icon-image text-xl" />
              <span className="text-sm">媒体</span>
            </label>
          </div>

          <button
            type="submit"
            className="px-6 py-2 rounded-full font-bold text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60"
            disabled={isLoading || (!content.trim() && images.length === 0)}
          >
            {isLoading ? '发布中...' : '发布'}
          </button>
        </div>
      </form>

      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>登录</DialogTitle>
          </DialogHeader>
          <LoginForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreatePostBox;
