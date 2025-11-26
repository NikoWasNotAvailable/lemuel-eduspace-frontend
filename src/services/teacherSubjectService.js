import api from './api';

export const teacherSubjectService = {
    // Assign a teacher to a subject (admin only)
    assignTeacherToSubject: async (assignmentData) => {
        const response = await api.post('/teacher-subjects/assign', assignmentData);
        return response.data;
    },

    // Assign a teacher to multiple subjects (admin only)
    bulkAssignTeacherToSubjects: async (assignmentData) => {
        const response = await api.post('/teacher-subjects/bulk-assign', assignmentData);
        return response.data;
    },

    // Get teacher-subject assignments with optional filters and pagination
    getTeacherSubjectAssignments: async (params = {}) => {
        const {
            skip = 0,
            limit = 100,
            teacher_id,
            subject_id,
            ...otherParams
        } = params;

        const queryParams = new URLSearchParams({
            skip: skip.toString(),
            limit: limit.toString(),
            ...otherParams
        });

        // Only add optional parameters if they have values
        if (teacher_id !== undefined && teacher_id !== null) {
            queryParams.append('teacher_id', teacher_id.toString());
        }
        if (subject_id !== undefined && subject_id !== null) {
            queryParams.append('subject_id', subject_id.toString());
        }

        const response = await api.get(`/teacher-subjects/?${queryParams}`);
        return response.data;
    },

    // Get all subjects assigned to a specific teacher
    getTeacherSubjects: async (teacherId) => {
        const response = await api.get(`/teacher-subjects/teacher/${teacherId}`);
        return response.data;
    },

    // Get all teachers assigned to a specific subject
    getSubjectTeachers: async (subjectId) => {
        const response = await api.get(`/teacher-subjects/subject/${subjectId}`);
        return response.data;
    },

    // Get all available teachers
    getAvailableTeachers: async () => {
        const response = await api.get('/teacher-subjects/teachers');
        return response.data;
    },

    // Remove teacher assignment from a subject (admin only)
    unassignTeacherFromSubject: async (teacherId, subjectId) => {
        const response = await api.delete(`/teacher-subjects/unassign/${teacherId}/${subjectId}`);
        return response.data;
    },

    // Delete teacher-subject assignment by ID (admin only)
    deleteAssignment: async (assignmentId) => {
        const response = await api.delete(`/teacher-subjects/${assignmentId}`);
        return response.data;
    },

    // Remove all subject assignments for a teacher (admin only)
    removeAllTeacherAssignments: async (teacherId) => {
        const response = await api.delete(`/teacher-subjects/teacher/${teacherId}/all`);
        return response.data;
    },

    // Get teacher-subject assignment by ID
    getAssignmentById: async (assignmentId) => {
        const response = await api.get(`/teacher-subjects/${assignmentId}`);
        return response.data;
    },

    // Legacy methods for backward compatibility
    assignTeacher: async (teacherId, subjectId) => {
        return await teacherSubjectService.assignTeacherToSubject({
            teacher_id: teacherId,
            subject_id: subjectId
        });
    },

    getAllAssignments: async () => {
        return await teacherSubjectService.getTeacherSubjectAssignments();
    },

    removeAssignment: async (assignmentId) => {
        return await teacherSubjectService.deleteAssignment(assignmentId);
    }
};