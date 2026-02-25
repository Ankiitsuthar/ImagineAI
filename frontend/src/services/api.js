import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Normalize VITE_API_URL so it always ends with /api to avoid "Route not found" when env var
// is set to something like "http://localhost:5000" (without /api).
const RAW_API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const base = RAW_API.replace(/\/$/, '');
const API_URL = base.endsWith('/api') ? base : `${base}/api`;

// const api = axios.create({
//     baseURL: API_URL,
//     headers: {
//         'Content-Type': 'application/json'
//     }
// });

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true  // FIXED (THIS IS THE MISSING PART)
});


// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        // Don't auto-handle auth errors if we're on the auth success page (handling token login)
        const isAuthSuccessPage = window.location.pathname.startsWith('/auth/success');

        if (status === 401 && !isAuthSuccessPage) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        if (status === 403 && !isAuthSuccessPage) {
            const message = error.response?.data?.message;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (message === 'Account is disabled') {
                window.location.href = '/?account_disabled=true';
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    // Legacy support or if we add it back
    // register: (data) => api.post('/auth/register', data),
    // login: (data) => api.post('/auth/login', data),
    adminLogin: (data) => api.post('/auth/admin/login', data) // Kept for admin
};

// Template API
export const templateAPI = {
    getAll: () => api.get('/templates'),
    getById: (id) => api.get(`/templates/${id}`),
    getCollections: () => api.get('/templates/collections'),
    getByCollection: (collectionId) => api.get(`/templates/by-collection/${collectionId}`),
    create: (formData) => api.post('/templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/templates/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/templates/${id}`)
};

// Generation API (Refactored to Image API)
export const generationAPI = {
    generate: (formData) => api.post('/images/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getHistory: (page = 1, limit = 20) => api.get(`/images/history`), // Backend doesn't support pagination yet in strict controller, but strict controller returns all.
    // getStatus: (id) => api.get(`/generations/${id}`), // Removed
    // download handled statically
};

// User API
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    getAllUsers: (page = 1, limit = 20, search = '') =>
        api.get(`/users?page=${page}&limit=${limit}&search=${search}`),
    getUserById: (id) => api.get(`/users/${id}`),
    updateCredits: (id, credits) => api.put(`/users/${id}/credits`, { credits }),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    toggleStatus: (id) => api.put(`/users/${id}/toggle-status`)
};

// Order API
export const orderAPI = {
    getPackages: () => api.get('/orders/packages'),
    createOrder: (packageType) => api.post('/orders/create', { packageType }),
    getUserOrders: (page = 1, limit = 20) => api.get(`/orders?page=${page}&limit=${limit}`),
    createTransaction: (data) => api.post('/transactions', data),
    getTransactions: () => api.get('/transactions'),
    getAllOrders: (page = 1, limit = 20, status = '') =>
        api.get(`/orders/all?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`)
};

// Stats API (Admin)
export const statsAPI = {
    getDashboard: () => api.get('/stats/dashboard'),
    getRevenueAnalytics: () => api.get('/stats/revenue')
};

// Collection API (Admin)
export const collectionAPI = {
    getAll: () => api.get('/collections'),
    create: (data) => api.post('/collections', data),
    update: (id, data) => api.put(`/collections/${id}`, data),
    delete: (id) => api.delete(`/collections/${id}`)
};

export default api;
