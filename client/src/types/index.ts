export interface User {
  _id: string;
  id?: string;
  username: string;
  handle: string;
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
  actor: Author;
  post?: Post;
  comment?: Comment;
  read: boolean;
  createdAt: string;
}

/**
 * Topic interface for hashtags and trending topics
 * @property {string} _id - Unique identifier
 * @property {string} tag - Topic tag (e.g. "javascript")
 * @property {string} [name] - Optional display name
 * @property {string} [description] - Optional description
 * @property {string[]} followers - Array of user IDs following this topic
 * @property {boolean} followed - Whether the current user follows this topic
 * @property {number} count - Number of posts using this topic
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */
export interface Topic {
  _id: string;
  tag: string;
  name?: string;
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