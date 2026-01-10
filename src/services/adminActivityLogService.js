import api from './api';

export const adminActivityLogService = {
    // Get activity logs with filters
    getActivityLogs: async (params = {}) => {
        const response = await api.get('/admin-activity-logs/', { params });
        return response.data;
    },

    // Get a specific activity log entry
    getActivityLogById: async (logId) => {
        const response = await api.get(`/admin-activity-logs/${logId}`);
        return response.data;
    }
};
