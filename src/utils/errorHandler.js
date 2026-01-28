/**
 * Parse backend validation errors from API responses
 * @param {Error} error - The error object from the API call
 * @returns {Object} - An object with field names as keys and error messages as values
 */
export const parseBackendErrors = (error) => {
    const errors = {};

    // Check if error response exists
    if (error?.response?.data?.detail) {
        const detail = error.response.data.detail;

        // Handle array of validation errors (FastAPI format)
        if (Array.isArray(detail)) {
            detail.forEach((err) => {
                // Extract field name from loc array
                // loc format: ["body", "field_name"] or ["body", "nested", "field"]
                if (err.loc && Array.isArray(err.loc) && err.loc.length > 1) {
                    const fieldName = err.loc[err.loc.length - 1]; // Get the last element (field name)
                    
                    // Extract the actual error message
                    let message = err.msg || 'Invalid value';
                    
                    // Clean up the message (remove "Value error, " prefix if present)
                    message = message.replace(/^Value error,\s*/i, '');
                    
                    errors[fieldName] = message;
                }
            });
        }
        // Handle string error message
        else if (typeof detail === 'string') {
            errors.general = detail;
        }
    }
    // Handle generic error message
    else if (error?.response?.data?.message) {
        errors.general = error.response.data.message;
    }
    // Handle network or other errors
    else if (error?.message) {
        errors.general = error.message;
    }
    else {
        errors.general = 'An unexpected error occurred';
    }

    return errors;
};

/**
 * Get a user-friendly error message from an error object
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message if no specific error is found
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
    if (error?.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        // If detail is a string, return it
        if (typeof detail === 'string') {
            return detail;
        }
        
        // If detail is an array of errors, return the first error message
        if (Array.isArray(detail) && detail.length > 0) {
            let message = detail[0].msg || defaultMessage;
            // Clean up the message
            message = message.replace(/^Value error,\s*/i, '');
            return message;
        }
    }
    
    if (error?.response?.data?.message) {
        return error.response.data.message;
    }
    
    if (error?.message) {
        return error.message;
    }
    
    return defaultMessage;
};
