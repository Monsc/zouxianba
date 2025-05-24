import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import { Image, Smile, X } from 'lucide-react';
import { RichTextEditor } from '../components/editor/RichTextEditor';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) {
      showToast('请输入内容或上传图片', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('content', content);
      images.forEach((image) => {
        formData.append('images', image);
      });

      await apiService.createPost(formData);
      showToast('发布成功');
      navigate('/');
    } catch (error) {
      showToast(error?.response?.data?.message || '发布失败，请稍后重试', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      showToast('最多只能上传4张图片', 'error');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        showToast('只能上传图片文件', 'error');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('图片大小不能超过5MB', 'error');
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditorChange = (newContent) => {
    setContent(newContent);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold">发帖</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex space-x-4">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt={user?.username}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <RichTextEditor
                value={content}
                onChange={handleEditorChange}
                placeholder="有什么新鲜事？"
                maxLength={280}
                className="min-h-[120px]"
              />
              
              {/* 图片预览 */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`预览图 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= 4}
                  >
                    <Image className="w-5 h-5 text-blue-500" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                  >
                    <Smile className="w-5 h-5 text-blue-500" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={(!content.trim() && images.length === 0) || isSubmitting}
                >
                  {isSubmitting ? '发布中...' : '发布'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 