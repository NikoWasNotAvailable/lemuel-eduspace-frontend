import api from './api';

export const sessionAttachmentService = {
    // Upload attachment to a session
    uploadAttachment: async (sessionId, formData) => {
        // Ensure session_id is in formData
        if (formData instanceof FormData && !formData.has('session_id')) {
            formData.append('session_id', sessionId);
        }

        const response = await api.post('/session-attachments/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Get all attachments for a session
    getSessionAttachments: async (sessionId) => {
        const response = await api.get(`/session-attachments/session/${sessionId}`);
        return response.data;
    },

    // Get attachment by ID
    getAttachmentById: async (attachmentId) => {
        const response = await api.get(`/session-attachments/${attachmentId}`);
        return response.data;
    },

    // Download attachment
    downloadAttachment: async (attachmentId) => {
        const response = await api.get(`/session-attachments/${attachmentId}/download`, {
            responseType: 'blob'
        });
        return response;
    },

    // Update attachment metadata
    updateAttachment: async (attachmentId, attachmentData) => {
        const response = await api.put(`/session-attachments/${attachmentId}`, attachmentData);
        return response.data;
    },

    // Delete attachment
    deleteAttachment: async (attachmentId) => {
        const response = await api.delete(`/session-attachments/${attachmentId}`);
        return response.data;
    },

    // Get attachments by uploader
    getAttachmentsByUploader: async (uploaderId, params = {}) => {
        const { skip = 0, limit = 100 } = params;

        const queryParams = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString()
        });

        const response = await api.get(`/session-attachments/user/${uploaderId}?${queryParams}`);
        return response.data;
    },

    // Bulk upload attachments
    bulkUploadAttachments: async (sessionId, formData) => {
        // Ensure session_id is in formData
        if (formData instanceof FormData && !formData.has('session_id')) {
            formData.append('session_id', sessionId);
        }

        const response = await api.post('/session-attachments/bulk-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Get attachment statistics
    getAttachmentStats: async () => {
        const response = await api.get('/session-attachments/stats');
        return response.data;
    }
};