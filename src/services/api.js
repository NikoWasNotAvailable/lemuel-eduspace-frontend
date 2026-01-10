import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1', // Adjust this to match your backend URL
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token and admin name
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add admin name header for user modification operations
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.role === 'admin' && user.name) {
                    config.headers['X-Admin-Name'] = user.name;
                }
            } catch (e) {
                // Ignore JSON parse errors
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Check if this is a login request - don't redirect on 401 for login attempts
        const isLoginRequest = error.config?.url?.includes('/login');
        
        if (error.response?.status === 401 && !isLoginRequest) {
            // Token expired or invalid (but not a failed login attempt)
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;