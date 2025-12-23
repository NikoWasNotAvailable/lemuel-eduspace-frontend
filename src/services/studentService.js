import api from './api';

export const studentService = {
    // Get students with filters
    getStudents: async (filters = {}) => {
        const params = new URLSearchParams();
        params.append('role', 'student');

        if (filters.skip !== undefined) params.append('skip', filters.skip);
        if (filters.limit !== undefined) params.append('limit', filters.limit);
        if (filters.grade) params.append('grade', filters.grade);
        if (filters.gender) params.append('gender', filters.gender);
        if (filters.region_id) params.append('region_id', filters.region_id);
        if (filters.class_id) params.append('class_id', filters.class_id);
        if (filters.search) params.append('search', filters.search);

        const response = await api.get(`/users/?${params.toString()}`);
        return response.data;
    },

    // Register a new student
    registerStudent: async (studentData) => {
        const response = await api.post('/users/register/student', studentData);
        return response.data;
    },

    // Get student by ID
    getStudentById: async (studentId) => {
        const response = await api.get(`/users/${studentId}`);
        return response.data;
    },

    // Update student
    updateStudent: async (studentId, studentData) => {
        const response = await api.put(`/users/${studentId}`, studentData);
        return response.data;
    },

    // Delete student
    deleteStudent: async (studentId) => {
        const response = await api.delete(`/users/${studentId}`);
        return response.data;
    },

    // Get student's classes
    getStudentClasses: async (studentId) => {
        const response = await api.get(`/student-classes/student/${studentId}`);
        return response.data;
    },

    // Upload student profile picture
    uploadProfilePicture: async (file, studentId) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/users/${studentId}/profile-picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};