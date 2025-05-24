import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Image, Hash, AtSign, Smile } from 'lucide-react';
import { apiService } from '../../services/api';
import TopicSelector from './TopicSelector';
import MentionSelector from './MentionSelector';
import EmojiPicker from './EmojiPicker';

const RichTextEditor = ({ onSubmit, placeholder = '分享你的想法...' }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedMentions, setSelectedMentions] = useState([]);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [showMentionSelector, setShowMentionSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

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
    if (!content.trim() && images.length === 0) return;
    
    try {
      setLoading(true);
      await onSubmit({
        content,
        images: images.map(img => img.url),
        topics: selectedTopics,
        mentions: selectedMentions.map(user => user._id)
      });
      setContent('');
      setImages([]);
      setSelectedTopics([]);
      setSelectedMentions([]);
    } catch (error) {
      console.error('发布失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
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
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <Editor
            apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
            onInit={(evt, editor) => editorRef.current = editor}
            value={content}
            onEditorChange={(newContent) => setContent(newContent)}
            init={{
              height: 200,
              menubar: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
              content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
              placeholder: placeholder,
              resize: false,
              auto_focus: true,
              max_chars: 280,
              setup: (editor) => {
                editor.on('keyup', () => {
                  const count = editor.getContent({ format: 'text' }).length;
                  if (count > 280) {
                    editor.setContent(editor.getContent().substring(0, 280));
                  }
                });
              }
            }}
          />
        </div>
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
          disabled={loading || (!content.trim() && images.length === 0)}
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

      {/* 字符计数 */}
      <div className="mt-2 text-right text-gray-500">
        {content.length}/280
      </div>
    </div>
  );
};

export default RichTextEditor; 