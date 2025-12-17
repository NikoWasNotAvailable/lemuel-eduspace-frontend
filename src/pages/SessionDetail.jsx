import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionService, sessionAttachmentService, subjectService, assignmentService } from '../services';
import Layout from '../components/Layout/Layout';
import AddAttachmentModal from '../components/AddAttachmentModal';
import SubmitAssignmentModal from '../components/SubmitAssignmentModal';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeftIcon,
    DocumentIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    LightBulbIcon,
    LinkIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const SessionDetail = () => {
    const { sessionId, subjectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [session, setSession] = useState(null);
    const [subjectInfo, setSubjectInfo] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isAddAttachmentModalOpen, setIsAddAttachmentModalOpen] = useState(false);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [isSubmitAssignmentModalOpen, setIsSubmitAssignmentModalOpen] = useState(false);
    const [submittingAssignment, setSubmittingAssignment] = useState(false);
    const [mySubmissions, setMySubmissions] = useState([]);

    useEffect(() => {
        if (sessionId && subjectId) {
            loadSessionData();
        }
    }, [sessionId, subjectId]);

    const loadSessionData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [sessionData, attachmentsData, subjectData] = await Promise.all([
                sessionService.getSessionById(sessionId),
                sessionAttachmentService.getSessionAttachments(sessionId),
                subjectService.getSubjectById(subjectId)
            ]);

            setSession(sessionData);
            setSubjectInfo(subjectData);
            // Handle response structure { attachments: [], total: 0, session_id: 0 }
            setAttachments(attachmentsData.attachments || []);

            // Load student submissions if user is a student
            if (user?.role === 'student') {
                const submissions = await assignmentService.getMySubmissions();
                // Filter submissions for this session
                const sessionSubmissions = submissions.filter(s => s.session_id === parseInt(sessionId));
                setMySubmissions(sessionSubmissions);
            }
        } catch (err) {
            console.error('Failed to load session data:', err);
            setError('Failed to load session information.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (attachment) => {
        try {
            const response = await sessionAttachmentService.downloadAttachment(attachment.id);
            // Create a blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', attachment.filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download file');
        }
    };

    const handleAddAttachment = async (formData) => {
        try {
            setUploadingAttachment(true);
            await sessionAttachmentService.uploadAttachment(sessionId, formData);
            setIsAddAttachmentModalOpen(false);
            // Reload attachments
            const attachmentsData = await sessionAttachmentService.getSessionAttachments(sessionId);
            setAttachments(attachmentsData.attachments || []);
        } catch (err) {
            console.error('Failed to upload attachment:', err);
            alert('Failed to upload attachment. Please try again.');
        } finally {
            setUploadingAttachment(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm('Are you sure you want to delete this attachment?')) {
            return;
        }

        try {
            await sessionAttachmentService.deleteAttachment(attachmentId);
            // Remove from local state
            setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        } catch (err) {
            console.error('Failed to delete attachment:', err);
            alert('Failed to delete attachment. Please try again.');
        }
    };

    const handleSubmitAssignment = async (file) => {
        try {
            setSubmittingAssignment(true);
            await assignmentService.submitAssignment(sessionId, file);
            setIsSubmitAssignmentModalOpen(false);
            // Reload student submissions
            const submissions = await assignmentService.getMySubmissions();
            const sessionSubmissions = submissions.filter(s => s.session_id === parseInt(sessionId));
            setMySubmissions(sessionSubmissions);
            alert('Assignment submitted successfully!');
        } catch (err) {
            console.error('Failed to submit assignment:', err);
            alert('Failed to submit assignment. Please try again.');
        } finally {
            setSubmittingAssignment(false);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'material':
                return <LightBulbIcon className="h-6 w-6 text-gray-700" />;
            case 'assignment':
                return <LinkIcon className="h-6 w-6 text-gray-700" />;
            default:
                return <DocumentIcon className="h-6 w-6 text-gray-700" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const canManageAttachments = user?.role === 'admin' || user?.role === 'teacher';

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="p-8 text-center text-red-600">
                    {error}
                    <button
                        onClick={() => navigate(-1)}
                        className="block mx-auto mt-4 text-blue-600 hover:underline"
                    >
                        Go Back
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-white p-8">
                {/* Header Section */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeftIcon className="h-6 w-6 text-gray-800" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {session?.name || 'Session Name'}
                    </h1>
                </div>

                {/* Sub-header / Subject Info */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-left">
                        {subjectInfo?.name || 'Subject Name'}
                    </h2>

                    <div className="flex items-center mb-6">
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl mr-4">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <span className="font-bold text-gray-800 uppercase">
                            {user?.name || 'USER'}
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-8">
                        Session {session?.session_no}
                    </h2>
                </div>

                {/* Student Assignment Submission Section */}
                {user?.role === 'student' && (
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Your Assignment Submissions</h3>
                                <button
                                    onClick={() => setIsSubmitAssignmentModalOpen(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
                                >
                                    <ArrowUpTrayIcon className="h-5 w-5" />
                                    <span>Upload Assignment</span>
                                </button>
                            </div>
                            {mySubmissions.length > 0 ? (
                                <div className="space-y-3">
                                    {mySubmissions.map((submission) => (
                                        <div key={submission.id} className="bg-white p-4 rounded-lg border border-green-300">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">{submission.file_name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                                                    </p>
                                                    {submission.grade !== null && submission.grade !== undefined && (
                                                        <p className="text-sm font-semibold text-green-700 mt-1">
                                                            Grade: {submission.grade}/100
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${submission.grade !== null ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {submission.grade !== null ? 'Graded' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-4">No submissions yet. Upload your assignment above.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Attachments Container */}
                <div className="max-w-4xl mx-auto bg-[#A9B5DF] rounded-3xl overflow-hidden shadow-lg">
                    <div className="bg-[#A9B5DF] p-4 flex items-center justify-between border-b border-white/20">
                        <h3 className="text-white text-xl font-bold">{subjectInfo?.name || 'Subject'}</h3>
                        {canManageAttachments && (
                            <button
                                onClick={() => setIsAddAttachmentModalOpen(true)}
                                className="bg-white text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-100 transition-colors"
                            >
                                <PlusIcon className="h-5 w-5" />
                                <span>Add Attachment</span>
                            </button>
                        )}
                    </div>

                    <div className="p-6 space-y-4">
                        {attachments.length > 0 ? (
                            attachments.map((attachment) => (
                                <div
                                    key={attachment.id}
                                    className="flex items-center justify-between bg-white/20 p-4 rounded-lg hover:bg-white/30 transition-colors group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white p-2 rounded-lg">
                                            {getIconForType(attachment.type)}
                                        </div>
                                        <div>
                                            <span className="text-white font-semibold text-lg block">
                                                {attachment.name || attachment.filename}
                                            </span>
                                            <span className="text-white/70 text-sm">
                                                {formatFileSize(attachment.file_size)} • {attachment.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleDownload(attachment)}
                                            className="bg-white p-2 rounded-md hover:bg-gray-100 transition-colors"
                                            title="Download"
                                        >
                                            <ArrowDownTrayIcon className="h-5 w-5 text-gray-700" />
                                        </button>
                                        {canManageAttachments && (
                                            <button
                                                onClick={() => handleDeleteAttachment(attachment.id)}
                                                className="bg-white p-2 rounded-md hover:bg-red-100 transition-colors"
                                                title="Delete"
                                            >
                                                <TrashIcon className="h-5 w-5 text-red-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-white py-8">
                                <DocumentIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No attachments found for this session.</p>
                                {canManageAttachments && (
                                    <button
                                        onClick={() => setIsAddAttachmentModalOpen(true)}
                                        className="mt-4 bg-white text-gray-700 px-4 py-2 rounded-lg inline-flex items-center space-x-2 hover:bg-gray-100 transition-colors"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                        <span>Add First Attachment</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Attachment Modal */}
            <AddAttachmentModal
                isOpen={isAddAttachmentModalOpen}
                onClose={() => setIsAddAttachmentModalOpen(false)}
                onSubmit={handleAddAttachment}
                loading={uploadingAttachment}
                sessionId={sessionId}
            />

            {/* Submit Assignment Modal */}
            <SubmitAssignmentModal
                isOpen={isSubmitAssignmentModalOpen}
                onClose={() => setIsSubmitAssignmentModalOpen(false)}
                onSubmit={handleSubmitAssignment}
                loading={submittingAssignment}
                sessionId={sessionId}
            />
        </Layout>
    );
};

export default SessionDetail;
