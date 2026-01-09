import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { authService } from '../services';
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [adminName, setAdminName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const logsPerPage = 20;

    const navigate = useNavigate();

    useEffect(() => {
        fetchLogs();
    }, [currentPage]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const skip = (currentPage - 1) * logsPerPage;
            const params = {
                skip,
                limit: logsPerPage,
            };

            if (adminName) params.admin_name = adminName;
            if (startDate) params.start_date = new Date(startDate).toISOString();
            if (endDate) params.end_date = new Date(endDate).toISOString();

            const data = await authService.getAdminLoginLogs(params);
            setLogs(data);
            // Estimate total for pagination (if we get full page, there might be more)
            if (data.length === logsPerPage) {
                setTotalLogs((currentPage + 1) * logsPerPage);
            } else {
                setTotalLogs((currentPage - 1) * logsPerPage + data.length);
            }
        } catch (err) {
            console.error('Error fetching admin logs:', err);
            setError('Failed to fetch admin login logs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchLogs();
    };

    const clearFilters = () => {
        setAdminName('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
        setTimeout(fetchLogs, 0);
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

    const totalPages = Math.ceil(totalLogs / logsPerPage);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
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
                            <h1 className="text-2xl font-semibold text-gray-800 ml-4">Admin Login Logs</h1>
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

                    {/* Filters Panel */}
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
                                            value={adminName}
                                            onChange={e => setAdminName(e.target.value)}
                                            className="border text-black border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <button
                                    onClick={handleSearch}
                                    className="bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-md hover:bg-blue-700 transition"
                                >
                                    Search
                                </button>

                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Log count */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            Showing {logs.length} log entries
                        </p>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        {loading ? (
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
                                    {logs.map(log => (
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

                        {!loading && logs.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No admin login logs found.
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
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

                            {/* Page numbers */}
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
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AdminLogs;
