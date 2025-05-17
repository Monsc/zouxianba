import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createPost } from '../services/api';

function CreatePostButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!content.trim() && media.length === 0) {
      setError('Please enter some content or upload media');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await createPost({ content, media });
      setContent('');
      setMedia([]);
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + media.length > 4) {
      setError('You can only upload up to 4 files');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return false;
      }
      return true;
    });

    setMedia([...media, ...validFiles]);
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  if (!user) return null;

  return (
    <>
      <button
        className="create-post-button"
        onClick={() => setIsModalOpen(true)}
      >
        <i className="icon-plus" />
      </button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Post</h2>
              <button
                className="close-button"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="post-form">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="post-author">
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.username}
                  className="avatar"
                />
                <div className="author-info">
                  <span className="username">{user.username}</span>
                  <span className="handle">@{user.handle}</span>
                </div>
              </div>

              <textarea
                className="post-input"
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={280}
              />

              {media.length > 0 && (
                <div className="media-preview">
                  {media.map((file, index) => (
                    <div key={index} className="media-item">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Media ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="remove-media"
                        onClick={() => removeMedia(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="post-actions">
                <label className="media-upload">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaChange}
                  />
                  <i className="icon-image" />
                </label>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || (!content.trim() && media.length === 0)}
                >
                  {isLoading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePostButton; 