import api from './api';
import { studentService } from './studentService';
import { teacherService } from './teacherService';

export const userService = {
    // Get all users (admin only) with optional region filter
    getAllUsers: async (page = 1, limit = 10, filters = {}) => {
        const params = new URLSearchParams();
        params.append('skip', (page - 1) * limit);
        params.append('limit', limit);

        if (filters.region_id) params.append('region_id', filters.region_id);
        if (filters.role) params.append('role', filters.role);
        if (filters.grade) params.append('grade', filters.grade);
        if (filters.gender) params.append('gender', filters.gender);
        if (filters.search) params.append('search', filters.search);

        const response = await api.get(`/users/?${params.toString()}`);
        return response.data;
    },

    // Get students with filters (admin only) - delegated to studentService
    getStudents: studentService.getStudents,

    // Get teachers with filters (admin only) - delegated to teacherService
    getTeachers: teacherService.getTeachers,

    // Get user by ID (admin only)
    getUserById: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },

    // Update user (admin only)
    updateUser: async (userId, userData) => {
        const response = await api.put(`/users/${userId}`, userData);
        return response.data;
    },

    // Delete user (admin only)
    deleteUser: async (userId) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },

    // Upload profile picture
    uploadProfilePicture: async (file, userId = null) => {
        const formData = new FormData();
        formData.append('file', file);

        const url = userId ? `/users/${userId}/profile-picture` : '/users/profile-picture';
        const response = await api.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete profile picture
    deleteProfilePicture: async () => {
        const response = await api.delete('/users/profile-picture');
        return response.data;
    }
};