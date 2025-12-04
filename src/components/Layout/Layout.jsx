import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    const location = useLocation();

    const navigation = [
        { name: 'Home', href: '/dashboard', icon: HomeIcon, roles: ['teacher', 'student', 'parent', 'student_parent'] },
        { name: 'Students', href: '/students', icon: UserIcon, roles: ['admin'] },
        { name: 'Teachers', href: '/teachers', icon: UserGroupIcon, roles: ['admin'] },
        { name: 'Classes', href: '/classes', icon: AcademicCapIcon, roles: ['admin', 'teacher', 'student', 'parent', 'student_parent'] },
        { name: 'Calendar', href: '/calendar', icon: CalendarIcon, roles: ['admin', 'teacher', 'student', 'parent', 'student_parent'] },
        { name: 'Banner', href: '/banner', icon: HomeIcon, roles: ['admin'] },
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
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#2D336B]">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                type="button"
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={onClose}
                            >
                                <XMarkIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        {/* User Profile Section */}
                        <div className="flex items-center p-4 text-black bg-[#7886C7] border-b border-[#5b21b6]">
                            <div className="shrink-0">
                                <div className="h-12 w-12 rounded-full bg-[#6366f1] flex items-center justify-center">
                                    <span className="text-lg font-medium">
                                        {user?.name?.[0] || user?.first_name?.[0] || 'U'}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">
                                    {user?.role === 'admin' ? user?.name : `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.name}
                                </p>
                                <p className="text-xs uppercase">{user?.role || 'User'}</p>
                            </div>
                        </div>

                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <nav className="mt-2 px-2 space-y-1">
                                {filteredNavigation.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${isActive
                                                ? 'bg-[#5b21b6] text-white border-r-4 border-white'
                                                : 'text-[#c7d2fe] hover:bg-[#5b21b6] hover:text-white'
                                                }`}
                                            onClick={onClose}
                                        >
                                            <item.icon className={`mr-4 h-6 w-6 ${isActive ? 'text-white' : ''
                                                }`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Sign Out Button for Mobile */}
                        <div className="shrink-0 p-4">
                            <button
                                onClick={handleLogout}
                                className="group flex items-center w-full px-3 py-2 text-base font-medium rounded-md text-[#c7d2fe] hover:text-white transition-colors duration-200"
                            >
                                <ArrowRightOnRectangleIcon className="mr-4 h-6 w-6" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col bg-[#2D336B]">
                <div className="flex-1 flex flex-col min-h-0 bg-[#2D336B]">
                    {/* User Profile Section */}
                    <div className="flex items-center p-4 text-black bg-[#7886C7] border-b border-[#5b21b6]">
                        <div className="shrink-0">
                            <div className="h-12 w-12 rounded-full bg-[#6366f1] flex items-center justify-center">
                                <span className="text-lg font-medium">
                                    {user?.name?.[0] || user?.first_name?.[0] || 'U'}
                                </span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">
                                {user?.role === 'admin' ? user?.name : `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.name}
                            </p>
                            <p className="text-xs uppercase">{user?.role || 'User'}</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <nav className="mt-2 flex-1 px-2 space-y-1">
                            {filteredNavigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive
                                            ? 'bg-[#5b21b6] text-white border-r-4 border-white'
                                            : 'text-[#c7d2fe] hover:bg-[#5b21b6] hover:text-white'
                                            }`}
                                    >
                                        <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : ''
                                            }`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Sign Out Button */}
                    <div className="shrink-0 p-4">
                        <button
                            onClick={handleLogout}
                            className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-[#c7d2fe] hover:text-white transition-colors duration-200"
                        >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                            Sign Out
                        </button>
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
            <div className="shrink-0 h-16 bg-[#A9B5DF] shadow-sm border-b border-gray-200 flex items-center justify-between px-4">
                <div className="flex items-center">
                    <button
                        type="button"
                        className="md:hidden mr-4 text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl font-bold text-black">LEMUEL<span className="text-[#5b21b6]">EduSpace</span></h1>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Main content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
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