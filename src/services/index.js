import api from './api';

// Authentication services
export const authService = {
    // User authentication
    login: async (email, password) => {
        const response = await api.post('/users/login', { identifier: email, password });
        return response.data;
    },

    // Admin authentication
    adminLogin: async (name, password) => {
        const response = await api.post('/admin-auth/login', {
            identifier: name,
            name: name,
            password
        });
        return response.data;
    },

    // Register new user
    register: async (userData) => {
        const response = await api.post('/users/register', userData);
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    // Update current user
    updateProfile: async (userData) => {
        const response = await api.put('/users/me', userData);
        return response.data;
    },

    // Change password
    changePassword: async (passwordData) => {
        const response = await api.post('/users/me/change-password', passwordData);
        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

// User management services
export const userService = {
    // Get all users (admin only)
    getAllUsers: async (page = 1, limit = 10) => {
        const response = await api.get(`/users/?skip=${(page - 1) * limit}&limit=${limit}`);
        return response.data;
    },

    // Get user by ID (admin only)
    getUserById: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },

    // Update user (admin only)
    updateUser: async (userId, userData) => {
        const response = await api.put(`/users/${userId}`, userData);
        return response.data;
    },

    // Delete user (admin only)
    deleteUser: async (userId) => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },

    // Upload profile picture
    uploadProfilePicture: async (file, userId = null) => {
        const formData = new FormData();
        formData.append('file', file);

        const url = userId ? `/users/${userId}/profile-picture` : '/users/profile-picture';
        const response = await api.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete profile picture
    deleteProfilePicture: async () => {
        const response = await api.delete('/users/profile-picture');
        return response.data;
    }
};

// Class management services
export const classService = {
    // Create class
    createClass: async (classData) => {
        const response = await api.post('/classes/', classData);
        return response.data;
    },

    // Get all classes
    getAllClasses: async () => {
        const response = await api.get('/classes/');
        return response.data;
    },

    // Get class by ID
    getClassById: async (classId) => {
        const response = await api.get(`/classes/${classId}`);
        return response.data;
    },

    // Update class
    updateClass: async (classId, classData) => {
        const response = await api.put(`/classes/${classId}`, classData);
        return response.data;
    },

    // Delete class
    deleteClass: async (classId) => {
        const response = await api.delete(`/classes/${classId}`);
        return response.data;
    }
};

// Subject management services
export const subjectService = {
    // Create subject
    createSubject: async (subjectData) => {
        const response = await api.post('/subjects/', subjectData);
        return response.data;
    },

    // Get all subjects
    getAllSubjects: async () => {
        const response = await api.get('/subjects/');
        return response.data;
    },

    // Get subject by ID
    getSubjectById: async (subjectId) => {
        const response = await api.get(`/subjects/${subjectId}`);
        return response.data;
    },

    // Update subject
    updateSubject: async (subjectId, subjectData) => {
        const response = await api.put(`/subjects/${subjectId}`, subjectData);
        return response.data;
    },

    // Delete subject
    deleteSubject: async (subjectId) => {
        const response = await api.delete(`/subjects/${subjectId}`);
        return response.data;
    }
};

// Session management services
export const sessionService = {
    // Create session
    createSession: async (sessionData) => {
        const response = await api.post('/sessions/', sessionData);
        return response.data;
    },

    // Get all sessions with filters
    getAllSessions: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await api.get(`/sessions/?${params}`);
        return response.data;
    },

    // Get upcoming sessions
    getUpcomingSessions: async () => {
        const response = await api.get('/sessions/upcoming');
        return response.data;
    },

    // Get session statistics
    getSessionStats: async () => {
        const response = await api.get('/sessions/stats');
        return response.data;
    },

    // Get sessions by subject
    getSessionsBySubject: async (subjectId) => {
        const response = await api.get(`/sessions/subject/${subjectId}`);
        return response.data;
    },

    // Get session by ID
    getSessionById: async (sessionId) => {
        const response = await api.get(`/sessions/${sessionId}`);
        return response.data;
    },

    // Update session
    updateSession: async (sessionId, sessionData) => {
        const response = await api.put(`/sessions/${sessionId}`, sessionData);
        return response.data;
    },

    // Delete session
    deleteSession: async (sessionId) => {
        const response = await api.delete(`/sessions/${sessionId}`);
        return response.data;
    }
};

// Notification services
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

// Student enrollment services
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

// Teacher-subject assignment services
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