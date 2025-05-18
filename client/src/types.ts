export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: string;
}

export interface Author {
  _id: string;
  id: string;
  username: string;
  handle: string;
  avatar: string;
}

export interface Post {
  _id: string;
  id: string;
  content: string;
  author: Author;
  media?: string[];
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  liked?: boolean;
}

export interface ConversationListItem {
  user: {
    _id: string;
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
} 