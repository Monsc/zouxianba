import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';

const ImageUpload = ({
  onUpload,
  maxFiles = 4,
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
}) => {
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async event => {
    const files = Array.from(event.target.files);
    setError('');

    // 验证文件数量
    if (files.length + previews.length > maxFiles) {
      setError(`最多只能上传 ${maxFiles} 张图片`);
      return;
    }

    // 验证文件大小和类型
    const invalidFiles = files.filter(
      file => file.size > maxSize || !file.type.startsWith('image/')
    );

    if (invalidFiles.length > 0) {
      setError('请上传有效的图片文件（最大 5MB）');
      return;
    }

    // 创建预览
    const newPreviews = await Promise.all(
      files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }))
    );

    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      previews.forEach(({ file }) => {
        formData.append('images', file);
      });

      const response = await apiService.uploadImages(formData);
      onUpload(response.urls);
      setPreviews([]);
    } catch (error) {
      setError('上传失败，请重试');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removePreview = index => {
    setPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-4">
        <AnimatePresence>
          {previews.map((preview, index) => (
            <motion.div
              key={preview.preview}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative group"
            >
              <img
                src={preview.preview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => removePreview(index)}
                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {previews.length < maxFiles && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:border-twitter-blue hover:text-twitter-blue transition-colors"
          >
            <span className="text-2xl">+</span>
          </motion.button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.p>
      )}

      {previews.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-2 bg-twitter-blue text-white rounded-full font-medium hover:bg-twitter-blue-dark transition-colors disabled:opacity-50"
        >
          {uploading ? '上传中...' : '上传图片'}
        </motion.button>
      )}
    </div>
  );
};

export default ImageUpload;
