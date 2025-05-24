import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ErrorState from '@/components/common/ErrorState';
import FormInput from '@/components/common/FormInput';
import { useDebounce } from '@/hooks/useDebounce';

const NewMessagePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const debouncedSearch = useDebounce(recipient, 300);

  // 搜索用户
  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/users/search', {
          params: {
            query: debouncedSearch,
            limit: 5,
          },
        });
        setSearchResults(response.data.users);
      } catch (err) {
        toast.error('搜索用户失败');
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  // 发送私信
  const handleSubmit = async e => {
    e.preventDefault();
    if (!recipient.trim() || !content.trim()) {
      toast.error('请选择收件人并输入消息内容');
      return;
    }

    try {
      setSending(true);
      const response = await api.post('/messages', {
        recipient: recipient,
        content: content,
      });
      toast.success('发送成功');
      router.push(`/messages/${response.data.conversationId}`);
    } catch (err) {
      setError(err.message || '发送失败');
      toast.error('发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">请先登录</h2>
            <p className="text-gray-600 mb-4">登录后可以发送私信</p>
            <Button onClick={() => router.push('/login')}>去登录</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* 标题 */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">发起私信</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* 收件人选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">收件人</label>
                <div className="relative">
                  <FormInput
                    type="text"
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    placeholder="输入用户名搜索"
                    className="w-full"
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
                      <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {searchResults.map(user => (
                          <li
                            key={user._id}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                            onClick={() => {
                              setRecipient(user.username);
                              setSearchResults([]);
                            }}
                          >
                            <div className="flex items-center">
                              <img
                                src={user.avatar}
                                alt={user.username}
                                className="h-6 w-6 rounded-full"
                              />
                              <span className="ml-3 block truncate">{user.username}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* 消息内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">消息内容</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="输入你想说的话..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>

              {/* 错误提示 */}
              {error && <div className="text-sm text-red-600">{error}</div>}

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="secondary" onClick={() => router.back()}>
                  取消
                </Button>
                <Button type="submit" disabled={sending || !recipient.trim() || !content.trim()}>
                  {sending ? '发送中...' : '发送'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewMessagePage;
