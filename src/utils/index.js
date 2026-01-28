// User roles (parent access is handled via parent_access flag on student accounts)
export const USER_ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
};

// Grade levels
export const GRADES = [
    'TKA', 'TKB', 'SD1', 'SD2', 'SD3', 'SD4', 'SD5', 'SD6',
    'SMP1', 'SMP2', 'SMP3'
];

// Role labels
export const ROLE_LABELS = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.TEACHER]: 'Teacher',
    [USER_ROLES.STUDENT]: 'Student',
};

// Date formatting utilities
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

export const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (dateString) => {
    return {
        date: formatDate(dateString),
        time: formatTime(dateString),
    };
};

// Check if date is in the future
export const isFutureDate = (dateString) => {
    return new Date(dateString) > new Date();
};

// File size formatting
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file extension from filename
export const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Validate email format
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Generate random color for avatars
export const getRandomColor = () => {
    const colors = [
        'bg-red-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-gray-500',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Get initials from name
export const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Local storage utilities
export const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting item from localStorage:', error);
            return null;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error setting item in localStorage:', error);
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing item from localStorage:', error);
        }
    },

    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

// Error message formatting
export const getErrorMessage = (error) => {
    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

/**
 * Parse backend validation errors from FastAPI response
 * 
 * Backend returns errors in this format:
 * {
 *   "detail": [
 *     {
 *       "type": "value_error",
 *       "loc": ["body", "field_name"],
 *       "msg": "Value error, Error message here",
 *       "input": "submitted_value",
 *       "ctx": { "error": {} }
 *     }
 *   ]
 * }
 * 
 * This function converts it to: { field_name: "Error message here" }
 */
export const parseBackendErrors = (error) => {
    const fieldErrors = {};
    let generalError = null;

    // Check if it's a 422 validation error with detail array
    if (error.response?.status === 422 && Array.isArray(error.response?.data?.detail)) {
        const details = error.response.data.detail;

        details.forEach((err) => {
            // Get the field name from loc array (usually ["body", "field_name"])
            const fieldName = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : null;
            
            // Clean up the error message (remove "Value error, " prefix if present)
            let message = err.msg || 'Invalid value';
            message = message.replace(/^Value error,\s*/i, '');
            message = message.replace(/^Assertion failed,\s*/i, '');
            
            if (fieldName) {
                fieldErrors[fieldName] = message;
            } else {
                generalError = message;
            }
        });
    } else if (error.response?.data?.detail && typeof error.response.data.detail === 'string') {
        // Handle string detail message
        generalError = error.response.data.detail;
    } else if (error.response?.data?.message) {
        generalError = error.response.data.message;
    } else if (error.message) {
        generalError = error.message;
    } else {
        generalError = 'An unexpected error occurred';
    }

    return { fieldErrors, generalError };
};