import api from './api';

export const classService = {
    // Create class
    createClass: async (classData) => {
        const response = await api.post('/classes/', classData);
        return response.data;
    },

    // Get all classes with optional region filter
    getAllClasses: async (filters = {}) => {
        const params = new URLSearchParams();

        if (filters.region_id) params.append('region_id', filters.region_id);
        if (filters.skip !== undefined) params.append('skip', filters.skip);
        if (filters.limit !== undefined) params.append('limit', filters.limit);

        const queryString = params.toString();
        const url = queryString ? `/classes/?${queryString}` : '/classes/';
        const response = await api.get(url);
        return response.data;
    },

    // Get classes by region
    getClassesByRegion: async (regionId) => {
        const response = await api.get(`/classes/?region_id=${regionId}`);
        return response.data;
    },

    // Get class by ID
    getClassById: async (classId) => {
        const response = await api.get(`/classes/${classId}`);
        return response.data;
    },

    // Update class
    updateClass: async (classId, classData) => {
        const response = await api.put(`/classes/${classId}`, classData);
        return response.data;
    },

    // Delete class
    deleteClass: async (classId) => {
        const response = await api.delete(`/classes/${classId}`);
        return response.data;
    }
};