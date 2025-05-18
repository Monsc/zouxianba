export interface User {
  _id: string;
  id?: string;
  username: string;
  handle: string;
  avatar: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  isVerified?: boolean;
  followers?: number;
  following?: number;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  from: string;
  to: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Author {
  _id: string;
  username: string;
  handle: string;
  avatar: string;
  isVerified?: boolean;
}

export interface Post {
  _id: string;
  content: string;
  author: Author;
  media?: string[];
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  liked: boolean;
  isEdited?: boolean;
  visibility?: 'public' | 'followers' | 'private';
  hashtags?: string[];
  mentions?: string[];
}

export interface Comment {
  _id: string;
  content: string;
  author: Author;
  post: string;
  media?: string[];
  likes: number;
  createdAt: string;
  updatedAt: string;
  liked: boolean;
  isEdited?: boolean;
  parentComment?: string;
  replies?: Comment[];
}

export interface Notification {
  _id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  read: boolean;
  createdAt: string;
  actor: Author;
  post?: {
    _id: string;
    content: string;
  };
}

export interface ConversationListItem {
  user: Author;
  content: string;
  createdAt: string;
  unreadCount?: number;
}

export interface Hashtag {
  tag: string;
  count: number;
}

export interface Topic {
  tag: string;
  count: number;
} 