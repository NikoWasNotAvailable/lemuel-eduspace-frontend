import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HomeIcon,
    AcademicCapIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    BellIcon,
    UserIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout, hasAnyRole } = useAuth();

    const navigation = [
        { name: 'Home', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'teacher', 'student', 'parent', 'student_parent'] },
        { name: 'Students', href: '/students', icon: UserIcon, roles: ['admin'] },
        { name: 'Teachers', href: '/teachers', icon: UserGroupIcon, roles: ['admin'] },
        { name: 'Classes', href: '/classes', icon: AcademicCapIcon, roles: ['admin', 'teacher', 'student', 'parent', 'student_parent'] },
        { name: 'Calendar', href: '/calendar', icon: CalendarIcon, roles: ['admin', 'teacher', 'student', 'parent', 'student_parent'] },
        { name: 'Notifications', href: '/notifications', icon: BellIcon, roles: ['admin', 'teacher', 'student', 'parent', 'student_parent'] },
        { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['admin', 'teacher', 'student', 'parent', 'student_parent'] },
    ];

    const filteredNavigation = navigation.filter(item =>
        hasAnyRole(item.roles)
    );

    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <>
            {/* Mobile sidebar backdrop */}
            {isOpen && (
                <div className="fixed inset-0 flex z-40 md:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>

                    {/* Mobile sidebar */}
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={onClose}
                            >
                                <XMarkIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <nav className="mt-5 px-2 space-y-1">
                                {filteredNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        onClick={onClose}
                                    >
                                        <item.icon className="mr-4 h-6 w-6" />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-700">
                                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="ml-auto flex items-center justify-center h-8 w-8 rounded-full text-gray-400 hover:text-gray-600"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:top-16">
                <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                            {filteredNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <div className="flex items-center w-full">
                            <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-700">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center h-8 w-8 rounded-full text-gray-400 hover:text-gray-600"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
            {/* Top Bar - Full Width */}
            <div className="flex-shrink-0 h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4">
                <div className="flex items-center">
                    <button
                        type="button"
                        className="md:hidden mr-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <img
                        src="src\assets\Lemuel_Logo.png"
                        alt="Lemuel Logo"
                        className="h-8 w-auto mr-3"
                    />
                    <h1 className="text-xl font-bold text-gray-900">LEMUEL EduSpace</h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Main content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none md:ml-64">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;