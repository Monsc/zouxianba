export interface User {
  _id: string;
  username: string;
  handle: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  isFollowing?: boolean;
  isBlocked?: boolean;
  createdAt: string;
}

export interface Post {
  _id: string;
  content: string;
  media?: string[];
  author: User;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  hashtags?: string[];
  mentions?: string[];
}

export interface Comment {
  _id: string;
  content: string;
  media?: string[];
  author: User;
  post: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  read: boolean;
  sender: User;
  post?: Post;
  comment?: Comment;
  createdAt: string;
}

export interface Message {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
} 