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
        className="create-post-button fixed bottom-20 right-6 z-50 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:bg-primary-hover dark:bg-primary dark:hover:bg-blue-400 transition-all duration-200 text-3xl md:w-14 md:h-14 md:text-2xl"
        onClick={() => setIsModalOpen(true)}
        aria-label="Create Post"
      >
        <i className="icon-plus" />
      </button>

      {isModalOpen && (
        <div className="modal-overlay fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn" onClick={() => setIsModalOpen(false)}>
          <div className="modal bg-white dark:bg-[#192734] rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">Create Post</h2>
              <button
                className="close-button text-2xl text-gray-400 hover:text-primary transition-colors"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="post-form flex flex-col gap-4">
              {error && (
                <div className="error-message bg-red-100 text-red-700 rounded px-3 py-2 text-sm mb-2">
                  {error}
                </div>
              )}

              <div className="post-author flex items-center gap-3 mb-2">
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.username}
                  className="avatar w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover shadow"
                />
                <div className="author-info">
                  <span className="username font-bold text-md">{user.username}</span>
                  <span className="handle text-gray-400 text-sm ml-2">@{user.handle}</span>
                </div>
              </div>

              <textarea
                className="post-input w-full min-h-[80px] rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#15202b] p-3 text-md resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={280}
              />

              {media.length > 0 && (
                <div className="media-preview grid grid-cols-2 gap-2 mt-2">
                  {media.map((file, index) => (
                    <div key={index} className="media-item relative group rounded-lg overflow-hidden shadow">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Media ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
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

              <div className="post-actions flex items-center gap-4 mt-2">
                <label className="media-upload cursor-pointer flex items-center gap-2 text-primary hover:text-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                  <i className="icon-image text-xl" />
                  <span className="text-sm">Media</span>
                </label>

                <button
                  type="submit"
                  className="btn btn-primary px-6 py-2 rounded-full font-bold text-white bg-primary hover:bg-primary-hover dark:bg-primary dark:hover:bg-blue-400 shadow transition-all disabled:opacity-60"
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