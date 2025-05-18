import { User, Post, Comment, Notification, Message, ConversationListItem } from '../types';

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
export async function login(email: string, password: string) {
  return fetchApi<{ user: any; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  username: string,
  email: string,
  password: string,
  handle: string
) {
  return fetchApi<{ user: any; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, handle }),
  });
}

export async function logout() {
  return fetchApi('/api/auth/logout', {
    method: 'POST',
  });
}

// Posts
export async function getFeed() {
  return fetchApi('/api/posts/feed');
}

export async function getPost(id: string) {
  return fetchApi(`/api/posts/${id}`);
}

export async function createPost(data: { content: string; media?: File[] } | FormData) {
  if (data instanceof FormData) {
    return fetchApi('/api/posts', {
      method: 'POST',
      body: data,
    });
  }
  // 只发纯文本
  return fetchApi('/api/posts', {
    method: 'POST',
    body: JSON.stringify({ content: data.content }),
  });
}

export async function likePost(id: string) {
  return fetchApi(`/api/posts/${id}/like`, {
    method: 'POST',
  });
}

export async function getComments(postId: string) {
  return fetchApi(`/api/posts/${postId}/comments`);
}

export async function createComment(postId: string, data: { content: string; media?: File[] } | FormData) {
  if (data instanceof FormData) {
    return fetchApi(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: data,
    });
  }
  const formData = new FormData();
  formData.append('content', data.content);
  if (data.media) {
    data.media.forEach(file => formData.append('media', file));
  }
  return fetchApi(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: formData,
  });
}

// User
export async function getUserProfile(id: string) {
  return fetchApi(`/api/users/${id}`);
}

export async function getUserPosts(id: string) {
  return fetchApi(`/api/users/${id}/posts`);
}

export async function followUser(id: string) {
  return fetchApi(`/api/users/${id}/follow`, {
    method: 'POST',
  });
}

export async function unfollowUser(id: string) {
  return fetchApi(`/api/users/${id}/unfollow`, {
    method: 'POST',
  });
}

export async function updateProfile(data: {
  username?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: File;
} | FormData) {
  if (data instanceof FormData) {
    return fetchApi('/api/users/profile', {
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
  return fetchApi('/api/users/profile', {
    method: 'PUT',
    body: formData,
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return fetchApi('/api/users/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// Search
export async function searchUsers(query: string) {
  return fetchApi<User[]>(`/api/search/users?q=${encodeURIComponent(query)}`);
}

export async function searchPosts(query: string) {
  return fetchApi<Post[]>(`/api/search/posts?q=${encodeURIComponent(query)}`);
}

// Notifications
export async function getNotifications() {
  return fetchApi<Array<{
    id: string;
    type: 'like' | 'comment' | 'follow' | 'mention';
    read: boolean;
    createdAt: string;
    actor: {
      id: string;
      username: string;
      handle: string;
      avatar: string;
    };
    post?: {
      id: string;
      content: string;
    };
  }>>('/api/notifications');
}

export async function markNotificationAsRead(id: string) {
  return fetchApi(`/api/notifications/${id}/read`, {
    method: 'PUT',
  });
}

export async function getUnreadNotificationCount() {
  return fetchApi<{ count: number }>('/api/notifications/unread/count');
}

/**
 * 获取推荐用户列表
 */
export const getRecommendedUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/api/users/recommended`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch recommended users');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recommended users:', error);
    return [];
  }
};

/**
 * 获取热门话题列表
 */
export const getTrendingTopics = async () => {
  try {
    const response = await fetch(`${API_URL}/api/topics/trending`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending topics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return [];
  }
};

export async function getNewPostCount(since: string) {
  return fetchApi<number>(`/api/posts/new/count?since=${encodeURIComponent(since)}`);
}

export async function reportContent(data: { targetUser?: string; targetPost?: string; targetComment?: string; reason: string; detail?: string }) {
  return fetchApi('/api/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function blockUser(userId: string) {
  return fetchApi(`/api/users/${userId}/block`, {
    method: 'POST',
  });
}

export async function unblockUser(userId: string) {
  return fetchApi(`/api/users/${userId}/unblock`, {
    method: 'POST',
  });
}

// Messages
export async function getConversations() {
  return fetchApi<ConversationListItem[]>('/api/messages/conversations');
}

export async function getMessages(userId: string): Promise<Message[]> {
  return fetchApi<Message[]>(`/api/messages/${userId}`);
}

export async function sendMessage(userId: string, content: string) {
  return fetchApi(`/api/messages/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function getUnreadMessageCount() {
  return fetchApi<number>('/api/messages/unread/count');
}

export const getTrendingHashtags = async () => {
  try {
    const response = await fetch(`${API_URL}/api/hashtags/trending`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending hashtags');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    return [];
  }
};

export const getHashtagPosts = async (tag: string) => {
  try {
    const response = await fetch(`${API_URL}/api/hashtags/${encodeURIComponent(tag)}/posts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch hashtag posts');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching hashtag posts:', error);
    return [];
  }
};

export const getMentions = async () => {
  try {
    const response = await fetch(`${API_URL}/api/mentions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch mentions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching mentions:', error);
    return [];
  }
}; 