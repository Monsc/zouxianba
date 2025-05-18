export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    handle: string;
    avatar: string;
  };
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