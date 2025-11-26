import api from './api';

export const enrollmentService = {
    // Enroll student in class
    enrollStudent: async (studentId, classId) => {
        const response = await api.post('/student-classes/', {
            student_id: studentId,
            class_id: classId
        });
        return response.data;
    },

    // Get all enrollments
    getAllEnrollments: async () => {
        const response = await api.get('/student-classes/');
        return response.data;
    },

    // Get student's classes
    getStudentClasses: async (studentId) => {
        const response = await api.get(`/student-classes/student/${studentId}`);
        return response.data;
    },

    // Remove enrollment
    removeEnrollment: async (enrollmentId) => {
        const response = await api.delete(`/student-classes/${enrollmentId}`);
        return response.data;
    }
};