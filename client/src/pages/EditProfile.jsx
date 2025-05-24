import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useUserStore } from '../store';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const [form, setForm] = useState({
    username: user?.username || '',
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    avatar: user?.avatar || '',
    coverImage: user?.coverImage || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const avatarInputRef = useRef();
  const coverInputRef = useRef();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async e => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setForm({ ...form, avatar: URL.createObjectURL(file) });
    }
  };

  const handleCoverChange = async e => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setForm({ ...form, coverImage: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let avatarUrl = form.avatar;
      let coverUrl = form.coverImage;
      if (avatarFile) {
        const res = await apiService.uploadAvatar(avatarFile);
        avatarUrl = res.avatar;
      }
      // 假设有上传封面API
      if (coverFile && apiService.uploadCover) {
        const res = await apiService.uploadCover(coverFile);
        coverUrl = res.coverImage;
      }
      const updated = await apiService.updateProfile({
        ...form,
        avatar: avatarUrl,
        coverImage: coverUrl,
      });
      setUser(updated);
      navigate('/profile');
    } catch (err) {
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">编辑个人资料</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <img
              src={form.avatar || '/default-avatar.png'}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
              onClick={() => avatarInputRef.current.click()}
              style={{ cursor: 'pointer' }}
            />
            <input
              type="file"
              accept="image/*"
              ref={avatarInputRef}
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
          <button type="button" onClick={() => avatarInputRef.current.click()} className="text-blue-500 text-sm">更换头像</button>
        </div>
        <div className="flex flex-col items-center mb-2">
          <div className="relative mb-2 w-full">
            <img
              src={form.coverImage || '/default-cover.png'}
              alt="cover"
              className="w-full h-32 object-cover rounded-lg border"
              onClick={() => coverInputRef.current.click()}
              style={{ cursor: 'pointer' }}
            />
            <input
              type="file"
              accept="image/*"
              ref={coverInputRef}
              style={{ display: 'none' }}
              onChange={handleCoverChange}
            />
          </div>
          <button type="button" onClick={() => coverInputRef.current.click()} className="text-blue-500 text-sm">更换封面</button>
        </div>
        <div>
          <label className="block text-sm font-medium">昵称</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
            maxLength={30}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">用户名</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
            maxLength={30}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">简介</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
            maxLength={160}
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">位置</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
            maxLength={50}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">网站</label>
          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mt-1"
            maxLength={100}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-500 text-white font-semibold"
            disabled={loading}
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile; 