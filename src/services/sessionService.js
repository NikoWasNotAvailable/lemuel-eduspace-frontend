import api from './api';

export const sessionService = {
    // Create session
    createSession: async (sessionData) => {
        const response = await api.post('/sessions/', sessionData);
        return response.data;
    },

    // Get all sessions with filters
    getAllSessions: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await api.get(`/sessions/?${params}`);
        return response.data;
    },

    // Get upcoming sessions
    getUpcomingSessions: async () => {
        const response = await api.get('/sessions/upcoming');
        return response.data;
    },

    // Get session statistics
    getSessionStats: async () => {
        const response = await api.get('/sessions/stats');
        return response.data;
    },

    // Get sessions by subject
    getSessionsBySubject: async (subjectId) => {
        const response = await api.get(`/sessions/subject/${subjectId}`);
        return response.data;
    },

    // Get session by ID
    getSessionById: async (sessionId) => {
        const response = await api.get(`/sessions/${sessionId}`);
        return response.data;
    },

    // Update session
    updateSession: async (sessionId, sessionData) => {
        const response = await api.put(`/sessions/${sessionId}`, sessionData);
        return response.data;
    },

    // Delete session
    deleteSession: async (sessionId) => {
        const response = await api.delete(`/sessions/${sessionId}`);
        return response.data;
    }
};