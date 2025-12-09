import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Standard MERN backend port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor for JWT token (if auth is involved later)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// API Service Methods
// API Service Methods
export const propertyService = {
    getAll: () => api.get('/properties'),
    getById: (id) => api.get(`/properties/${id}`),
    create: (data) => api.post('/properties', data),
    update: (id, data) => api.put(`/properties/${id}`, data),
    delete: (id) => api.delete(`/properties/${id}`),
};

export const wishlistService = {
    getAll: () => api.get('/wishlist'),
    add: (propertyId) => api.post('/wishlist', { propertyId }),
    remove: (propertyId) => api.delete(`/wishlist/${propertyId}`),
};

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => {
        localStorage.removeItem('token');
    },
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

export default api;
