import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Image, Hash, AtSign, Smile } from 'lucide-react';
import { apiService } from '../../services/api';
import TopicSelector from './TopicSelector';
import MentionSelector from './MentionSelector';
import EmojiPicker from './EmojiPicker';
import { cn } from '../../lib/utils';

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = '有什么新鲜事？',
  maxLength = 280,
  className,
}) => {
  const [charCount, setCharCount] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedMentions, setSelectedMentions] = useState([]);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [showMentionSelector, setShowMentionSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = files.map(file => apiService.uploadImage(file));
      const uploadedImages = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedImages]);
      
      // 在编辑器中插入图片
      const imageHtml = uploadedImages
        .map(img => `<img src="${img.url}" alt="uploaded" class="max-w-full h-auto rounded-lg" />`)
        .join('');
      editorRef.current?.insertContent(imageHtml);
    } catch (error) {
      console.error('图片上传失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!value.trim() && images.length === 0) return;
    
    try {
      setLoading(true);
      await onChange({
        content: value,
        images: images.map(img => img.url),
        topics: selectedTopics,
        mentions: selectedMentions.map(user => user._id)
      });
      setImages([]);
      setSelectedTopics([]);
      setSelectedMentions([]);
    } catch (error) {
      console.error('发布失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const content = e.target.value;
    if (content.length <= maxLength) {
      onChange(content);
      setCharCount(content.length);
    }
  };

  const handleTopicSelect = (topics) => {
    setSelectedTopics(topics);
    const topicText = topics.map(topic => `#${topic}`).join(' ');
    editorRef.current?.insertContent(topicText + ' ');
    setShowTopicSelector(false);
  };

  const handleMentionSelect = (mentions) => {
    setSelectedMentions(mentions);
    const mentionText = mentions.map(user => `@${user.username}`).join(' ');
    editorRef.current?.insertContent(mentionText + ' ');
    setShowMentionSelector(false);
  };

  const handleEmojiSelect = (emoji) => {
    editorRef.current?.insertContent(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="relative">
      <textarea
        ref={editorRef}
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        className={cn(
          'w-full resize-none bg-transparent outline-none text-[15px] leading-6',
          'placeholder:text-gray-500 dark:placeholder:text-gray-400',
          className
        )}
        rows={1}
      />
      <div className="absolute bottom-2 right-2 text-sm text-gray-500 dark:text-gray-400">
        {charCount}/{maxLength}
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={loading}
          >
            <Image className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowTopicSelector(!showTopicSelector)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={loading}
          >
            <Hash className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowMentionSelector(!showMentionSelector)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={loading}
          >
            <AtSign className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            disabled={loading}
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || (!value.trim() && images.length === 0)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '发布中...' : '发布'}
        </button>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* 图片预览 */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={`预览 ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, i) => i !== index))}
                className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 话题选择器弹窗 */}
      {showTopicSelector && (
        <div className="absolute z-10 mt-2">
          <TopicSelector onSelect={handleTopicSelect} selectedTopics={selectedTopics} />
        </div>
      )}

      {/* @提及选择器弹窗 */}
      {showMentionSelector && (
        <div className="absolute z-10 mt-2">
          <MentionSelector onSelect={handleMentionSelect} selectedUsers={selectedMentions} />
        </div>
      )}

      {/* 表情选择器弹窗 */}
      {showEmojiPicker && (
        <div className="absolute z-10 mt-2">
          <EmojiPicker onSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
};

export default RichTextEditor; 