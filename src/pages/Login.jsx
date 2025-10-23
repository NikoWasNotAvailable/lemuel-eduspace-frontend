import React from 'react';
import { Navigate } from 'react-router-dom';

const Login = () => {
    // Redirect to student login as the default
    return <Navigate to="/login-student" replace />;
};

export default Login;