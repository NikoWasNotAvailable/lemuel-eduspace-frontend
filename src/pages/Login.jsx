import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#B9C0E2]">
            {/* Card Container */}
            <div className="w-[400px] bg-white rounded-[30px] overflow-hidden shadow-lg">
                {/* Header */}
                <div className="flex justify-center gap-10 items-center bg-[#F4F4F4] py-4 border-b border-gray-300 rounded-t-[30px]">
                    <img
                        src="src\assets\Lemuel_Logo.png"
                        alt="Logo BINUS"
                        className="h-14 object-contain"
                    />
                    <img
                        src="src\assets\Binus_Logo.png"
                        alt="Logo BINUS"
                        className="h-14 object-contain"
                    />
                </div>

                {/* Content */}
                <div className="flex flex-col items-center px-8 py-10">
                    <h2 className="text-xl font-semibold text-black mb-6">
                        Login Student
                    </h2>

                    {/* Main Login Button */}
                    <Link
                        to="/login-student"
                        className="w-full bg-[#2F80ED] text-white py-3 rounded-md text-center font-medium hover:bg-[#1E6FD6] transition-all"
                    >
                        Login
                    </Link>

                    {/* Other Login Options */}
                    <div className="w-full mt-8 space-y-2 border-t border-gray-200 pt-4 text-center">
                        <Link
                            to="/login-parent"
                            className="block text-sm text-black font-medium hover:text-[#2F80ED]"
                        >
                            Login As Parent
                        </Link>
                        <Link
                            to="/login-teacher"
                            className="block text-sm text-black font-medium hover:text-[#2F80ED]"
                        >
                            Login As Teacher
                        </Link>
                        <Link
                            to="/login-admin"
                            className="block text-sm text-black font-medium hover:text-[#2F80ED]"
                        >
                            Login As Admin
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
