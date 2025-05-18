import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createPost } from '../services/api';
import { Mention, MentionsInput } from 'react-mentions';
import 'react-mentions/dist/style.css';

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理话题和提及的样式
  const mentionStyle = {
    backgroundColor: '#e8f5fe',
    color: '#1da1f2',
    padding: '2px 4px',
    borderRadius: '4px',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('content', content);
      images.forEach(image => formData.append('images', image));

      await createPost(formData);
      setContent('');
      setImages([]);
      setPreviews([]);
    } catch (error) {
      console.error('发帖失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      alert('最多只能上传4张图片');
      return;
    }

    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          <img
            src={user?.avatar || '/default-avatar.png'}
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <MentionsInput
              value={content}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setContent(e.target.value)
              }
              placeholder="有什么新鲜事？"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                data={[]} // 这里需要实现用户搜索API
                style={mentionStyle}
                appendSpaceOnAdd
              />
              <Mention
                trigger="#"
                data={[]} // 这里需要实现话题搜索API
                style={mentionStyle}
                appendSpaceOnAdd
              />
            </MentionsInput>

            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`预览 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:text-primary-dark"
                >
                  <i className="icon-image text-xl" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && images.length === 0)}
                className="btn btn-primary px-6 rounded-full"
              >
                {isSubmitting ? '发布中...' : '发布'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
