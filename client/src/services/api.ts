import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关
export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  getMe: () => api.get('/auth/me'),
}

// 帖子相关
export const posts = {
  getAll: (page = 1, limit = 10) =>
    api.get(`/posts?page=${page}&limit=${limit}`),
  getOne: (id: string) => api.get(`/posts/${id}`),
  create: (content: string, images?: File[]) => {
    const formData = new FormData()
    formData.append('content', content)
    if (images) {
      images.forEach((image) => formData.append('images', image))
    }
    return api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  like: (id: string) => api.post(`/posts/${id}/like`),
  comment: (id: string, content: string, parent?: string) =>
    api.post(`/posts/${id}/comments`, { content, parent }),
  delete: (id: string) => api.delete(`/posts/${id}`),
}

// 用户相关
export const users = {
  getOne: (id: string) => api.get(`/users/${id}`),
  getPosts: (id: string, page = 1, limit = 10) =>
    api.get(`/users/${id}/posts?page=${page}&limit=${limit}`),
  update: (id: string, data: any) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value as string)
      }
    })
    return api.put(`/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// 管理员相关
export const admin = {
  getAllUsers: (page = 1, limit = 10) =>
    api.get(`/users?page=${page}&limit=${limit}`),
  updateUserRole: (id: string, role: string) =>
    api.put(`/users/${id}/role`, { role }),
}

export default api 