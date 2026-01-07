import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import LoginLeftPanel from '../components/UI/LoginLeftPanel';

const LoginParent = () => {
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const { login, loading, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(formData.identifier, formData.password, 'parent');

        if (result.success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#B9C0E2]">
            <div className="flex w-[850px] h-[480px] bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Left Side */}
                <LoginLeftPanel />

                {/* Right Side */}
                <div className="w-1/2 flex flex-col justify-center px-10 py-8 bg-white relative">
                    <Link to="/login" className="absolute top-6 left-6 text-gray-400 hover:text-[#059669] transition-colors">
                        <ArrowLeftIcon className="h-6 w-6" />
                    </Link>
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">Login Parent</h2>
                    <p className="text-sm text-gray-500 mb-6">Email Address</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                                {error}
                            </div>
                        )}

                        <input
                            id="identifier"
                            name="identifier"
                            type="email"
                            placeholder="Enter your email address"
                            required
                            value={formData.identifier}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                        />

                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669] pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <label className="flex items-center text-sm text-gray-700">
                            <input type="checkbox" className="mr-2 accent-[#059669]" />
                            Keep me logged in
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-md text-sm font-medium transition disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Log In'}
                        </button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="font-medium text-[#059669] hover:text-[#047857]"
                                >
                                    Create a new account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginParent;