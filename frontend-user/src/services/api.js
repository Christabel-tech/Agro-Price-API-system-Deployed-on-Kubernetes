import axios from 'axios';

// Use the correct backend URL
const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to false for local development
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const logout = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');
export const getUserPermissions = () => api.get('/auth/me/permissions');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// Admin endpoints
export const getAllUsers = () => api.get('/auth/users');
export const getUserById = (userId) => api.get(`/auth/users/${userId}`);
export const createUser = (userData) => api.post('/auth/users', userData);
export const updateUserRole = (userId, roleId) => api.put(`/auth/users/${userId}/role?role_id=${roleId}`);
export const deactivateUser = (userId) => api.put(`/auth/users/${userId}/deactivate`);
export const activateUser = (userId) => api.put(`/auth/users/${userId}/activate`);
export const deleteUser = (userId) => api.delete(`/auth/users/${userId}`);

export default api;