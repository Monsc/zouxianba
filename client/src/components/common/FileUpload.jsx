import React, { useRef, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

const FileUpload = ({
  onUpload,
  accept = 'image/*',
  maxSize = 5, // MB
  multiple = false,
  className = '',
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { error } = useToast();

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = file => {
    if (!file.type.match(accept.replace('*', '.*'))) {
      error('不支持的文件类型');
      return false;
    }

    if (file.size > maxSize * 1024 * 1024) {
      error(`文件大小不能超过 ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleDrop = async e => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (!multiple && files.length > 1) {
      error('只能上传一个文件');
      return;
    }

    const validFiles = files.filter(validateFile);
    if (validFiles.length === 0) return;

    try {
      setIsUploading(true);
      await onUpload(multiple ? validFiles : validFiles[0]);
    } catch (err) {
      error('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async e => {
    const files = Array.from(e.target.files);
    if (!multiple && files.length > 1) {
      error('只能上传一个文件');
      return;
    }

    const validFiles = files.filter(validateFile);
    if (validFiles.length === 0) return;

    try {
      setIsUploading(true);
      await onUpload(multiple ? validFiles : validFiles[0]);
    } catch (err) {
      error('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`relative ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging
            ? 'border-primary bg-primary bg-opacity-5'
            : 'border-gray-300 hover:border-primary'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {children || (
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-primary hover:text-primary-dark">点击上传</span>{' '}
              或拖拽文件到此处
            </div>
            <p className="text-xs text-gray-500">
              支持 {accept} 格式，最大 {maxSize}MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
