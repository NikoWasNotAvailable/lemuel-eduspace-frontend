import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { authService, adminActivityLogService } from '../services';
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const AdminLogs = () => {
    // Tab state
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'activity'

    // Login logs state
    const [loginLogs, setLoginLogs] = useState([]);
    const [loginLoading, setLoginLoading] = useState(true);
    const [loginError, setLoginError] = useState(null);
    const [loginAdminName, setLoginAdminName] = useState('');
    const [loginStartDate, setLoginStartDate] = useState('');
    const [loginEndDate, setLoginEndDate] = useState('');
    const [loginCurrentPage, setLoginCurrentPage] = useState(1);
    const [loginTotalLogs, setLoginTotalLogs] = useState(0);

    // Activity logs state
    const [activityLogs, setActivityLogs] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);
    const [activityError, setActivityError] = useState(null);
    const [activityAdminName, setActivityAdminName] = useState('');
    const [activityAction, setActivityAction] = useState('');
    const [activityEntityType, setActivityEntityType] = useState('');
    const [activityStartDate, setActivityStartDate] = useState('');
    const [activityEndDate, setActivityEndDate] = useState('');
    const [activityCurrentPage, setActivityCurrentPage] = useState(1);
    const [activityTotalLogs, setActivityTotalLogs] = useState(0);

    const [showFilters, setShowFilters] = useState(false);
    const logsPerPage = 20;

    const navigate = useNavigate();

    // Action and Entity type options (lowercase to match backend)
    const actionTypes = ['create', 'update', 'delete'];
    const entityTypes = ['user', 'student', 'teacher', 'class', 'subject', 'session', 'region', 'enrollment', 'assignment'];

    useEffect(() => {
        if (activeTab === 'login') {
            fetchLoginLogs();
        } else {
            fetchActivityLogs();
        }
    }, [activeTab, loginCurrentPage, activityCurrentPage]);

    const fetchLoginLogs = async () => {
        try {
            setLoginLoading(true);
            const skip = (loginCurrentPage - 1) * logsPerPage;
            const params = {
                skip,
                limit: logsPerPage,
            };

            if (loginAdminName) params.admin_name = loginAdminName;
            if (loginStartDate) params.start_date = new Date(loginStartDate).toISOString();
            if (loginEndDate) params.end_date = new Date(loginEndDate).toISOString();

            const data = await authService.getAdminLoginLogs(params);
            setLoginLogs(data);
            if (data.length === logsPerPage) {
                setLoginTotalLogs((loginCurrentPage + 1) * logsPerPage);
            } else {
                setLoginTotalLogs((loginCurrentPage - 1) * logsPerPage + data.length);
            }
        } catch (err) {
            console.error('Error fetching admin login logs:', err);
            setLoginError('Failed to fetch admin login logs');
        } finally {
            setLoginLoading(false);
        }
    };

    const fetchActivityLogs = async () => {
        try {
            setActivityLoading(true);
            const skip = (activityCurrentPage - 1) * logsPerPage;
            const params = {
                skip,
                limit: logsPerPage,
            };

            if (activityAdminName) params.admin_name = activityAdminName;
            if (activityAction) params.action = activityAction;
            if (activityEntityType) params.entity_type = activityEntityType;
            if (activityStartDate) params.start_date = new Date(activityStartDate).toISOString();
            if (activityEndDate) params.end_date = new Date(activityEndDate).toISOString();

            const data = await adminActivityLogService.getActivityLogs(params);
            setActivityLogs(data);
            if (data.length === logsPerPage) {
                setActivityTotalLogs((activityCurrentPage + 1) * logsPerPage);
            } else {
                setActivityTotalLogs((activityCurrentPage - 1) * logsPerPage + data.length);
            }
        } catch (err) {
            console.error('Error fetching admin activity logs:', err);
            setActivityError('Failed to fetch admin activity logs');
        } finally {
            setActivityLoading(false);
        }
    };

    const handleLoginSearch = () => {
        setLoginCurrentPage(1);
        fetchLoginLogs();
    };

    const handleActivitySearch = () => {
        setActivityCurrentPage(1);
        fetchActivityLogs();
    };

    const clearLoginFilters = () => {
        setLoginAdminName('');
        setLoginStartDate('');
        setLoginEndDate('');
        setLoginCurrentPage(1);
        setTimeout(fetchLoginLogs, 0);
    };

    const clearActivityFilters = () => {
        setActivityAdminName('');
        setActivityAction('');
        setActivityEntityType('');
        setActivityStartDate('');
        setActivityEndDate('');
        setActivityCurrentPage(1);
        setTimeout(fetchActivityLogs, 0);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getActionBadgeColor = (action) => {
        switch (action?.toLowerCase()) {
            case 'create':
                return 'bg-green-100 text-green-800';
            case 'update':
                return 'bg-blue-100 text-blue-800';
            case 'delete':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getEntityBadgeColor = (entityType) => {
        switch (entityType?.toLowerCase()) {
            case 'user':
            case 'student':
            case 'teacher':
                return 'bg-purple-100 text-purple-800';
            case 'class':
                return 'bg-indigo-100 text-indigo-800';
            case 'subject':
            case 'session':
                return 'bg-cyan-100 text-cyan-800';
            case 'region':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const loginTotalPages = Math.ceil(loginTotalLogs / logsPerPage);
    const activityTotalPages = Math.ceil(activityTotalLogs / logsPerPage);

    const renderPagination = (currentPage, totalPages, goToPage, goToPreviousPage, goToNextPage) => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center items-center gap-2 mt-6">
                <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;

                    const showPage = page === 1 || page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                        if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-2 text-gray-500">...</span>;
                        }
                        return null;
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-8 h-8 rounded ${isCurrentPage
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        );
    };

    return (
        <Layout>
            <div className="bg-white min-h-[calc(100vh-4rem)]">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-800 ml-4">Admin Logs</h1>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <FunnelIcon className="h-5 w-5" />
                            Filters
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('login')}
                                className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                                    activeTab === 'login'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Login Logs
                            </button>
                            <button
                                onClick={() => setActiveTab('activity')}
                                className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                                    activeTab === 'activity'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Activity Logs
                            </button>
                        </nav>
                    </div>

                    {/* Login Logs Tab */}
                    {activeTab === 'login' && (
                        <>
                            {/* Login Filters Panel */}
                            {showFilters && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                                            <div className="relative">
                                                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search by name..."
                                                    value={loginAdminName}
                                                    onChange={e => setLoginAdminName(e.target.value)}
                                                    className="border text-black border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                            <input
                                                type="datetime-local"
                                                value={loginStartDate}
                                                onChange={e => setLoginStartDate(e.target.value)}
                                                className="border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                            <input
                                                type="datetime-local"
                                                value={loginEndDate}
                                                onChange={e => setLoginEndDate(e.target.value)}
                                                className="border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <button
                                            onClick={handleLoginSearch}
                                            className="bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-md hover:bg-blue-700 transition"
                                        >
                                            Search
                                        </button>

                                        <button
                                            onClick={clearLoginFilters}
                                            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Error message */}
                            {loginError && (
                                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {loginError}
                                </div>
                            )}

                            {/* Log count */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">
                                    Showing {loginLogs.length} login log entries
                                </p>
                            </div>

                            {/* Login Table */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                {loginLoading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                                    </div>
                                ) : (
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">ID</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Admin ID</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Admin Name</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">IP Address</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">User Agent</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Login Time</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {loginLogs.map(log => (
                                                <tr
                                                    key={log.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 text-gray-900 font-medium">{log.id}</td>
                                                    <td className="px-6 py-4 text-gray-700">{log.admin_user_id}</td>
                                                    <td className="px-6 py-4 text-gray-700 font-medium">{log.admin_name || '-'}</td>
                                                    <td className="px-6 py-4 text-gray-700">
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                            {log.ip_address || '-'}
                                                        </code>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate" title={log.user_agent}>
                                                        {log.user_agent || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700">{formatDateTime(log.login_time)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {!loginLoading && loginLogs.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        No admin login logs found.
                                    </div>
                                )}
                            </div>

                            {/* Login Pagination */}
                            {renderPagination(
                                loginCurrentPage,
                                loginTotalPages,
                                (page) => setLoginCurrentPage(page),
                                () => setLoginCurrentPage(prev => Math.max(prev - 1, 1)),
                                () => setLoginCurrentPage(prev => Math.min(prev + 1, loginTotalPages))
                            )}
                        </>
                    )}

                    {/* Activity Logs Tab */}
                    {activeTab === 'activity' && (
                        <>
                            {/* Activity Filters Panel */}
                            {showFilters && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                                            <div className="relative">
                                                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search by name..."
                                                    value={activityAdminName}
                                                    onChange={e => setActivityAdminName(e.target.value)}
                                                    className="border text-black border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                                            <select
                                                value={activityAction}
                                                onChange={e => setActivityAction(e.target.value)}
                                                className="border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-40"
                                            >
                                                <option value="">All Actions</option>
                                                {actionTypes.map(action => (
                                                    <option key={action} value={action}>{action}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                                            <select
                                                value={activityEntityType}
                                                onChange={e => setActivityEntityType(e.target.value)}
                                                className="border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-40"
                                            >
                                                <option value="">All Types</option>
                                                {entityTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                            <input
                                                type="datetime-local"
                                                value={activityStartDate}
                                                onChange={e => setActivityStartDate(e.target.value)}
                                                className="border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                            <input
                                                type="datetime-local"
                                                value={activityEndDate}
                                                onChange={e => setActivityEndDate(e.target.value)}
                                                className="border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <button
                                            onClick={handleActivitySearch}
                                            className="bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-md hover:bg-blue-700 transition"
                                        >
                                            Search
                                        </button>

                                        <button
                                            onClick={clearActivityFilters}
                                            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Error message */}
                            {activityError && (
                                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    {activityError}
                                </div>
                            )}

                            {/* Log count */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">
                                    Showing {activityLogs.length} activity log entries
                                </p>
                            </div>

                            {/* Activity Table */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                {activityLoading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                                    </div>
                                ) : (
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">ID</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Admin</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Action</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Entity</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Target</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Details</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">IP Address</th>
                                                <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {activityLogs.map(log => (
                                                <tr
                                                    key={log.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 text-gray-900 font-medium">{log.id}</td>
                                                    <td className="px-6 py-4 text-gray-700">
                                                        <div className="font-medium">{log.admin_name || '-'}</div>
                                                        <div className="text-xs text-gray-500">ID: {log.admin_id}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                                                            {log.action?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEntityBadgeColor(log.entity_type)}`}>
                                                            {log.entity_type?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700">
                                                        <div className="font-medium">{log.entity_name || '-'}</div>
                                                        <div className="text-xs text-gray-500">ID: {log.entity_id || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                                                        {(() => {
                                                            try {
                                                                const details = JSON.parse(log.details);
                                                                if (details.updated_fields) {
                                                                    return (
                                                                        <span className="text-xs" title={details.updated_fields.join(', ')}>
                                                                            Updated: {details.updated_fields.slice(0, 3).join(', ')}
                                                                            {details.updated_fields.length > 3 && ` +${details.updated_fields.length - 3} more`}
                                                                        </span>
                                                                    );
                                                                } else if (details.deleted_user_email) {
                                                                    return (
                                                                        <span className="text-xs">
                                                                            {details.deleted_user_role}: {details.deleted_user_email}
                                                                        </span>
                                                                    );
                                                                } else if (details.role && details.email) {
                                                                    return (
                                                                        <span className="text-xs">
                                                                            {details.role}: {details.email}
                                                                        </span>
                                                                    );
                                                                } else {
                                                                    return <span className="text-xs truncate">{log.details}</span>;
                                                                }
                                                            } catch {
                                                                return <span className="text-xs truncate">{log.details || '-'}</span>;
                                                            }
                                                        })()}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700">
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                            {log.ip_address || '-'}
                                                        </code>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700">{formatDateTime(log.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {!activityLoading && activityLogs.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        No admin activity logs found.
                                    </div>
                                )}
                            </div>

                            {/* Activity Pagination */}
                            {renderPagination(
                                activityCurrentPage,
                                activityTotalPages,
                                (page) => setActivityCurrentPage(page),
                                () => setActivityCurrentPage(prev => Math.max(prev - 1, 1)),
                                () => setActivityCurrentPage(prev => Math.min(prev + 1, activityTotalPages))
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AdminLogs;
