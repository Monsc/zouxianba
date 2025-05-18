import { User, Post, Comment, Notification, Message, Topic, Conversation } from '../types';

const API_URL = process.env.REACT_APP_API_URL || '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// 获取 CSRF token
const getCsrfToken = () => {
  const name = 'XSRF-TOKEN';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return '';
};

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  let headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 添加 CSRF token 到所有非 GET 请求
  if (options.method && options.method !== 'GET') {
    headers = {
      ...headers,
      'X-CSRF-Token': getCsrfToken() || '',
    };
  }

  // Only set Content-Type if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers = { 'Content-Type': 'application/json', ...headers };
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // 添加这行以支持跨域 cookie
  });

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid server response');
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }

  return (data.data ?? data) as T;
}

// Auth
export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  return fetchApi<{ user: User; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  return fetchApi<{ user: User; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function logout(): Promise<void> {
  return fetchApi<void>('/api/auth/logout', {
    method: 'POST',
  });
}

// Posts
export async function getFeed(): Promise<Post[]> {
  return fetchApi<Post[]>('/api/posts/feed');
}

export async function getPost(id: string): Promise<Post> {
  return fetchApi<Post>(`/api/posts/${id}`);
}

export async function createPost(data: { content: string; images?: File[] } | FormData): Promise<Post> {
  if (data instanceof FormData) {
    return fetchApi<Post>('/api/posts', {
      method: 'POST',
      body: data,
    });
  }
  const formData = new FormData();
  formData.append('content', data.content);
  if (data.images) {
    data.images.forEach(file => formData.append('images', file));
  }
  return fetchApi<Post>('/api/posts', {
    method: 'POST',
    body: formData,
  });
}

export async function likePost(id: string): Promise<Post> {
  return fetchApi<Post>(`/api/posts/${id}/like`, {
    method: 'POST',
  });
}

export async function getComments(postId: string): Promise<Comment[]> {
  return fetchApi<Comment[]>(`/api/posts/${postId}/comments`);
}

export async function createComment(postId: string, data: { content: string; images?: File[] } | FormData): Promise<Comment> {
  if (data instanceof FormData) {
    return fetchApi<Comment>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: data,
    });
  }
  const formData = new FormData();
  formData.append('content', data.content);
  if (data.images) {
    data.images.forEach(file => formData.append('images', file));
  }
  return fetchApi<Comment>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: formData,
  });
}

// User
export async function getUserProfile(id: string): Promise<User> {
  return fetchApi<User>(`/api/users/${id}`);
}

export async function getUserPosts(id: string): Promise<Post[]> {
  return fetchApi<Post[]>(`/api/users/${id}/posts`);
}

export async function followUser(id: string): Promise<void> {
  return fetchApi<void>(`/api/users/${id}/follow`, {
    method: 'POST',
  });
}

export async function unfollowUser(id: string): Promise<void> {
  return fetchApi<void>(`/api/users/${id}/unfollow`, {
    method: 'POST',
  });
}

export async function updateProfile(data: {
  username?: string;
  email?: string;
  bio?: string;
  avatar?: File;
} | FormData): Promise<User> {
  if (data instanceof FormData) {
    return fetchApi<User>('/api/users/profile', {
      method: 'PUT',
      body: data,
    });
  }
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });
  return fetchApi<User>('/api/users/profile', {
    method: 'PUT',
    body: formData,
  });
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return fetchApi<void>('/api/users/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// Search
export async function searchUsers(query: string): Promise<User[]> {
  return fetchApi<User[]>(`/api/search/users?q=${encodeURIComponent(query)}`);
}

export async function searchPosts(query: string): Promise<Post[]> {
  return fetchApi<Post[]>(`/api/search/posts?q=${encodeURIComponent(query)}`);
}

// Notifications
export async function getNotifications(): Promise<Notification[]> {
  return fetchApi<Notification[]>('/api/notifications');
}

export async function markNotificationAsRead(id: string): Promise<void> {
  return fetchApi<void>(`/api/notifications/${id}/read`, {
    method: 'PUT',
  });
}

export async function getUnreadNotificationCount(): Promise<{ count: number }> {
  return fetchApi<{ count: number }>('/api/notifications/unread/count');
}

/**
 * 获取推荐用户列表
 */
export async function getRecommendedUsers(): Promise<User[]> {
  return fetchApi<User[]>('/api/users/recommended');
}

/**
 * 获取热门话题列表
 */
export async function getTrendingTopics(): Promise<Topic[]> {
  return fetchApi<Topic[]>('/api/topics/trending');
}

export async function getNewPostCount(since: string): Promise<{ count: number }> {
  return fetchApi<{ count: number }>(`/api/posts/new/count?since=${encodeURIComponent(since)}`);
}

export async function reportContent(data: { 
  targetUser?: string; 
  targetPost?: string; 
  targetComment?: string; 
  reason: string; 
  detail?: string 
}): Promise<void> {
  return fetchApi<void>('/api/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function blockUser(userId: string): Promise<void> {
  return fetchApi<void>(`/api/users/${userId}/block`, {
    method: 'POST',
  });
}

export async function unblockUser(userId: string): Promise<void> {
  return fetchApi<void>(`/api/users/${userId}/unblock`, {
    method: 'POST',
  });
}

// Messages
export async function getConversations(): Promise<Conversation[]> {
  return fetchApi<Conversation[]>('/api/conversations');
}

export async function getMessages(userId: string): Promise<Message[]> {
  return fetchApi<Message[]>(`/api/messages/${userId}`);
}

export async function sendMessage(userId: string, content: string): Promise<Message> {
  return fetchApi<Message>(`/api/messages/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function sendImageMessage(userId: string, image: File): Promise<Message> {
  const formData = new FormData();
  formData.append('image', image);
  return fetchApi<Message>(`/api/messages/${userId}/image`, {
    method: 'POST',
    body: formData,
  });
}

export async function getUnreadMessageCount(): Promise<number> {
  return fetchApi<number>('/api/conversations/unread/count');
}

export async function getMentions(): Promise<User[]> {
  return fetchApi<User[]>('/api/mentions');
} 