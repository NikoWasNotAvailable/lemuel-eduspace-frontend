import api from './api';

export const subjectService = {
    // Create subject (teacher or admin only)
    createSubject: async (subjectData) => {
        const response = await api.post('/subjects/', subjectData);
        return response.data;
    },

    // Get all subjects with optional filters and pagination
    getAllSubjects: async (params = {}) => {
        const {
            skip = 0,
            limit = 100,
            class_id,
            ...otherParams
        } = params;

        const queryParams = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
            ...otherParams
        });

        // Only add class_id if it has a value
        if (class_id !== undefined && class_id !== null) {
            queryParams.append('class_id', class_id.toString());
        }

        const response = await api.get(`/subjects/?${queryParams}`);
        return response.data;
    },

    // Search subjects by name with optional class filter
    searchSubjects: async (searchTerm, params = {}) => {
        const { class_id } = params;
        
        const queryParams = new URLSearchParams({
            q: searchTerm
        });

        if (class_id !== undefined && class_id !== null) {
            queryParams.append('class_id', class_id.toString());
        }

        const response = await api.get(`/subjects/search?${queryParams}`);
        return response.data;
    },

    // Get all subjects for a specific class
    getSubjectsByClass: async (classId) => {
        const response = await api.get(`/subjects/class/${classId}`);
        return response.data;
    },

    // Get subject by ID
    getSubjectById: async (subjectId) => {
        const response = await api.get(`/subjects/${subjectId}`);
        return response.data;
    },

    // Update subject (teacher or admin only)
    updateSubject: async (subjectId, subjectData) => {
        const response = await api.put(`/subjects/${subjectId}`, subjectData);
        return response.data;
    },

    // Delete subject (admin only)
    deleteSubject: async (subjectId) => {
        const response = await api.delete(`/subjects/${subjectId}`);
        return response.data;
    }
};