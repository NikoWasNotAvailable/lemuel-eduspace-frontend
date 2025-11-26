import api from './api';

export const teacherSubjectService = {
    // Assign teacher to subject
    assignTeacher: async (teacherId, subjectId) => {
        const response = await api.post('/teacher-subjects/', {
            teacher_id: teacherId,
            subject_id: subjectId
        });
        return response.data;
    },

    // Get all assignments
    getAllAssignments: async () => {
        const response = await api.get('/teacher-subjects/');
        return response.data;
    },

    // Get teacher's subjects
    getTeacherSubjects: async (teacherId) => {
        const response = await api.get(`/teacher-subjects/teacher/${teacherId}`);
        return response.data;
    },

    // Remove assignment
    removeAssignment: async (assignmentId) => {
        const response = await api.delete(`/teacher-subjects/${assignmentId}`);
        return response.data;
    }
};