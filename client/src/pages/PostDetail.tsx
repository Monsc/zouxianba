import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPost, getComments, createComment, likePost } from '../services/api';
import PostCard from '../components/PostCard';
import ReportModal from '../components/ReportModal';

interface Comment {
  id: string;
  content: string;
  media?: string[];
  author: {
    id: string;
    username: string;
    handle: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies: number;
}

interface Post {
  id: string;
  content: string;
  media?: string[];
  author: {
    id: string;
    username: string;
    handle: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);

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
    try {
      setIsLoading(true);
      const [postData, commentsData] = await Promise.all([
        getPost(postId!),
        getComments(postId!)
      ]);
      setPost(postData as Post);
      setComments(commentsData as Comment[]);
      setError(null);
    } catch (err) {
      setError('Failed to load post. Please try again later.');
      console.error('Error loading post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      await likePost(post.id);
      setPost({
        ...post,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        isLiked: !post.isLiked
      });
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked
        };
      }
      return comment;
    }));
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const comment = await createComment(postId!, { content: newComment });
      setComments([comment as Comment, ...comments]);
      setNewComment('');
      if (post) {
        setPost({
          ...post,
          comments: post.comments + 1
        });
      }
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  // 过滤被屏蔽用户的评论
  const visibleComments = currentUser && Array.isArray((currentUser as any).blocked)
    ? comments.filter(comment => !(currentUser as any).blocked.includes(comment.author.id))
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
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={280}
              onFocus={handleCommentFocus}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!newComment.trim()}
          >
            Comment
          </button>
        </form>

        <div className="comments-list">
          {visibleComments.map(comment => (
            <div key={comment.id} className="comment-card relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10"
                onClick={() => setReportCommentId(comment.id)}
                aria-label="举报评论"
              >
                <i className="icon-bell" />
              </button>
              <ReportModal open={reportCommentId === comment.id} onClose={() => setReportCommentId(null)} targetComment={comment.id} />
              <div className="comment-header">
                <img
                  src={comment.author.avatar}
                  alt={comment.author.username}
                  className="avatar"
                  onClick={() => navigate(`/profile/${comment.author.id}`)}
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
                  className={`action-button ${comment.isLiked ? 'liked' : ''}`}
                  onClick={() => handleCommentLike(comment.id)}
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
  );
}

export default PostDetail; 