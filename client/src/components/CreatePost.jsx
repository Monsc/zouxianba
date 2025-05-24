import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Icon } from './Icon';
import { Avatar } from './Avatar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { PostService } from '../services/PostService';
import { cn } from '../lib/utils';

export const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleContentChange = e => {
    setContent(e.target.value);
    // 提取标签
    const tagMatches = e.target.value.match(/#[\w\u4e00-\u9fa5]+/g);
    if (tagMatches) {
      setTags(tagMatches.map(tag => tag.slice(1)));
    }
  };

  const handleImageSelect = e => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 9) {
      showToast('最多只能上传 9 张图片', 'warning');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        showToast('只能上传图片文件', 'error');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('图片大小不能超过 5MB', 'error');
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);

    // 生成预览 URL
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoSelect = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('只能上传视频文件', 'error');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('视频大小不能超过 50MB', 'error');
      return;
    }

    setVideo(file);
    setImages([]);
    setPreviewUrls([]);
  };

  const removeImage = index => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim() && images.length === 0 && !video) {
      showToast('请输入内容或上传媒体文件', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('content', content);
      images.forEach(image => formData.append('images', image));
      if (video) formData.append('video', video);
      tags.forEach(tag => formData.append('tags', tag));

      const response = await PostService.createPost(formData);
      onPostCreated(response.post);
      resetForm();
      showToast('发布成功', 'success');
    } catch (error) {
      showToast('发布失败，请重试', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setImages([]);
    setVideo(null);
    setTags([]);
    setPreviewUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#15202b] rounded-2xl shadow-xl p-5 mb-4 border border-gray-100 dark:border-gray-800 transition-all">
      <div className="flex items-start gap-3">
        <Avatar src={user?.avatar} alt={user?.username || ''} size="md" className="flex-shrink-0" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="分享你的想法..."
            className="w-full h-20 md:h-24 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#192734] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-base transition-all shadow-sm"
          />

          {previewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`预览 ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="x" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {video && (
            <div className="mt-4 relative">
              <video src={URL.createObjectURL(video)} className="w-full rounded-lg" controls />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoSelect}
                accept="video/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="flex items-center space-x-1"
              >
                <Icon name="image" className="w-5 h-5" />
                <span>图片</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => videoInputRef.current && videoInputRef.current.click()}
                className="flex items-center space-x-1"
              >
                <Icon name="video" className="w-5 h-5" />
                <span>视频</span>
              </Button>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-primary text-white px-6 py-2 font-bold shadow hover:bg-primary/90 transition-all"
            >
              {isSubmitting ? '发布中...' : '发布'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
