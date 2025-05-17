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