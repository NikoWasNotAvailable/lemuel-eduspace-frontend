import api from './api';

export const academicYearService = {
    // Get all academic years
    getAllYears: async () => {
        const response = await api.get('/academic-years/');
        return response.data;
    },

    // Get current academic year
    getCurrentYear: async () => {
        const response = await api.get('/academic-years/current');
        return response.data;
    },

    // Get my academic history (all years)
    getMyHistory: async () => {
        const response = await api.get('/academic-years/me/history');
        return response.data;
    },

    // Get history for specific user and year (admin use)
    getUserHistoryByYear: async (userId, yearId) => {
        const response = await api.get(`/academic-years/users/${userId}/history/${yearId}`);
        return response.data;
    },

    // Admin: Create academic year
    createYear: async (yearData) => {
        const response = await api.post('/academic-years/', yearData);
        return response.data;
    },

    // Admin: Set year as current
    setCurrentYear: async (yearId) => {
        const response = await api.post(`/academic-years/${yearId}/set-current`);
        return response.data;
    },

    // Admin: Snapshot all users
    snapshotUsers: async () => {
        const response = await api.post('/academic-years/snapshot');
        return response.data;
    },

    // Admin: Update academic year
    updateYear: async (yearId, yearData) => {
        const response = await api.put(`/academic-years/${yearId}`, yearData);
        return response.data;
    },

    // Admin: Delete academic year
    deleteYear: async (yearId) => {
        const response = await api.delete(`/academic-years/${yearId}`);
        return response.data;
    }
};
