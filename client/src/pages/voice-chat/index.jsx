import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const VoiceChatPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  // 获取房间列表
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/voice-chat/rooms');
      setRooms(response.data.rooms);
    } catch (err) {
      setError(err.message || '获取房间列表失败');
      toast.error('获取房间列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  // 创建房间
  const handleCreateRoom = async e => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('请输入房间标题');
      return;
    }

    try {
      setCreating(true);
      const response = await api.post('/voice-chat/rooms', {
        title: title.trim(),
        description: description.trim(),
        isPrivate,
      });
      toast.success('房间创建成功');
      setShowCreateModal(false);
      router.push(`/voice-chat/${response.data.room._id}`);
    } catch (err) {
      toast.error('创建房间失败，请重试');
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <EmptyState
            title="请先登录"
            description="登录后可以创建和加入语音聊天室"
            action={<Button onClick={() => router.push('/login')}>去登录</Button>}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* 标题和操作栏 */}
        <div className="mb-6 bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">语音聊天室</h1>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                创建房间
              </Button>
            </div>
          </div>
        </div>

        <LoadingOverlay isLoading={loading}>
          {error ? (
            <ErrorState
              title="获取房间列表失败"
              description={error}
              action={<Button onClick={fetchRooms}>重试</Button>}
            />
          ) : rooms.length === 0 ? (
            <EmptyState
              title="暂无语音聊天室"
              description="创建第一个语音聊天室吧"
              action={<Button onClick={() => setShowCreateModal(true)}>创建房间</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map(room => (
                <div
                  key={room._id}
                  className="bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/voice-chat/${room._id}`)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{room.title}</h3>
                      {room.isPrivate && (
                        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                          私密
                        </span>
                      )}
                    </div>
                    {room.description && (
                      <p className="mt-1 text-sm text-gray-600">{room.description}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <img
                            src={room.host.avatar}
                            alt={room.host.username}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{room.host.username}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {room.participants.length} 人在线
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(room.createdAt), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </LoadingOverlay>

        {/* 创建房间模态框 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">创建语音聊天室</h3>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">房间标题</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="输入房间标题"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    房间描述（可选）
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="输入房间描述"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={e => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                    私密房间（仅受邀用户可加入）
                  </label>
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={creating || !title.trim()}>
                    {creating ? '创建中...' : '创建'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default VoiceChatPage;
