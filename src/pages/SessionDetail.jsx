import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionService, sessionAttachmentService, subjectService, assignmentService, teacherSubjectService, studentService, notificationService } from '../services';
import Layout from '../components/Layout/Layout';
import AddAttachmentModal from '../components/AddAttachmentModal';
import SubmitAssignmentModal from '../components/SubmitAssignmentModal';
import GradeAssignmentModal from '../components/GradeAssignmentModal';
import { useAuth } from '../context/AuthContext';
import { useAcademicYear } from '../context/AcademicYearContext';
import {
    ArrowLeftIcon,
    DocumentIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    LightBulbIcon,
    LinkIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    UserIcon,
    BellIcon
} from '@heroicons/react/24/outline';

const SessionDetail = () => {
    const { sessionId, subjectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isHistoricalMode } = useAcademicYear();

    const [session, setSession] = useState(null);
    const [subjectInfo, setSubjectInfo] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isAddAttachmentModalOpen, setIsAddAttachmentModalOpen] = useState(false);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [isSubmitAssignmentModalOpen, setIsSubmitAssignmentModalOpen] = useState(false);
    const [submittingAssignment, setSubmittingAssignment] = useState(false);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [savingGrade, setSavingGrade] = useState(false);

    useEffect(() => {
        if (sessionId && subjectId) {
            loadSessionData();
        }
    }, [sessionId, subjectId]);

    const loadSessionData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [sessionData, attachmentsData, subjectData, teachersData] = await Promise.all([
                sessionService.getSessionById(sessionId),
                sessionAttachmentService.getSessionAttachments(sessionId),
                subjectService.getSubjectById(subjectId),
                teacherSubjectService.getSubjectTeachers(subjectId)
            ]);

            setSession(sessionData);
            setSubjectInfo(subjectData);
            // Handle response structure { attachments: [], total: 0, session_id: 0 }
            setAttachments(attachmentsData.attachments || []);
            setTeachers(teachersData?.teachers || []);

            // Load student submissions if user is a student
            if (user?.role === 'student') {
                const submissions = await assignmentService.getMySubmissions();
                // Filter submissions for this session
                const sessionSubmissions = submissions.filter(s => s.session_id === parseInt(sessionId));
                setMySubmissions(sessionSubmissions);
            }
            // Load all submissions if user is teacher/admin
            else if (user?.role === 'teacher' || user?.role === 'admin') {
                const [submissions, classStudents] = await Promise.all([
                    assignmentService.getSessionSubmissions(sessionId),
                    studentService.getStudents({ class_id: subjectData.class_id, limit: 100 })
                ]);
                setAllSubmissions(submissions);
                setStudents(classStudents);
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
            throw err; // Re-throw for modal to handle
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

    const handleOpenGradeModal = (submission) => {
        setGradingSubmission(submission);
        setIsGradeModalOpen(true);
    };

    const handleGradeSubmission = async (gradeData) => {
        try {
            setSavingGrade(true);
            await assignmentService.gradeSubmission(gradingSubmission.id, gradeData);
            setIsGradeModalOpen(false);
            setGradingSubmission(null);
            // Reload submissions
            const submissions = await assignmentService.getSessionSubmissions(sessionId);
            setAllSubmissions(submissions);
            alert('Grade saved successfully!');
        } catch (err) {
            console.error('Failed to grade submission:', err);
            alert('Failed to save grade. Please try again.');
        } finally {
            setSavingGrade(false);
        }
    };

    const handleDownloadSubmission = async (submission) => {
        try {
            const response = await assignmentService.downloadSubmission(submission.id);
            // Create a blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', submission.filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download file');
        }
    };

    const handleNotifyStudent = async (student) => {
        if (!window.confirm(`Send notification to ${student.name}?`)) return;

        try {
            // 1. Create notification with link to this session
            const notificationData = {
                title: `Missing Submission: ${session?.name || 'Session'}`,
                description: `You have not submitted your assignment for ${session?.name} in ${subjectInfo?.name}. Please submit it as soon as possible.`,
                type: 'assignment',
                is_scheduled: false,
                link: `/subjects/${subjectId}/sessions/${sessionId}`
            };

            const notification = await notificationService.createNotification(notificationData);

            // 2. Assign to student
            await notificationService.assignToUsers(notification.id, [student.id]);

            alert(`Notification sent to ${student.name}`);
        } catch (err) {
            console.error('Failed to send notification:', err);
            alert('Failed to send notification. Please try again.');
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

    // Disable write operations in historical mode
    const canManageAttachments = (user?.role === 'admin' || user?.role === 'teacher') && !isHistoricalMode;

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
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {subjectInfo?.name || 'Subject Name'}
                        </h2>
                        {teachers.length > 0 && (
                            <p className="text-sm text-gray-500 mt-0.5">
                                {teachers.map(t => t.name).join(', ')}
                            </p>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900">
                        Session {session?.session_no}
                    </h2>
                </div>

                {/* Student/Parent Assignment Submission Section */}
                {user?.role === 'student' && (
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className={`${user?.parent_access ? 'bg-purple-50 border-purple-200' : 'bg-green-50 border-green-200'} border-2 rounded-xl p-6`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {user?.parent_access ? "Your Child's Assignment Submissions" : 'Your Assignment Submissions'}
                                </h3>
                                {!user?.parent_access && !isHistoricalMode && (
                                    <button
                                        onClick={() => setIsSubmitAssignmentModalOpen(true)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
                                    >
                                        <ArrowUpTrayIcon className="h-5 w-5" />
                                        <span>Upload Assignment</span>
                                    </button>
                                )}
                                {isHistoricalMode && !user?.parent_access && (
                                    <span className="text-amber-600 text-sm">Submissions disabled in historical view</span>
                                )}
                            </div>
                            {mySubmissions.length > 0 ? (
                                <div className="space-y-3">
                                    {mySubmissions.map((submission) => (
                                        <div key={submission.id} className="bg-white p-4 rounded-lg border border-green-300">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{submission.filename}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                                                    </p>
                                                    {submission.grade !== null && submission.grade !== undefined && (
                                                        <p className="text-sm font-semibold text-green-700 mt-1">
                                                            Grade: {submission.grade}/100
                                                        </p>
                                                    )}
                                                    {submission.feedback && (
                                                        <p className="text-xs text-gray-600 mt-1 italic">
                                                            Feedback: {submission.feedback}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end space-y-2 ml-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${submission.grade !== null
                                                        ? (user?.parent_access ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800')
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {submission.grade !== null ? 'Graded' : 'Pending'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDownloadSubmission(submission)}
                                                        className={`${user?.parent_access ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1.5 rounded-lg text-sm flex items-center space-x-1 transition-colors`}
                                                        title={user?.parent_access ? "Download child's submission" : "Download your submission"}
                                                    >
                                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                                        <span>Download</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-4">
                                    {user?.parent_access
                                        ? 'Your child has not submitted any assignments for this session yet.'
                                        : 'No submissions yet. Upload your assignment above.'}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Teacher Assignment Submissions Section */}
                {(user?.role === 'teacher' || user?.role === 'admin') && (
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Student Submissions</h3>
                                <span className="text-sm text-gray-600">
                                    {allSubmissions.length} submission{allSubmissions.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {allSubmissions.length > 0 ? (
                                <div className="space-y-3">
                                    {allSubmissions.map((submission) => (
                                        <div key={submission.id} className="bg-white p-4 rounded-lg border border-blue-300">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-2">
                                                        <UserIcon className="h-5 w-5 text-gray-500 mr-2" />
                                                        <p className="font-semibold text-gray-900">{submission.student_name || 'Unknown Student'}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-1">File: {submission.filename}</p>
                                                    <p className="text-xs text-gray-600">
                                                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                                                    </p>
                                                    {submission.grade !== null && submission.grade !== undefined && (
                                                        <div className="mt-2">
                                                            <p className="text-sm font-semibold text-blue-700">
                                                                Grade: {submission.grade}/100
                                                            </p>
                                                            {submission.feedback && (
                                                                <p className="text-xs text-gray-600 mt-1">
                                                                    Feedback: {submission.feedback}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end space-y-2 ml-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${submission.grade !== null ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {submission.grade !== null ? 'Graded' : 'Pending'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDownloadSubmission(submission)}
                                                        className="bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center space-x-1 hover:bg-gray-700 transition-colors"
                                                        title="Download submission"
                                                    >
                                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                                        <span>Download</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenGradeModal(submission)}
                                                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center space-x-1 hover:bg-blue-700 transition-colors"
                                                    >
                                                        <CheckCircleIcon className="h-4 w-4" />
                                                        <span>{submission.grade !== null ? 'Edit Grade' : 'Grade'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-4">No student submissions yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Missing Submissions Section */}
                {(user?.role === 'teacher' || user?.role === 'admin') && (
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Missing Submissions</h3>
                                <span className="text-sm text-gray-600">
                                    {students.filter(s => !allSubmissions.some(sub => sub.student_id === s.id)).length} student{students.filter(s => !allSubmissions.some(sub => sub.student_id === s.id)).length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {students.filter(s => !allSubmissions.some(sub => sub.student_id === s.id)).length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {students.filter(s => !allSubmissions.some(sub => sub.student_id === s.id)).map((student) => (
                                        <div key={student.id} className="bg-white p-3 rounded-lg border border-red-200 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{student.name}</p>
                                                    <p className="text-xs text-gray-500">{student.nis || 'No NIS'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleNotifyStudent(student)}
                                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                                title="Notify Student"
                                            >
                                                <BellIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-4">All students have submitted!</p>
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

            {/* Grade Assignment Modal */}
            <GradeAssignmentModal
                isOpen={isGradeModalOpen}
                onClose={() => {
                    setIsGradeModalOpen(false);
                    setGradingSubmission(null);
                }}
                onSubmit={handleGradeSubmission}
                loading={savingGrade}
                submission={gradingSubmission}
            />
        </Layout>
    );
};

export default SessionDetail;
