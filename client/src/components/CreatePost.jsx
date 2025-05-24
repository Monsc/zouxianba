import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Image, X, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!content.trim() && selectedImages.length === 0) || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('content', content);
      selectedImages.forEach((image) => {
        formData.append('media', image);
      });

      await apiService.createPost(formData);
      setContent('');
      setSelectedImages([]);
      onPostCreated?.();
      showToast('发布成功', 'success');
    } catch (error) {
      showToast('发布失败', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件', 'error');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('图片大小不能超过5MB', 'error');
        return false;
      }
      return true;
    });

    if (selectedImages.length + validFiles.length > 4) {
      showToast('最多只能上传4张图片', 'error');
      return;
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleTextareaResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 mb-4 transition-shadow hover:shadow-md border-b border-gray-200 dark:border-gray-800">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <img
            src={user?.avatar}
            alt={user?.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                handleTextareaResize();
              }}
              placeholder="有什么新鲜事？"
              className="w-full resize-none border-none focus:ring-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl text-[15px] py-2 px-3 min-h-[48px]"
              rows={1}
            />

            {selectedImages.length > 0 && (
              <div className={`grid gap-2 mt-2 ${
                selectedImages.length === 1 ? 'grid-cols-1' :
                selectedImages.length === 2 ? 'grid-cols-2' :
                selectedImages.length === 3 ? 'grid-cols-2' :
                'grid-cols-2'
              }`}>
                {selectedImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative ${
                      selectedImages.length === 3 && index === 0 ? 'row-span-2' : ''
                    }`}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-gray-900/50 rounded-full text-white hover:bg-gray-900/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full transition-transform duration-100 hover:scale-110"
                  disabled={selectedImages.length >= 4}
                >
                  <Image className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full transition-transform duration-100 hover:scale-110"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                disabled={(!content.trim() && selectedImages.length === 0) || isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      </form>

      {showEmojiPicker && (
        <div className="absolute left-4 mt-2 z-50">
          <div className="relative">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        </div>
      )}
    </div>
  );
}
