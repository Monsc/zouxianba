const API_URL = process.env.REACT_APP_API_URL || 'https://zouxianba.onrender.com/api';

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

async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  let headers = {
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

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid server response');
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }

  return data.data ?? data;
}

// Auth
export async function login(email, password) {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(username, email, password, handle) {
  return fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, handle }),
  });
}

export async function logout() {
  return fetchApi('/auth/logout', {
    method: 'POST',
  });
}

// Posts
export async function getFeed() {
  return fetchApi('/posts/feed');
}

export async function getPost(id) {
  return fetchApi(`/posts/${id}`);
}

export async function createPost(data) {
  if (data instanceof FormData) {
    return fetchApi('/posts', {
      method: 'POST',
      body: data,
    });
  }
  const formData = new FormData();
  formData.append('content', data.content);
  if (data.images) {
    data.images.forEach(file => formData.append('images', file));
  }
  return fetchApi('/posts', {
    method: 'POST',
    body: formData,
  });
}

export async function likePost(id) {
  return fetchApi(`/posts/${id}/like`, {
    method: 'POST',
  });
}

export async function getComments(postId) {
  return fetchApi(`/posts/${postId}/comments`);
}

export async function createComment(postId, data) {
  if (data instanceof FormData) {
    return fetchApi(`/posts/${postId}/comments`, {
      method: 'POST',
      body: data,
    });
  }
  const formData = new FormData();
  formData.append('content', data.content);
  if (data.images) {
    data.images.forEach(file => formData.append('images', file));
  }
  return fetchApi(`/posts/${postId}/comments`, {
    method: 'POST',
    body: formData,
  });
}

// User
export async function getUserProfile(id) {
  return fetchApi(`/users/${id}`);
}

export async function getUserPosts(id) {
  return fetchApi(`/users/${id}/posts`);
}

export async function followUser(id) {
  return fetchApi(`/users/${id}/follow`, {
    method: 'POST',
  });
}

export async function unfollowUser(id) {
  return fetchApi(`/users/${id}/unfollow`, {
    method: 'POST',
  });
}

export async function updateProfile(data) {
  if (data instanceof FormData) {
    return fetchApi('/users/profile', {
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
  return fetchApi('/users/profile', {
    method: 'PUT',
    body: formData,
  });
}

export async function changePassword(currentPassword, newPassword) {
  return fetchApi('/users/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// Search
export async function searchUsers(query) {
  return fetchApi(`/users/search?q=${encodeURIComponent(query)}`);
}

export async function searchPosts(query) {
  return fetchApi(`/posts/search?q=${encodeURIComponent(query)}`);
}

// Notifications
export async function getNotifications() {
  return fetchApi('/notifications');
}

export async function markNotificationAsRead(id) {
  return fetchApi(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function getUnreadNotificationCount() {
  return fetchApi('/notifications/unread/count');
}

/**
 * 获取推荐用户列表
 */
export async function getRecommendedUsers() {
  return fetchApi('/users/recommended');
}

/**
 * 获取热门话题列表
 */
export async function getTrendingTopics() {
  return fetchApi('/topics/trending');
}

export async function getNewPostCount(since) {
  return fetchApi(`/posts/new/count?since=${encodeURIComponent(since)}`);
}

export async function reportContent(data) {
  return fetchApi('/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function blockUser(userId) {
  return fetchApi(`/users/${userId}/block`, {
    method: 'POST',
  });
}

export async function unblockUser(userId) {
  return fetchApi(`/users/${userId}/unblock`, {
    method: 'POST',
  });
}

// Messages
export async function getConversations() {
  return fetchApi('/messages/conversations');
}

export async function getMessages(userId) {
  return fetchApi(`/messages/${userId}`);
}

export async function sendMessage(userId, content) {
  return fetchApi(`/messages/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function sendImageMessage(userId, image) {
  const formData = new FormData();
  formData.append('image', image);
  return fetchApi(`/messages/${userId}/image`, {
    method: 'POST',
    body: formData,
  });
}

export async function getUnreadMessageCount() {
  return fetchApi('/messages/unread/count');
}

export async function getMentions() {
  return fetchApi('/users/mentions');
}
