import api from './api';

export const authService = {
    // Student authentication
    studentLogin: async (identifier, password) => {
        const response = await api.post('/users/login/student', { identifier, password });
        return response.data;
    },

    // Parent authentication
    parentLogin: async (identifier, password) => {
        const response = await api.post('/users/login/parent', { identifier, password });
        return response.data;
    },

    // Teacher authentication
    teacherLogin: async (identifier, password) => {
        const response = await api.post('/users/login/teacher', { identifier, password });
        return response.data;
    },

    // Admin authentication
    adminLogin: async (email, name, password) => {
        const response = await api.post('/admin-auth/login/admin', {
            email: email,
            name: name,
            password: password
        });
        return response.data;
    },

    // Legacy login method (for backward compatibility)
    login: async (email, password) => {
        const response = await api.post('/users/login', { identifier: email, password });
        return response.data;
    },

    // Register new user
    register: async (userData) => {
        const response = await api.post('/users/register', userData);
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    // Update current user
    updateProfile: async (userData) => {
        const response = await api.put('/users/me', userData);
        return response.data;
    },

    // Change password
    changePassword: async (passwordData) => {
        const response = await api.post('/users/me/change-password', passwordData);
        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get admin login logs (admin only)
    getAdminLoginLogs: async (params = {}) => {
        const response = await api.get('/admin-auth/logs', { params });
        return response.data;
    }
};