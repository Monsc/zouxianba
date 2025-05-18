import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserMentionInput } from './UserMention';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + media.length > 4) {
      alert('最多只能上传4张图片');
      return;
    }
    setMedia([...media, ...files]);
  };

  const removeMedia = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleUserSelect = (selectedUser) => {
    const lastAtIndex = content.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const newContent = content.slice(0, lastAtIndex) + `@${selectedUser.handle} ` + content.slice(content.length);
      setContent(newContent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('content', content);
    media.forEach(file => {
      formData.append('media', file);
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const data = await response.json();
      setContent('');
      setMedia([]);
      if (onPostCreated) {
        onPostCreated(data);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post">
      <div className="create-post-header">
        <img src={user.avatar} alt={user.username} className="create-post-avatar" />
        <div className="create-post-input-container">
          <UserMentionInput onSelect={handleUserSelect} />
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="有什么新鲜事？"
            className="create-post-textarea"
          />
        </div>
      </div>

      {media.length > 0 && (
        <div className="create-post-media-preview">
          {media.map((file, index) => (
            <div key={index} className="media-preview-item">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="media-preview-image"
              />
              <button
                className="media-preview-remove"
                onClick={() => removeMedia(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="create-post-actions">
        <div className="create-post-media-actions">
          <button
            className="create-post-media-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={media.length >= 4}
          >
            <i className="fas fa-image"></i>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMediaChange}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
        </div>
        <button
          className="create-post-submit"
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && media.length === 0)}
        >
          {isSubmitting ? '发布中...' : '发布'}
        </button>
      </div>
    </div>
  );
};

export default CreatePost; 