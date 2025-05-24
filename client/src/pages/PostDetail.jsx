import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPost, getComments, createComment, likePost } from '../services/api';
import { PostCard } from '../components/PostCard';
import ReportModal from '../components/ReportModal';
import MainLayout from '../components/layout/MainLayout';

function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const [reportCommentId, setReportCommentId] = useState(null);

  useEffect(() => {
    if (!postId) {
      navigate('/');
      return;
    }

    loadPost();
  }, [postId, navigate]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleCommentFocus = () => {
    if (textareaRef.current && window.innerWidth <= 600) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  };

  const loadPost = async () => {
    if (!postId) return;
    try {
      setIsLoading(true);
      const [postData, commentsData] = await Promise.all([getPost(postId), getComments(postId)]);
      setPost(postData);
      setComments(commentsData);
      setError(null);
    } catch (err) {
      setError('Failed to load post. Please try again later.');
      console.error('Error loading post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post?._id) return;

    try {
      await likePost(post._id);
      setPost(prev =>
        prev
          ? {
              ...prev,
              likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
              liked: !prev.liked,
            }
          : null
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleCommentLike = async commentId => {
    setComments(
      comments.map(c =>
        c._id === commentId
          ? {
              ...c,
              likes: c.liked ? c.likes - 1 : c.likes + 1,
              liked: !c.liked,
            }
          : c
      )
    );
  };

  const handleCommentSubmit = async e => {
    e.preventDefault();
    if (!newComment.trim() || !postId) return;

    try {
      const comment = await createComment(postId, { content: newComment });
      setComments([comment, ...comments]);
      setNewComment('');
      setPost(prev =>
        prev
          ? {
              ...prev,
              comments: prev.comments + 1,
            }
          : null
      );
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  // 过滤被屏蔽用户的评论
  const visibleComments = currentUser?.blocked
    ? comments.filter(comment => !currentUser.blocked.includes(comment.author._id))
    : comments;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-error">{error || 'Post not found'}</p>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="post-detail-page">
        <PostCard post={post} onLike={handleLike} />
        <div className="comments-section">
          <h2 className="comments-title">Comments</h2>
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="comment-input-container">
              <img
                src={currentUser?.avatar || '/default-avatar.png'}
                alt={currentUser?.username}
                className="avatar"
              />
              <textarea
                ref={textareaRef}
                className="comment-input"
                placeholder="Write a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                maxLength={280}
                onFocus={handleCommentFocus}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
              Comment
            </button>
          </form>
          <div className="comments-list">
            {visibleComments.map(comment => (
              <div key={comment._id} className="comment-card relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10"
                  onClick={() => setReportCommentId(comment._id)}
                  aria-label="举报评论"
                >
                  <i className="icon-bell" />
                </button>
                {reportCommentId === comment._id && (
                  <ReportModal
                    type="content"
                    targetId={comment._id}
                    onClose={() => setReportCommentId(null)}
                  />
                )}
                <div className="comment-header">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    className="avatar"
                    onClick={() => navigate(`/profile/${comment.author._id}`)}
                  />
                  <div className="comment-meta">
                    <div className="comment-author">
                      <span className="username">{comment.author.username}</span>
                      <span className="handle">@{comment.author.handle}</span>
                    </div>
                    <span className="comment-time">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="comment-content">
                  <p>{comment.content}</p>
                  {comment.media && comment.media.length > 0 && (
                    <div className="comment-media">
                      {comment.media.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="comment-image"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="comment-actions">
                  <button
                    className={`action-button ${comment.liked ? 'liked' : ''}`}
                    onClick={() => handleCommentLike(comment._id)}
                  >
                    <i className="icon-heart" />
                    <span>{comment.likes}</span>
                  </button>
                  <button className="action-button">
                    <i className="icon-reply" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default PostDetail;
