import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ReportModal from './ReportModal';
import { Heart, MessageCircle, Share2, MoreHorizontal, Repeat2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';

export const PostCard = ({ post, onLike, onComment, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [isLiked, setIsLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [shares, setShares] = useState(post.shares || 0);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [isReposted, setIsReposted] = useState(post.isReposted);
  const [repostCount, setRepostCount] = useState(post.repostCount);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmitComment = e => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    onComment(post._id, commentContent);
    setCommentContent('');
  };

  const handleAuthorClick = e => {
    e.stopPropagation();
    navigate(`/profile/${post.author._id}`);
  };

  const handlePostClick = () => {
    navigate(`/post/${post._id}`);
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await apiService.unlikePost(post._id);
        setLikes(prev => prev - 1);
      } else {
        await apiService.likePost(post._id);
        setLikes(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      showToast('操作失败', 'error');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${post.author.username} 的帖子`,
        text: post.content,
        url: window.location.origin + `/post/${post._id}`,
      });
      setShares(prev => prev + 1);
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm('确定要删除这条帖子吗？')) {
      onDelete(post._id);
    }
  };

  const handleRepost = async () => {
    try {
      if (isReposted) {
        await apiService.unrepostPost(post._id);
        setRepostCount(prev => prev - 1);
      } else {
        await apiService.repostPost(post._id);
        setRepostCount(prev => prev + 1);
      }
      setIsReposted(!isReposted);
    } catch (error) {
      showToast('操作失败', 'error');
    }
  };

  const renderMedia = () => {
    if (!post.media) return null;

    if (post.media.type === 'image') {
      return (
        <img
          src={post.media.url}
          alt="Post attachment"
          className="mt-4 rounded-lg max-h-96 w-full object-cover"
          loading="lazy"
        />
      );
    }

    if (post.media.type === 'video') {
      return (
        <video
          src={post.media.url}
          controls
          className="mt-4 rounded-lg max-h-96 w-full"
          poster={post.media.thumbnail}
        />
      );
    }

    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 mb-4 transition-shadow hover:shadow-md cursor-pointer" onClick={handlePostClick}>
      <div className="flex items-start space-x-3">
        <img src={post.author.avatar} alt={post.author.username} className="w-12 h-12 rounded-full object-cover" onClick={handleAuthorClick} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-900 dark:text-white hover:underline" onClick={handleAuthorClick}>{post.author.username}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">@{post.author.handle}</span>
            <span className="text-gray-400 text-xs">· {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: zhCN })}</span>
          </div>
          <div className="mt-2 text-[15px] whitespace-pre-wrap text-gray-900 dark:text-white">{post.content}</div>
          {renderMedia()}
          <div className="mt-3 flex items-center justify-between max-w-md">
            <Button variant="ghost" size="sm" onClick={() => setShowComments(true)} className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 rounded-full" aria-label="评论"><MessageCircle className="h-5 w-5" /><span>{post.comments?.length || 0}</span></Button>
            <Button variant="ghost" size="sm" onClick={handleRepost} className={`flex items-center space-x-1 ${isReposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'} rounded-full`}><Repeat2 className="h-5 w-5" /><span>{repostCount}</span></Button>
            <Button variant="ghost" size="sm" onClick={handleLike} className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} rounded-full`}><Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} /><span>{likes}</span></Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 rounded-full"><Share2 className="h-5 w-5" /></Button>
            <div className="relative" ref={menuRef}>
              <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setShowMenu(!showMenu); }} aria-label="更多选项" className="text-gray-500 hover:text-blue-500 rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10">
                  <button onClick={handleDelete} className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">删除</button>
                  <button onClick={() => setShowReport(true)} className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">举报</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        postId={post._id}
      />
    </div>
  );
};
