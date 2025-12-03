// frontend/src/services/api.js

import axios from 'axios';

// ============================================
// AXIOS INSTANCE CONFIGURATION
// ============================================
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR - Aggiungi token JWT
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('valiryart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - Gestione errori globale
// ============================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token scaduto o non valido
      localStorage.removeItem('valiryart_token');
      localStorage.removeItem('valiryart_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  
  // ✅ CORREZIONE: Endpoint corretto con /auth/google
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

// ============================================
// REQUESTS API (Richieste Lavori)
// ============================================
export const requestsAPI = {
  create: (data) => api.post('/requests', data),
  getMyRequests: () => api.get('/requests/my-requests'),
  getById: (id) => api.get(`/requests/${id}`),
  getAll: (filters) => api.get('/requests', { params: filters }),
  updateStatus: (id, data) => api.put(`/requests/${id}/status`, data),
  delete: (id) => api.delete(`/requests/${id}`),
  uploadAttachment: (id, formData) => api.post(`/requests/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ============================================
// MESSAGES API (Chat Richieste)
// ============================================
export const messagesAPI = {
  getMessages: (requestId) => api.get(`/messages/${requestId}`),
  sendMessage: (requestId, data) => api.post(`/messages/${requestId}`, data),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  getUnreadCount: () => api.get('/messages/unread/count'),
};

// ============================================
// PORTFOLIO API
// ============================================
export const portfolioAPI = {
  getAll: (filters) => api.get('/portfolio', { params: filters }),
  getById: (id) => api.get(`/portfolio/${id}`),
  create: (formData) => api.post('/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/portfolio/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/portfolio/${id}`),
  getStats: () => api.get('/portfolio/stats'),
};

// ============================================
// DESIGNS GALLERY API
// ============================================
export const designsAPI = {
  getAll: (filters) => api.get('/designs', { params: filters }),
  getById: (id) => api.get(`/designs/${id}`),
  incrementUsage: (id) => api.post(`/designs/${id}/use`),
  getCategories: () => api.get('/designs/categories'),
  create: (formData) => api.post('/designs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/designs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/designs/${id}`),
};

// ============================================
// CONTENT API
// ============================================
export const contentAPI = {
  getAllPages: () => api.get('/content/pages'),
  getPageBySlug: (slug) => api.get(`/content/pages/${slug}`),
  getPublicSettings: () => api.get('/content/settings/public'),
  createPage: (data) => api.post('/content/pages', data),
  updatePage: (slug, data) => api.put(`/content/pages/${slug}`, data),
  deletePage: (slug) => api.delete(`/content/pages/${slug}`),
  getAllSettings: () => api.get('/content/settings'),
  updateSetting: (key, value) => api.put(`/content/settings/${key}`, { valore: value }),
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getRecentActivity: (limit) => api.get('/admin/activity', { params: { limit } }),
  getRevenueChart: (months) => api.get('/admin/revenue-chart', { params: { months } }),
  getTopCustomers: (limit) => api.get('/admin/top-customers', { params: { limit } }),
  exportRequests: (filters) => api.get('/admin/export-requests', { 
    params: filters,
    responseType: 'blob' 
  }),
  getAllUsers: (filters) => api.get('/admin/users', { params: filters }),
  updateUserStatus: (userId, attivo) => api.put(`/admin/users/${userId}/status`, { attivo }),
};

// ============================================
// HEALTH CHECK
// ============================================
export const healthCheck = () => axios.get('http://localhost:8081/health');

export default api;