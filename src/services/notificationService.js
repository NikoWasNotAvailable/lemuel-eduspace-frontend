import api from './api';

export const notificationService = {
    // ============ Notification CRUD ============

    // Create a single notification
    createNotification: async (notificationData) => {
        const response = await api.post('/notifications/', notificationData);
        return response.data;
    },

    // Upload notification image
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/notifications/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Bulk create notifications
    bulkCreateNotifications: async (notificationsArray) => {
        const response = await api.post('/notifications/bulk', {
            notifications: notificationsArray
        });
        return response.data;
    },

    // Get all notifications with pagination and filters
    getAllNotifications: async (params = {}) => {
        const response = await api.get('/notifications/', { params });
        return response.data;
    },

    // Get latest notifications
    getLatestNotifications: async (limit = 10) => {
        const response = await api.get('/notifications/latest', { params: { limit } });
        return response.data;
    },

    // Get notifications by type
    getNotificationsByType: async (type, limit = 50) => {
        const response = await api.get(`/notifications/by-type/${type}`, { params: { limit } });
        return response.data;
    },

    // Search notifications
    searchNotifications: async (query, limit = 50) => {
        const response = await api.get('/notifications/search', { params: { q: query, limit } });
        return response.data;
    },

    // Get notification statistics
    getNotificationStats: async () => {
        const response = await api.get('/notifications/stats');
        return response.data;
    },

    // Get notification by ID
    getNotificationById: async (notificationId) => {
        const response = await api.get(`/notifications/${notificationId}`);
        return response.data;
    },

    // Update notification
    updateNotification: async (notificationId, updateData) => {
        const response = await api.put(`/notifications/${notificationId}`, updateData);
        return response.data;
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response.data;
    },

    // Delete notifications by type
    deleteNotificationsByType: async (type) => {
        const response = await api.delete(`/notifications/by-type/${type}`);
        return response.data;
    },

    // Cleanup old notifications
    cleanupOldNotifications: async (daysOld = 30) => {
        const response = await api.delete('/notifications/cleanup/old', { params: { days_old: daysOld } });
        return response.data;
    },

    // ============ User Notification Assignment ============

    // Assign notification to specific users
    assignToUsers: async (notificationId, userIds) => {
        const response = await api.post('/user-notifications/assign', {
            notification_id: notificationId,
            user_ids: userIds
        });
        return response.data;
    },

    // Bulk assign notifications to users
    bulkAssignNotifications: async (assignments) => {
        const response = await api.post('/user-notifications/bulk-assign', {
            assignments: assignments
        });
        return response.data;
    },

    // Assign notification by role
    assignByRole: async (notificationId, roles) => {
        const response = await api.post('/user-notifications/assign-by-role', {
            notification_id: notificationId,
            roles: roles
        });
        return response.data;
    },

    // Assign notification by region
    assignByRegion: async (notificationId, regionId) => {
        const response = await api.post(`/user-notifications/assign-by-region/${regionId}`, null, {
            params: { notification_id: notificationId }
        });
        return response.data;
    },

    // Assign notification by class
    assignByClass: async (notificationId, classId) => {
        const response = await api.post(`/user-notifications/assign-by-class/${classId}`, null, {
            params: { notification_id: notificationId }
        });
        return response.data;
    },

    // ============ User Notification Retrieval ============

    // Get current user's notifications
    // parentAccess: boolean - indicates if request is from parent viewing student's notifications
    getMyNotifications: async (params = {}, parentAccess = false) => {
        const response = await api.get('/user-notifications/my-notifications', { 
            params: { ...params, parent_access: parentAccess } 
        });
        return response.data;
    },

    // Get notifications for a specific user
    getUserNotifications: async (userId, params = {}) => {
        const response = await api.get(`/user-notifications/user/${userId}`, { params });
        return response.data;
    },

    // Get recipients of a notification
    getNotificationRecipients: async (notificationId, readStatus = null) => {
        const params = readStatus !== null ? { read_status: readStatus } : {};
        const response = await api.get(`/user-notifications/notification/${notificationId}/recipients`, { params });
        return response.data;
    },

    // ============ Mark as Read ============

    // Mark specific notifications as read
    markNotificationsAsRead: async (notificationIds) => {
        const response = await api.post('/user-notifications/mark-read', {
            notification_ids: notificationIds
        });
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.post('/user-notifications/mark-all-read');
        return response.data;
    },

    // ============ User Notification Stats ============

    // Get current user's notification stats
    getMyNotificationStats: async () => {
        const response = await api.get('/user-notifications/my-stats');
        return response.data;
    },

    // Get notification stats for a specific user
    getUserNotificationStats: async (userId) => {
        const response = await api.get(`/user-notifications/user/${userId}/stats`);
        return response.data;
    },

    // ============ Remove/Delete User Notifications ============

    // Remove notification from current user
    removeNotification: async (notificationId) => {
        const response = await api.delete(`/user-notifications/remove/${notificationId}`);
        return response.data;
    },

    // Remove notification from specific user (admin only)
    removeNotificationFromUser: async (userId, notificationId) => {
        const response = await api.delete(`/user-notifications/user/${userId}/notification/${notificationId}`);
        return response.data;
    },

    // Remove all notifications from a user (admin only)
    removeAllNotificationsFromUser: async (userId) => {
        const response = await api.delete(`/user-notifications/user/${userId}/all`);
        return response.data;
    }
};