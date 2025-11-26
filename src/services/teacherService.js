import api from './api';

export const teacherService = {
    // Get teachers with filters
    getTeachers: async (filters = {}) => {
        const params = new URLSearchParams();
        params.append('role', 'teacher');

        if (filters.skip !== undefined) params.append('skip', filters.skip);
        if (filters.limit !== undefined) params.append('limit', filters.limit);
        if (filters.search) params.append('search', filters.search);
        if (filters.gender) params.append('gender', filters.gender);
        if (filters.region_id) params.append('region_id', filters.region_id);

        const response = await api.get(`/users/?${params.toString()}`);
        return response.data;
    },

    // Register a new teacher
    registerTeacher: async (teacherData) => {
        const response = await api.post('/users/register/teacher', teacherData);
        return response.data;
    },

    // Get teacher by ID
    getTeacherById: async (teacherId) => {
        const response = await api.get(`/users/${teacherId}`);
        return response.data;
    },

    // Update teacher
    updateTeacher: async (teacherId, teacherData) => {
        const response = await api.put(`/users/${teacherId}`, teacherData);
        return response.data;
    },

    // Delete teacher
    deleteTeacher: async (teacherId) => {
        const response = await api.delete(`/users/${teacherId}`);
        return response.data;
    },

    // Get teacher's classes
    getTeacherClasses: async (teacherId) => {
        const response = await api.get(`/teacher-classes/teacher/${teacherId}`);
        return response.data;
    },

    // Upload teacher profile picture
    uploadProfilePicture: async (file, teacherId) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/users/${teacherId}/profile-picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};