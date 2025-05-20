import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { fetchApi } from '../services/api';
import LazyImage from './LazyImage';

function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'popular', 'oldest'
  const [replyTo, setReplyTo] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId, sortBy]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetchApi(`/api/posts/${postId}/comments`, {
        params: {
          page,
          limit: 10,
          sort: sortBy,
        },
      });
      
      if (page === 1) {
        setComments(response.data);
      } else {
        setComments(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === 10);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
      fetchComments();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetchApi(`/api/posts/${postId}/comments`, {
        method: 'POST',
        data: {
          content: newComment,
          parentId: replyTo?._id,
        },
      });

      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const renderComment = (comment, level = 0) => {
    const replies = comments.filter(c => c.parentId === comment._id);
    const maxLevel = 2; // 最大嵌套层级

    return (
      <div key={comment._id} className={`${level > 0 ? 'ml-8' : ''}`}>
        <div className="flex space-x-3 p-4 hover:bg-twitter-gray-50 dark:hover:bg-twitter-gray-800/50">
          <LazyImage
            src={comment.author.avatar}
            alt={comment.author.username}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold">{comment.author.username}</span>
              <span className="text-twitter-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
            <p className="mt-1">{comment.content}</p>
            <div className="mt-2 flex items-center space-x-4">
              <button
                onClick={() => setReplyTo(comment)}
                className="text-twitter-gray-500 hover:text-twitter-blue"
              >
                回复
              </button>
              <button className="text-twitter-gray-500 hover:text-twitter-red">
                ❤️ {comment.likes}
              </button>
            </div>
          </div>
        </div>

        {/* 嵌套回复 */}
        {level < maxLevel && replies.length > 0 && (
          <div className="mt-2">
            {replies.map(reply => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4">
      {/* 排序选项 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">评论</h3>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="bg-transparent border border-twitter-gray-200 dark:border-twitter-gray-800 rounded-full px-4 py-1"
        >
          <option value="latest">最新</option>
          <option value="popular">最热</option>
          <option value="oldest">最早</option>
        </select>
      </div>

      {/* 评论输入框 */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-3">
          <LazyImage
            src={user?.avatar}
            alt={user?.username}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? `回复 @${replyTo.author.username}` : '添加评论...'}
              className="w-full p-3 bg-transparent border border-twitter-gray-200 dark:border-twitter-gray-800 rounded-xl focus:ring-2 focus:ring-twitter-blue focus:border-transparent resize-none"
              rows="2"
            />
            {replyTo && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm text-twitter-gray-500">
                  回复 @{replyTo.author.username}
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-twitter-blue hover:underline text-sm"
                >
                  取消
                </button>
              </div>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-twitter-blue text-white rounded-full hover:bg-twitter-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.map(comment => renderComment(comment))}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="text-twitter-blue hover:underline disabled:opacity-50"
          >
            {isLoading ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
    </div>
  );
}

export default CommentSection; 