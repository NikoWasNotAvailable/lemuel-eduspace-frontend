import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { sessionService } from '../services';
import {
    CalendarDaysIcon,
    ClockIcon,
    PlusIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const Sessions = () => {
    const { hasAnyRole } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoading(true);
                const response = await sessionService.getAllSessions();
                setSessions(response);
            } catch (error) {
                console.error('Error fetching sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
    };

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.subject?.name.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'upcoming') {
            return matchesSearch && new Date(session.scheduled_date) > new Date();
        }
        if (filter === 'past') {
            return matchesSearch && new Date(session.scheduled_date) < new Date();
        }
        return matchesSearch;
    });

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
                {/* Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage and view learning sessions
                        </p>
                    </div>
                    {hasAnyRole(['admin', 'teacher']) && (
                        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                            >
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                Create Session
                            </button>
                        </div>
                    )}
                </div>

                {/* Filters and Search */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Search sessions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="all">All Sessions</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="past">Past</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sessions List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {filteredSessions.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {filteredSessions.map((session) => {
                                const { date, time } = formatDateTime(session.scheduled_date);
                                const isUpcoming = new Date(session.scheduled_date) > new Date();

                                return (
                                    <li key={session.id}>
                                        <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="shrink-0">
                                                        <CalendarDaysIcon className={`h-6 w-6 ${isUpcoming ? 'text-green-500' : 'text-gray-400'}`} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {session.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {session.subject?.name} • {session.classroom?.name}
                                                        </p>
                                                        {session.description && (
                                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                                {session.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-gray-900">{date}</p>
                                                        <p className="text-sm text-gray-500 flex items-center">
                                                            <ClockIcon className="h-4 w-4 mr-1" />
                                                            {time}
                                                        </p>
                                                    </div>
                                                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${isUpcoming
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {isUpcoming ? 'Upcoming' : 'Past'}
                                                    </div>
                                                </div>
                                            </div>
                                            {session.attachments && session.attachments.length > 0 && (
                                                <div className="mt-2 ml-10">
                                                    <p className="text-sm text-gray-500">
                                                        {session.attachments.length} attachment(s)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="px-4 py-12 text-center">
                            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || filter !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Get started by creating a new session.'}
                            </p>
                            {hasAnyRole(['admin', 'teacher']) && (!searchTerm && filter === 'all') && (
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Create Session
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Sessions;