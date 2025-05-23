import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

const REACTIONS = [
  { emoji: '👍', label: '点赞' },
  { emoji: '❤️', label: '爱心' },
  { emoji: '😂', label: '大笑' },
  { emoji: '🎉', label: '庆祝' },
  { emoji: '👏', label: '鼓掌' },
  { emoji: '🤔', label: '思考' },
  { emoji: '😮', label: '惊讶' },
  { emoji: '🙌', label: '欢呼' },
];

const Reactions = ({ roomId }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [reactions, setReactions] = useState([]);
  const [showReactions, setShowReactions] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('reaction', data => {
        if (data.roomId === roomId) {
          setReactions(prev => [
            ...prev,
            {
              id: Date.now(),
              emoji: data.emoji,
              user: data.user,
              timestamp: new Date(),
            },
          ]);
        }
      });

      return () => {
        socket.off('reaction');
      };
    }
  }, [socket, roomId]);

  const sendReaction = emoji => {
    if (socket) {
      socket.emit('reaction', {
        roomId,
        emoji,
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
      });
      setShowReactions(false);
    }
  };

  return (
    <div className="relative">
      {/* 反应按钮 */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* 反应选择器 */}
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-lg border">
          <div className="grid grid-cols-4 gap-2">
            {Array.isArray(REACTIONS) &&
              REACTIONS.map(reaction => (
                <button
                  key={reaction.emoji}
                  onClick={() => sendReaction(reaction.emoji)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={reaction.label}
                >
                  <span className="text-2xl">{reaction.emoji}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 反应显示 */}
      {Array.isArray(reactions) && reactions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-lg border">
          <div className="flex flex-wrap gap-2">
            {reactions.map(reaction => (
              <div
                key={reaction.id}
                className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-full"
              >
                <span className="text-lg">{reaction.emoji}</span>
                <span className="text-xs text-gray-500">{reaction.user.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reactions;
