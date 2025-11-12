import axios from 'axios';

// Conectar la API con la ruta de http
const API_BASE_URL = 'http://localhost:8080/api';

// Variable de api
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Token de sesión en memoria (no en localStorage)
let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

export const getAuthToken = () => authToken;

export const clearAuthToken = () => {
    authToken = null;
};

// Interceptor para agregar token si existe
api.interceptors.request.use(
    (config) => {
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuthToken();
            window.dispatchEvent(new Event('unauthorized'));
        }
        return Promise.reject(error);
    }
);

// ==================== PRODUCTOS ====================
export const productService = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    getFeatured: () => api.get('/products/featured'),
    create: (product) => api.post('/products', product),
    update: (id, product) => api.put(`/products/${id}`, product),
    delete: (id) => api.delete(`/products/${id}`),
};

// ==================== USUARIOS ====================
export const userService = {
    login: (credentials) => api.post('/users/login', credentials),
    register: (userData) => api.post('/users/register', userData),
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, userData) => api.put(`/users/${id}`, userData),
    delete: (id) => api.delete(`/users/${id}`),
};

// ==================== PEDIDOS ====================
export const orderService = {
    getAll: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
    create: (order) => api.post('/orders', order),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export default api;