import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Picker } from 'emoji-mart';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || window.location.origin.replace(/^http/, 'ws');

function Chat() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [readMap, setReadMap] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始化Socket.io连接
    if (!user) return;
    const s = io(SOCKET_URL, { transports: ['websocket'] });
    s.emit('login', user._id);
    setSocket(s);
    return () => { s.disconnect(); };
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    // 新消息推送
    socket.on('new_message', (msg: any) => {
      if (msg.from === userId || msg.to === userId) {
        setMessages(prev => [...prev, msg]);
      }
    });
    // 已读回执
    socket.on('messages_read', (data: any) => {
      setReadMap(prev => ({ ...prev, [data.from]: true }));
    });
    return () => {
      socket.off('new_message');
      socket.off('messages_read');
    };
  }, [socket, userId]);

  useEffect(() => {
    if (userId) loadMessages();
    // eslint-disable-next-line
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 进入聊天窗口自动标记为已读
  useEffect(() => {
    if (socket && userId) {
      socket.emit('read_messages', { from: userId });
    }
  }, [socket, userId, messages.length]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMessages(userId!);
      setMessages(data);
      // 标记已读
      if (socket) socket.emit('read_messages', { from: userId });
    } catch (err) {
      setError('加载消息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (image && socket) {
      const formData = new FormData();
      formData.append('image', image);
      const res = await fetch(`/api/messages/${userId}/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const msg = await res.json();
      socket.emit('send_message', { to: userId, contentType: 'image', imageUrl: msg.imageUrl });
      setImage(null);
      setImagePreview(null);
      return;
    }
    if (!input.trim() || !socket) return;
    try {
      await sendMessage(userId!, input);
      socket.emit('send_message', { to: userId, content: input, contentType: 'text' });
      setInput('');
    } catch (err) {
      setError('发送失败');
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setInput(input + emoji.native);
    setShowEmoji(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (isLoading) return <div className="loading-spinner" />;
  if (error) return <div className="error-message">{error}</div>;

  // 判断最后一条消息是否已读
  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const isLastRead = lastMsg && lastMsg.from === user._id && lastMsg.read;

  return (
    <div className="chat-page max-w-lg mx-auto flex flex-col h-[80vh] p-4">
      <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 dark:bg-[#192734] rounded-lg p-3">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center py-8">暂无消息</div>
        ) : (
          messages.map(msg => (
            <div
              key={msg._id}
              className={`flex ${msg.from === user._id ? 'justify-end' : 'justify-start'} mb-2`}
            >
              {msg.contentType === 'image' ? (
                <img
                  src={msg.imageUrl}
                  alt="图片消息"
                  className="max-w-[60%] rounded-lg shadow border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className={`inline-block px-4 py-2 rounded-2xl shadow text-sm max-w-[70%] ${msg.from === user._id ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
                  {msg.content}
                  <div className="text-xs text-gray-400 mt-1 text-right">{msg.createdAt && new Date(msg.createdAt).toLocaleTimeString()}</div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
        {isLastRead && (
          <div className="text-xs text-green-500 text-right pr-2">已读</div>
        )}
      </div>
      {imagePreview && (
        <div className="mb-2 flex items-center gap-2">
          <img src={imagePreview} alt="预览" className="w-24 h-24 object-cover rounded-lg border" />
          <button className="btn btn-error" onClick={() => { setImage(null); setImagePreview(null); }}>移除</button>
        </div>
      )}
      <form onSubmit={handleSend} className="flex gap-2 items-center">
        <button type="button" className="text-2xl" onClick={() => setShowEmoji(v => !v)}>
          😊
        </button>
        {showEmoji && (
          <div className="absolute bottom-20 left-4 z-50">
            <Picker onSelect={handleEmojiSelect} theme="auto" showPreview={false} showSkinTones={false} />
          </div>
        )}
        <label className="cursor-pointer text-2xl">
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          <i className="icon-image" />
        </label>
        <input
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="输入消息..."
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={500}
          disabled={!!image}
        />
        <button
          type="submit"
          className="btn btn-primary px-6 rounded-full"
          disabled={(!input.trim() && !image) || isLoading}
        >
          发送
        </button>
      </form>
    </div>
  );
}

export default Chat; 