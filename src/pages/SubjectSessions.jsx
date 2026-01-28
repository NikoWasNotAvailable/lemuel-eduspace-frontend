import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subjectService, sessionService, classService, teacherSubjectService } from '../services';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import AddSessionModal from '../components/AddSessionModal';
import EditSessionModal from '../components/EditSessionModal';
import {
    CalendarDaysIcon,
    ArrowLeftIcon,
    PlusIcon,
    ClockIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const SubjectSessions = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [subjectInfo, setSubjectInfo] = useState(null);
    const [classInfo, setClassInfo] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addingSession, setAddingSession] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [updatingSession, setUpdatingSession] = useState(false);

    // Load subject info and sessions on component mount
    useEffect(() => {
        if (subjectId) {
            loadSubjectAndSessions();
        }
    }, [subjectId]);

    const loadSubjectAndSessions = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load subject info first to get class_id
            const subjectData = await subjectService.getSubjectById(subjectId);
            setSubjectInfo(subjectData);

            // Load sessions, class info, and teachers in parallel
            const [sessionsData, classData, teachersData] = await Promise.all([
                sessionService.getSessionsBySubject(subjectId),
                classService.getClassById(subjectData.class_id),
                teacherSubjectService.getSubjectTeachers(subjectId)
            ]);

            // Handle potential pagination response structure or direct array
            const sessionsList = Array.isArray(sessionsData) ? sessionsData : (sessionsData?.sessions || sessionsData?.items || []);
            setSessions(sessionsList);
            setClassInfo(classData);
            setTeachers(teachersData?.teachers || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            setError('Failed to load subject information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSession = async (sessionData) => {
        try {
            setAddingSession(true);
            await sessionService.createSession(sessionData);

            // Refresh sessions list
            const updatedSessionsData = await sessionService.getSessionsBySubject(subjectId);
            const updatedSessionsList = Array.isArray(updatedSessionsData) ? updatedSessionsData : (updatedSessionsData?.sessions || updatedSessionsData?.items || []);
            setSessions(updatedSessionsList);

            setIsAddModalOpen(false);
            setError(null);
        } catch (error) {
            console.error('Failed to add session:', error);
            throw error; // Re-throw for modal to handle
        } finally {
            setAddingSession(false);
        }
    };

    const handleSessionClick = (session) => {
        navigate(`/subjects/${subjectId}/sessions/${session.id}`);
    };

    const handleEditSession = (e, session) => {
        e.stopPropagation();
        setEditingSession(session);
        setIsEditModalOpen(true);
    };

    const handleUpdateSession = async (formData) => {
        try {
            setUpdatingSession(true);
            await sessionService.updateSession(editingSession.id, formData);

            // Refresh sessions
            const updatedSessionsData = await sessionService.getSessionsBySubject(subjectId);
            const updatedSessionsList = Array.isArray(updatedSessionsData) ? updatedSessionsData : (updatedSessionsData?.sessions || updatedSessionsData?.items || []);
            setSessions(updatedSessionsList);

            setIsEditModalOpen(false);
            setEditingSession(null);
            setError(null);
        } catch (error) {
            console.error('Failed to update session:', error);
            throw error; // Re-throw for modal to handle
        } finally {
            setUpdatingSession(false);
        }
    };

    const handleDeleteSession = async (e, sessionId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
            return;
        }

        try {
            await sessionService.deleteSession(sessionId);

            // Refresh sessions
            const updatedSessionsData = await sessionService.getSessionsBySubject(subjectId);
            const updatedSessionsList = Array.isArray(updatedSessionsData) ? updatedSessionsData : (updatedSessionsData?.sessions || updatedSessionsData?.items || []);
            setSessions(updatedSessionsList);

            setError(null);
        } catch (error) {
            console.error('Failed to delete session:', error);
            setError(error.response?.data?.detail || 'Failed to delete session. Please try again.');
        }
    };

    const handleBackToSubjects = () => {
        if (classInfo && classInfo.region) {
            navigate(`/classes/${classInfo.region.id}/class/${classInfo.id}`);
        } else if (subjectInfo?.class_id) {
            // Fallback if we have class_id but no region info loaded yet (though we should have it)
            // We might not know the region ID here easily without classInfo.
            // But we loaded classInfo, so it should be fine.
            navigate(-1); // Simple fallback
        } else {
            navigate('/classes');
        }
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Layout>
            <div className="flex bg-white min-h-[calc(100vh-4rem)]">
                <div className="flex-1 transition-all duration-300">
                    <div className="p-8">
                        {/* Header with back button */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <button
                                        onClick={handleBackToSubjects}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                                    </button>
                                    <div className="ml-4">
                                        <h1 className="text-2xl font-semibold text-gray-800">
                                            {subjectInfo ? `${subjectInfo.name} Sessions` : 'Subject Sessions'}
                                        </h1>
                                        {teachers.length > 0 && (
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {teachers.map(t => t.name).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation and action buttons */}
                        <div className="flex items-center justify-between mb-6">
                            {(user?.role === 'admin' || user?.role === 'teacher') && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-[#6B7280] text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-[#5B6170] transition"
                                >
                                    ADD SESSION
                                </button>
                            )}
                        </div>

                        {/* Subject Info Card */}
                        {/* {subjectInfo && (
                            <div className="bg-[#EAF2FF] rounded-lg p-6 mb-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">{subjectInfo.name}</h2>
                                        <p className="text-gray-600 mt-1">
                                            Class: {classInfo?.name || 'Loading...'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-800">{sessions.length}</p>
                                        <p className="text-sm text-gray-600">Sessions</p>
                                    </div>
                                </div>
                            </div>
                        )} */}

                        {/* Error display */}
                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* Loading state */}
                        {loading && (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}

                        {/* Sessions Grid */}
                        {!loading && (
                            sessions.length === 0 ? (
                                <div className="text-center py-12">
                                    <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
                                    <p className="text-gray-600 mb-6">
                                        There are no sessions for this subject yet.
                                    </p>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className={`bg-[#6B7280] text-white px-4 py-2 rounded-lg hover:bg-[#5B6170] transition-colors flex items-center mx-auto ${user?.role !== 'admin' && user?.role !== 'teacher' ? 'hidden' : ''}`}
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Create First Session
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            onClick={() => handleSessionClick(session)}
                                            className="bg-[#EAF2FF] h-32 rounded-xl flex flex-col items-center justify-center
                                       text-gray-800 cursor-pointer 
                                       hover:bg-[#d8e9ff] transition shadow-sm p-4 relative group"
                                        >
                                            <div className="absolute top-3 right-3 bg-white rounded-full p-1">
                                                <ClockIcon className="h-4 w-4 text-blue-600" />
                                            </div>

                                            {/* Edit/Delete Buttons */}
                                            {(user?.role === 'admin' || user?.role === 'teacher') && (
                                                <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => handleEditSession(e, session)}
                                                        className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition"
                                                        title="Edit session"
                                                    >
                                                        <PencilIcon className="h-4 w-4 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteSession(e, session.id)}
                                                        className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition"
                                                        title="Delete session"
                                                    >
                                                        <TrashIcon className="h-4 w-4 text-red-600" />
                                                    </button>
                                                </div>
                                            )}

                                            <span className="text-3xl font-bold text-blue-600 mb-1">
                                                {session.session_no}
                                            </span>
                                            <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                                                Session
                                            </span>
                                            <div className="mt-2 text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                                                {formatDate(session.date)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Add Session Modal */}
            <AddSessionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddSession}
                loading={addingSession}
                subjectId={subjectId}
                subjectName={subjectInfo?.name}
            />

            {/* Edit Session Modal */}
            <EditSessionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingSession(null);
                }}
                onSubmit={handleUpdateSession}
                loading={updatingSession}
                sessionData={editingSession}
            />
        </Layout>
    );
};

export default SubjectSessions;
