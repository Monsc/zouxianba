import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import FormInput from '@/components/common/FormInput';
import ImageUpload from '@/components/common/ImageUpload';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useForm } from 'react-hook-form';

const CreatePostPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // 处理图片上传
  const handleImageUpload = async files => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.post('/upload/images', formData);
      setImages(prev => [...prev, ...response.data.urls]);
      toast.success('图片上传成功');
    } catch (err) {
      toast.error('图片上传失败，请重试');
    }
  };

  // 处理图片删除
  const handleImageDelete = index => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // 处理帖子提交
  const onSubmit = async data => {
    try {
      setLoading(true);
      await api.post('/posts', {
        ...data,
        images,
      });
      toast.success('发布成功');
      router.push('/');
    } catch (err) {
      toast.error(err.message || '发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* 页面标题 */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">发布新动态</h1>
          </div>

          {/* 表单内容 */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <LoadingOverlay isLoading={loading}>
              {/* 内容输入 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                <textarea
                  {...register('content', {
                    required: '请输入内容',
                    maxLength: {
                      value: 1000,
                      message: '内容不能超过1000个字符',
                    },
                  })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="分享你的想法..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              {/* 图片上传 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图片（最多9张）
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`图片 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {images.length < 9 && (
                    <ImageUpload
                      onChange={handleImageUpload}
                      multiple
                      maxSize={5}
                      accept="image/*"
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary"
                    >
                      <div className="text-center">
                        <svg
                          className="mx-auto h-8 w-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <p className="mt-1 text-sm text-gray-500">点击上传图片</p>
                      </div>
                    </ImageUpload>
                  )}
                </div>
              </div>

              {/* 可见性设置 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">可见性</label>
                <select
                  {...register('visibility', { required: true })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md"
                >
                  <option value="public">所有人可见</option>
                  <option value="followers">仅关注者可见</option>
                  <option value="private">仅自己可见</option>
                </select>
              </div>

              {/* 标签输入 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签（用逗号分隔）
                </label>
                <input
                  type="text"
                  {...register('tags')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="例如：生活,美食,旅行"
                />
              </div>

              {/* 位置信息 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">位置</label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="添加位置信息"
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                  取消
                </Button>
                <Button type="submit" loading={loading}>
                  发布
                </Button>
              </div>
            </LoadingOverlay>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatePostPage;
