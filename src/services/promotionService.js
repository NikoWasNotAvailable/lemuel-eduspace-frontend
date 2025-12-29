import api from './api';

export const promotionService = {
    // Preview promotion
    previewPromotion: async (excludeStudentIds = []) => {
        const response = await api.post('/promotions/preview', { exclude_student_ids: excludeStudentIds });
        return response.data;
    },

    // Confirm promotion
    confirmPromotion: async (data) => {
        const response = await api.post('/promotions/confirm', data);
        return response.data;
    },

    // Undo promotion
    undoPromotion: async (historyId) => {
        const response = await api.post(`/promotions/${historyId}/undo`);
        return response.data;
    },

    // Get promotion history (optional, but good for checking if undo is possible)
    getPromotionHistory: async () => {
        const response = await api.get('/promotions/history');
        return response.data;
    }
};
