import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import RichTextEditor from '../components/editor/RichTextEditor';
import { apiService } from '../services/api';
import MainLayout from '../components/layout/MainLayout';

const CreatePost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      await apiService.createPost({
        content: data.content,
        images: data.images,
        topics: data.topics,
        mentions: data.mentions
      });
      toast.success('发布成功');
      navigate('/');
    } catch (error) {
      console.error('发布失败:', error);
      toast.error('发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">发布动态</h2>
        
        <div className="space-y-4">
          {/* 富文本编辑器 */}
          <RichTextEditor
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatePost; 