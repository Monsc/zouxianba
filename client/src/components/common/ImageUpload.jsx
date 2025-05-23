import React, { useState } from 'react';
import FileUpload from './FileUpload';
import ImagePreview from './ImagePreview';
import { useToast } from '@/contexts/ToastContext';

const ImageUpload = ({
  value,
  onChange,
  maxSize = 5,
  accept = 'image/*',
  className = '',
  preview = true,
  width,
  height,
}) => {
  const [previewUrl, setPreviewUrl] = useState(value);
  const { error } = useToast();

  const handleUpload = async file => {
    try {
      // 创建预览URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // 调用onChange回调
      onChange?.(file);
    } catch (err) {
      error('图片上传失败，请重试');
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange?.(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {previewUrl ? (
        <div className="relative group">
          <ImagePreview
            src={previewUrl}
            alt="预览图片"
            width={width}
            height={height}
            className="w-full h-full"
            preview={preview}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ) : (
        <FileUpload onUpload={handleUpload} accept={accept} maxSize={maxSize} className="w-full">
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-primary hover:text-primary-dark">点击上传</span>{' '}
              或拖拽图片到此处
            </div>
            <p className="text-xs text-gray-500">
              支持 {accept} 格式，最大 {maxSize}MB
            </p>
          </div>
        </FileUpload>
      )}
    </div>
  );
};

export default ImageUpload;
