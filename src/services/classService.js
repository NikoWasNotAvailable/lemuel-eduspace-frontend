import api from './api';

export const classService = {
    // Create class (admin only)
    createClass: async (classData) => {
        const response = await api.post('/classes/', classData);
        return response.data;
    },

    // Get all classes with pagination
    getAllClasses: async (skip = 0, limit = 100, isActive = null) => {
        const params = new URLSearchParams();
        params.append('skip', skip);
        params.append('limit', limit);
        if (isActive !== null) {
            params.append('is_active', isActive);
        }

        const response = await api.get(`/classes/?${params.toString()}`);
        return response.data;
    },

    // Search classes by name
    searchClasses: async (searchTerm, isActive = null) => {
        const params = new URLSearchParams();
        params.append('q', searchTerm);
        if (isActive !== null) {
            params.append('is_active', isActive);
        }

        const response = await api.get(`/classes/search?${params.toString()}`);
        return response.data;
    },

    // Get classes by region
    getClassesByRegion: async (regionId, skip = 0, limit = 100, isActive = null) => {
        const params = new URLSearchParams();
        params.append('skip', skip);
        params.append('limit', limit);
        if (isActive !== null) {
            params.append('is_active', isActive);
        }

        const response = await api.get(`/classes/by-region/${regionId}?${params.toString()}`);
        return response.data;
    },

    // Get class by ID
    getClassById: async (classId) => {
        const response = await api.get(`/classes/${classId}`);
        return response.data;
    },

    // Update class (teacher or admin only)
    updateClass: async (classId, classData) => {
        const response = await api.put(`/classes/${classId}`, classData);
        return response.data;
    },

    // Delete class (admin only)
    deleteClass: async (classId) => {
        const response = await api.delete(`/classes/${classId}`);
        return response.data;
    }
};