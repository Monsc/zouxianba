import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CreatePostProps {
  onSubmit: (content: string, media?: File) => Promise<void>;
}

export const CreatePost = ({ onSubmit }: CreatePostProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !media) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, media || undefined);
      setContent('');
      setMedia(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setMedia(file);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <button 
        className="fab"
        onClick={() => setIsModalOpen(true)}
        aria-label="Create new post"
      >
        ✏️
      </button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <textarea
                  className="input"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What's happening?"
                  rows={4}
                  maxLength={280}
                />
              </div>

              {media && (
                <div className="mb-3">
                  <img 
                    src={URL.createObjectURL(media)} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }} 
                  />
                  <button 
                    type="button"
                    className="btn btn-secondary mt-2"
                    onClick={() => setMedia(null)}
                  >
                    Remove media
                  </button>
                </div>
              )}

              <div className="input-group">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || (!content.trim() && !media)}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}; 