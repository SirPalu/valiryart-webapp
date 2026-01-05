// frontend/src/services/api.js - COMPLETO CON REVIEWS

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

// ✅ DEBUG MODE - disabilita in produzione
const DEBUG_MODE = process.env.NODE_ENV === 'development' && false; // Cambia a true solo per debug

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('valiryart_token');
    
    // ✅ Log solo se DEBUG attivo
    if (DEBUG_MODE) {
      console.log('🔑 Token:', token ? 'EXISTS' : 'MISSING');
      console.log('📍 URL:', config.url);
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Non sovrascrivere Content-Type per FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Log solo errori critici
    if (error.response?.status === 401) {
      console.warn('🚨 401 Unauthorized - Clearing auth');
      localStorage.removeItem('valiryart_token');
      localStorage.removeItem('valiryart_user');
      window.location.href = '/login';
    } else if (DEBUG_MODE) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message
      });
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
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/password', data),
  deleteAccount: (data) => api.delete('/auth/account', { data })
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
  updateUserStatus: (userId, data) => api.put(`/admin/users/${userId}/status`, data),
  getRequestById: (id) => api.get(`/admin/requests/${id}`),
  getRequestMessages: (requestId) => api.get(`/admin/requests/${requestId}/messages`),
  sendMessage: (requestId, data) => api.post(`/admin/requests/${requestId}/messages`, data),
  updateRequestStatus: (id, data) => api.put(`/admin/requests/${id}/status`, data),
  // ✅ NUOVI ENDPOINT STATI
  sendPreventivo: (id, data) => api.post(`/admin/requests/${id}/send-preventivo`, data),
  confermaPagamento: (id) => api.post(`/admin/requests/${id}/conferma-pagamento`),
  avviaRealizzazione: (id, data) => api.post(`/admin/requests/${id}/avvia-realizzazione`, data),
  completaRichiesta: (id) => api.post(`/admin/requests/${id}/completa`),
};

// ============================================
// REQUESTS API
// ============================================
export const requestsAPI = {
  create: (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/requests', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  getMyRequests: () => api.get('/requests/my-requests'),
  getById: (id) => api.get(`/requests/${id}`),
  getAll: (filters) => api.get('/requests', { params: filters }),
  updateStatus: (id, data) => api.put(`/requests/${id}/status`, data),
  delete: (id) => api.delete(`/requests/${id}`),

  uploadAttachment: (id, formData) =>
    api.post(`/requests/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ============================================
// MESSAGES API
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
// ✨ REVIEWS API ✨
// ============================================
export const reviewsAPI = {
  // Public
  getPublic: (filters) => api.get('/reviews/public', { params: filters }),
  
  // User
  getMyReviews: () => api.get('/reviews/my'),
  canReview: (requestId) => api.get(`/reviews/can-review/${requestId}`),
  create: (formData) => api.post('/reviews', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  
  // Admin
  getAll: (filters) => api.get('/reviews', { params: filters }),
  reply: (id, data) => api.post(`/reviews/${id}/reply`, data),
  approve: (id, approvata) => api.put(`/reviews/${id}/approve`, { approvata }),
  togglePublish: (id, pubblicata) => api.put(`/reviews/${id}/publish`, { pubblicata }),
};

export default api;