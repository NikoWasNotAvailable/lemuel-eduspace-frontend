import api from './api';

export const notificationService = {
    // Create notification
    createNotification: async (notificationData) => {
        const response = await api.post('/notifications/', notificationData);
        return response.data;
    },

    // Get all notifications
    getAllNotifications: async () => {
        const response = await api.get('/notifications/');
        return response.data;
    },

    // Get user's notifications
    getUserNotifications: async () => {
        const response = await api.get('/user-notifications/my-notifications');
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        const response = await api.post(`/user-notifications/${notificationId}/read`);
        return response.data;
    },

    // Assign notification to users
    assignToUsers: async (notificationId, userIds) => {
        const response = await api.post('/user-notifications/assign', {
            notification_id: notificationId,
            user_ids: userIds
        });
        return response.data;
    },

    // Assign notification by role
    assignByRole: async (notificationId, role) => {
        const response = await api.post('/user-notifications/assign-by-role', {
            notification_id: notificationId,
            role: role
        });
        return response.data;
    }
};