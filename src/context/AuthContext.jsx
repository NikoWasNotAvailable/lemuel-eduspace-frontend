import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                token: null,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                error: null,
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Initial state
const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check for existing token on app load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: { user, token },
                });
            } catch (error) {
                // Invalid stored data, clear it
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    }, []);

    // Login function with userType parameter
    const login = async (identifier, password, userType = 'student', additionalData = {}) => {
        dispatch({ type: 'LOGIN_START' });

        try {
            let response;

            switch (userType) {
                case 'student':
                    response = await authService.studentLogin(identifier, password);
                    break;
                case 'parent':
                    response = await authService.parentLogin(identifier, password);
                    break;
                case 'teacher':
                    response = await authService.teacherLogin(identifier, password);
                    break;
                case 'admin':
                    // For admin, identifier is the email, and we need name from additionalData
                    response = await authService.adminLogin(identifier, additionalData.name || identifier, password);
                    break;
                default:
                    throw new Error('Invalid user type');
            }

            const { access_token, user } = response;

            // Store token and user data
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token: access_token },
            });

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Login failed';
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    };

    // Register function
    const register = async (userData) => {
        dispatch({ type: 'LOGIN_START' });

        try {
            const response = await authService.register(userData);
            const { access_token, user } = response;

            // Store token and user data
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token: access_token },
            });

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Registration failed';
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    };

    // Logout function
    const logout = () => {
        authService.logout();
        dispatch({ type: 'LOGOUT' });
    };

    // Update user profile
    const updateProfile = async (userData) => {
        try {
            const updatedUser = await authService.updateProfile(userData);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            dispatch({
                type: 'UPDATE_USER',
                payload: updatedUser,
            });
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Profile update failed';
            return { success: false, error: errorMessage };
        }
    };

    // Clear error
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    // Check if user has specific role
    const hasRole = (role) => {
        return state.user?.role === role;
    };

    // Check if user has any of the specified roles
    const hasAnyRole = (roles) => {
        return roles.includes(state.user?.role);
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        clearError,
        hasRole,
        hasAnyRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;