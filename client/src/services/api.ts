const API_URL = process.env.REACT_APP_API_URL || '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  let headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Only set Content-Type if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers = { 'Content-Type': 'application/json', ...headers };
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
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

export async function createPost(data: { content: string; media?: File[] }) {
  if (!data.media || data.media.length === 0) {
    // 只发纯文本
    return fetchApi('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content: data.content }),
    });
  }
  // 有媒体时仍用FormData
  const formData = new FormData();
  formData.append('content', data.content);
  data.media.forEach(file => formData.append('media', file));
  return fetchApi('/api/posts', {
    method: 'POST',
    body: formData,
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

export async function createComment(postId: string, data: { content: string; media?: File[] }) {
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
  return fetchApi(`/users/${id}`);
}

export async function getUserPosts(id: string) {
  return fetchApi(`/users/${id}/posts`);
}

export async function followUser(id: string) {
  return fetchApi(`/users/${id}/follow`, {
        method: 'POST',
  });
}

export async function unfollowUser(id: string) {
  return fetchApi(`/users/${id}/unfollow`, {
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
}) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });
  return fetchApi('/users/profile', {
    method: 'PUT',
    body: formData,
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return fetchApi('/users/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// Search
export async function searchUsers(query: string) {
  return fetchApi<Array<{
    id: string;
    username: string;
    handle: string;
    avatar: string;
    bio?: string;
  }>>(`/search/users?q=${encodeURIComponent(query)}`);
}

export async function searchPosts(query: string) {
  return fetchApi<Array<{
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
  }>>(`/search/posts?q=${encodeURIComponent(query)}`);
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
  }>>('/notifications');
}

export async function markNotificationAsRead(id: string) {
  return fetchApi(`/notifications/${id}/read`, {
    method: 'PUT',
  });
}

export async function getUnreadNotificationCount() {
/**
 * 获取推荐用户列表
 */
export const getRecommendedUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users/recommended`, {
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
    const response = await fetch(`${API_URL}/topics/trending`, {
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
  return fetchApi<{ count: number }>(`/api/posts/new-count?since=${encodeURIComponent(since)}`);
}

export async function reportContent(data: { targetUser?: string; targetPost?: string; targetComment?: string; reason: string; detail?: string }) {
  return fetchApi('/report', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function blockUser(userId: string) {
  return fetchApi(`/block/${userId}`, { method: 'POST' });
}

export async function unblockUser(userId: string) {
  return fetchApi(`/block/${userId}`, { method: 'DELETE' });
}

export async function getConversations() {
  return fetchApi('/messages/conversations');
}

export async function getMessages(userId: string) {
  return fetchApi(`/messages/${userId}`);
}

export async function sendMessage(userId: string, content: string) {
  return fetchApi(`/messages/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function getUnreadMessageCount() {
  return fetchApi<{ count: number }>(`/messages/unread-count`);
}

// 获取热门话题
export const getTrendingHashtags = async () => {
  const response = await fetch('/api/posts/hashtags/trending');
  if (!response.ok) throw new Error('获取热门话题失败');
  return response.json();
};

// 获取话题相关帖子
export const getHashtagPosts = async (tag: string) => {
  const response = await fetch(`/api/posts/hashtags/${tag}`);
  if (!response.ok) throw new Error('获取话题帖子失败');
  return response.json();
};

// 获取用户提及
export const getMentions = async () => {
  const response = await fetch('/api/posts/mentions', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('获取提及失败');
  return response.json();
}; 