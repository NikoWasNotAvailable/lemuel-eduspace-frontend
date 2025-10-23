import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { sessionService, notificationService } from '../services';
import {
    CalendarDaysIcon,
    ClockIcon,
    BellIcon,
    AcademicCapIcon,
    UserGroupIcon,
    BookOpenIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const { user, hasAnyRole } = useAuth();
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalUsers: 0,
        totalSubjects: 0,
        totalClasses: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch upcoming sessions
                const sessionsResponse = await sessionService.getUpcomingSessions();
                setUpcomingSessions(sessionsResponse.slice(0, 5)); // Show only first 5

                // Fetch user notifications
                const notificationsResponse = await notificationService.getUserNotifications();
                setNotifications(notificationsResponse.slice(0, 5)); // Show only first 5

                // Fetch stats if admin or teacher
                if (hasAnyRole(['admin', 'teacher'])) {
                    const statsResponse = await sessionService.getSessionStats();
                    setStats(statsResponse);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [hasAnyRole]);

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back, {user?.first_name}!
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Here's what's happening in your learning space today.
                        </p>
                    </div>
                </div>

                {/* Stats Cards - Only for Admin and Teachers */}
                {hasAnyRole(['admin', 'teacher']) && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Sessions
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.totalSessions}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UserGroupIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Users
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.totalUsers}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <BookOpenIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Subjects
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.totalSubjects}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <AcademicCapIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Classes
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {stats.totalClasses}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Upcoming Sessions */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Upcoming Sessions
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Your next learning sessions
                            </p>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            {upcomingSessions.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingSessions.map((session) => {
                                        const { date, time } = formatDateTime(session.scheduled_date);
                                        return (
                                            <div key={session.id} className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <ClockIcon className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {session.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {session.subject?.name} • {date} at {time}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No upcoming sessions</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Recent Notifications
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Latest updates and announcements
                            </p>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            {notifications.length > 0 ? (
                                <div className="space-y-4">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <BellIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notification.notification.title}
                                                </p>
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {notification.notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="flex-shrink-0">
                                                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No notifications</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Quick Actions
                        </h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {hasAnyRole(['admin', 'teacher']) && (
                                <>
                                    <a
                                        href="/sessions/create"
                                        className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <div className="flex-shrink-0">
                                            <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            <p className="text-sm font-medium text-gray-900">Create Session</p>
                                        </div>
                                    </a>

                                    <a
                                        href="/notifications/create"
                                        className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <div className="flex-shrink-0">
                                            <BellIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            <p className="text-sm font-medium text-gray-900">Send Notification</p>
                                        </div>
                                    </a>
                                </>
                            )}

                            <a
                                href="/profile"
                                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <div className="flex-shrink-0">
                                    <UserGroupIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">Update Profile</p>
                                </div>
                            </a>

                            <a
                                href="/sessions"
                                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <div className="flex-shrink-0">
                                    <BookOpenIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">View Sessions</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;