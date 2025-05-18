export interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  followers?: string[];
  following?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  from: string;
  to: string;
  content: string;
  contentType: 'text' | 'image';
  imageUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface Author {
  _id: string;
  username: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface Post {
  _id: string;
  author: Author;
  content: string;
  images?: string[];
  likes: string[];
  liked: boolean;
  comments: Comment[];
  topics: Topic[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  author: Author;
  content: string;
  likes: string[];
  liked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  from: Author;
  post?: Post;
  comment?: Comment;
  read: boolean;
  createdAt: string;
}

export interface Topic {
  _id: string;
  tag: string;
  name: string;
  description?: string;
  followers: string[];
  followed: boolean;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
} 