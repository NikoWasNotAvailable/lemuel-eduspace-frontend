import api from './api';

export const subjectService = {
    // Create subject
    createSubject: async (subjectData) => {
        const response = await api.post('/subjects/', subjectData);
        return response.data;
    },

    // Get all subjects
    getAllSubjects: async () => {
        const response = await api.get('/subjects/');
        return response.data;
    },

    // Get subject by ID
    getSubjectById: async (subjectId) => {
        const response = await api.get(`/subjects/${subjectId}`);
        return response.data;
    },

    // Update subject
    updateSubject: async (subjectId, subjectData) => {
        const response = await api.put(`/subjects/${subjectId}`, subjectData);
        return response.data;
    },

    // Delete subject
    deleteSubject: async (subjectId) => {
        const response = await api.delete(`/subjects/${subjectId}`);
        return response.data;
    }
};