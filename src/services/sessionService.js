import api from './api';

export const sessionService = {
    // Create session
    createSession: async (sessionData) => {
        const response = await api.post('/sessions/', sessionData);
        return response.data;
    },

    // Get all sessions with filters and pagination
    getAllSessions: async (params = {}) => {
        const {
            skip = 0,
            limit = 100,
            subject_id,
            class_id,
            date_from,
            date_to,
            ...otherParams
        } = params;

        const queryParams = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
            ...otherParams
        });

        // Only add optional parameters if they have values
        if (subject_id !== undefined && subject_id !== null) {
            queryParams.append('subject_id', subject_id.toString());
        }
        if (class_id !== undefined && class_id !== null) {
            queryParams.append('class_id', class_id.toString());
        }
        if (date_from) {
            queryParams.append('date_from', date_from);
        }
        if (date_to) {
            queryParams.append('date_to', date_to);
        }

        const response = await api.get(`/sessions/?${queryParams}`);
        return response.data;
    },

    // Get upcoming sessions with optional filters
    getUpcomingSessions: async (params = {}) => {
        const { limit = 10, subject_id } = params;

        const queryParams = new URLSearchParams({
            limit: limit.toString()
        });

        if (subject_id !== undefined && subject_id !== null) {
            queryParams.append('subject_id', subject_id.toString());
        }

        const response = await api.get(`/sessions/upcoming?${queryParams}`);
        return response.data;
    },

    // Get session statistics
    getSessionStats: async () => {
        const response = await api.get('/sessions/stats');
        return response.data;
    },

    // Get sessions by subject with pagination
    getSessionsBySubject: async (subjectId, params = {}) => {
        const { skip = 0, limit = 100 } = params;

        const queryParams = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString()
        });

        const response = await api.get(`/sessions/subject/${subjectId}?${queryParams}`);
        return response.data;
    },

    // Get next session number for a subject
    getNextSessionNumber: async (subjectId) => {
        const response = await api.get(`/sessions/subject/${subjectId}/next-number`);
        return response.data;
    },

    // Get session by ID
    getSessionById: async (sessionId) => {
        const response = await api.get(`/sessions/${sessionId}`);
        return response.data;
    },

    // Get session attachments separately
    getSessionAttachments: async (sessionId) => {
        const response = await api.get(`/sessions/${sessionId}/attachments`);
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
    },

    // Bulk create sessions for a subject (useful for creating multiple sessions at once)
    // Note: This endpoint is not present in the provided backend router, but keeping it commented out for reference or future implementation
    /*
    bulkCreateSessions: async (subjectId, sessionsData) => {
        const response = await api.post(`/sessions/bulk`, {
            subject_id: subjectId,
            sessions: sessionsData
        });
        return response.data;
    },
    */

    // Get sessions by date range
    getSessionsByDateRange: async (dateFrom, dateTo, params = {}) => {
        const { skip = 0, limit = 100, subject_id } = params;

        const queryParams = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
            date_from: dateFrom,
            date_to: dateTo
        });

        if (subject_id !== undefined && subject_id !== null) {
            queryParams.append('subject_id', subject_id.toString());
        }

        // Updated to use the main sessions endpoint which supports date filtering
        const response = await api.get(`/sessions/?${queryParams}`);
        return response.data;
    },

    // Get sessions for today
    getTodaySessions: async (params = {}) => {
        const { subject_id } = params;
        const today = new Date().toISOString().split('T')[0];

        const queryParams = new URLSearchParams({
            date_from: today,
            date_to: today
        });

        if (subject_id !== undefined && subject_id !== null) {
            queryParams.append('subject_id', subject_id.toString());
        }

        // Updated to use the main sessions endpoint
        const response = await api.get(`/sessions/?${queryParams}`);
        return response.data;
    },

    // Duplicate session (create a new session based on existing one)
    // Note: This endpoint is not present in the provided backend router
    /*
    duplicateSession: async (sessionId, newSessionData = {}) => {
        const response = await api.post(`/sessions/${sessionId}/duplicate`, newSessionData);
        return response.data;
    }
    */
};