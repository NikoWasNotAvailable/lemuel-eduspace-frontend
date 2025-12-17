import api from './api';

export const assignmentService = {
    // Submit an assignment (Student only)
    submitAssignment: async (sessionId, file) => {
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('file', file);

        const response = await api.post('/assignments/submit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get all submissions for a session (Teacher/Admin only)
    getSessionSubmissions: async (sessionId) => {
        const response = await api.get(`/assignments/session/${sessionId}`);
        return response.data;
    },

    // Get my submissions (Student)
    getMySubmissions: async () => {
        const response = await api.get('/assignments/my-submissions');
        return response.data;
    },

    // Grade a submission (Teacher/Admin only)
    gradeSubmission: async (submissionId, gradeData) => {
        const response = await api.put(`/assignments/${submissionId}/grade`, gradeData);
        return response.data;
    }
};
