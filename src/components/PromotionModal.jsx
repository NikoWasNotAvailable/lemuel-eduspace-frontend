import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { promotionService } from '../services';

const PromotionModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState('warning'); // warning, preview, processing, success
    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [excludedStudentIds, setExcludedStudentIds] = useState(new Set());

    const handlePreview = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await promotionService.previewPromotion();

            // Transform API response to component state structure
            const mapStudent = (s) => ({
                id: s.student_id,
                name: s.student_name,
                current_grade: s.old_grade,
                next_grade: s.new_grade,
                next_class_name: s.new_class_name,
                reason: s.status // Fallback for issues
            });

            const processedData = {
                promoted: response.details
                    .filter(d => d.status === 'promoted')
                    .map(mapStudent),
                graduated: response.details
                    .filter(d => d.status === 'graduated')
                    .map(mapStudent),
                issues: response.details
                    .filter(d => d.status !== 'promoted' && d.status !== 'graduated')
                    .map(mapStudent)
            };

            setPreviewData(processedData);
            setStep('preview');
        } catch (err) {
            console.error('Preview failed:', err);
            let errorMessage = 'Failed to generate promotion preview.';
            if (err.response?.data?.detail) {
                if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                } else if (Array.isArray(err.response.data.detail)) {
                    errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
                } else {
                    errorMessage = JSON.stringify(err.response.data.detail);
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleExclusion = (studentId) => {
        const newExcluded = new Set(excludedStudentIds);
        if (newExcluded.has(studentId)) {
            newExcluded.delete(studentId);
        } else {
            newExcluded.add(studentId);
        }
        setExcludedStudentIds(newExcluded);
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            // Filter out excluded students from the preview data
            // Assuming previewData has lists of students. 
            // If the API expects just exclusions, we can send that.
            // Or if it expects the list of IDs to process.
            // I'll assume we send the list of IDs to be promoted/graduated.

            const studentsToPromote = previewData?.promoted
                ?.filter(s => !excludedStudentIds.has(s.id))
                .map(s => s.id) || [];

            const studentsToGraduate = previewData?.graduated
                ?.filter(s => !excludedStudentIds.has(s.id))
                .map(s => s.id) || [];

            await promotionService.confirmPromotion({
                promote_student_ids: studentsToPromote,
                graduate_student_ids: studentsToGraduate
            });

            setStep('success');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Promotion failed:', err);
            let errorMessage = 'Failed to execute promotion.';
            if (err.response?.data?.detail) {
                if (typeof err.response.data.detail === 'string') {
                    errorMessage = err.response.data.detail;
                } else if (Array.isArray(err.response.data.detail)) {
                    errorMessage = err.response.data.detail.map(e => e.msg).join(', ');
                } else {
                    errorMessage = JSON.stringify(err.response.data.detail);
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('warning');
        setPreviewData(null);
        setExcludedStudentIds(new Set());
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Mass Student Promotion</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {step === 'warning' && (
                        <div className="text-center py-8">
                            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Warning: Irreversible Action</h3>
                            <p className="text-gray-600 max-w-lg mx-auto mb-8">
                                This action will promote all eligible students to the next grade level and graduate students in the final grade.
                                Please review the changes carefully in the next step before confirming.
                            </p>
                            <button
                                onClick={handlePreview}
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Generating Preview...' : 'Preview Changes'}
                            </button>
                        </div>
                    )}

                    {step === 'preview' && previewData && (
                        <div className="space-y-8">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                    <p className="text-sm text-green-600 font-medium">To Promote</p>
                                    <p className="text-2xl font-bold text-green-800">{previewData.promoted?.length || 0}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <p className="text-sm text-blue-600 font-medium">To Graduate</p>
                                    <p className="text-2xl font-bold text-blue-800">{previewData.graduated?.length || 0}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                    <p className="text-sm text-red-600 font-medium">Issues</p>
                                    <p className="text-2xl font-bold text-red-800">{previewData.issues?.length || 0}</p>
                                </div>
                            </div>

                            {/* Lists */}
                            <div className="space-y-6">
                                {previewData.promoted?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">Promoting Students</h4>
                                        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                                            <table className="min-w-full text-sm text-left">
                                                <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-4 py-2 w-10">Excl.</th>
                                                        <th className="px-4 py-2">Name</th>
                                                        <th className="px-4 py-2">Current Grade</th>
                                                        <th className="px-4 py-2">New Grade</th>
                                                        <th className="px-4 py-2">New Class</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {previewData.promoted.map(student => (
                                                        <tr key={student.id} className={excludedStudentIds.has(student.id) ? 'bg-gray-100 opacity-50' : 'bg-white'}>
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={excludedStudentIds.has(student.id)}
                                                                    onChange={() => toggleExclusion(student.id)}
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2 font-medium text-gray-900">{student.name}</td>
                                                            <td className="px-4 py-2 text-gray-600">{student.current_grade}</td>
                                                            <td className="px-4 py-2 text-green-600 font-medium">{student.next_grade}</td>
                                                            <td className="px-4 py-2 text-gray-600">{student.next_class_name || 'Unassigned'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {previewData.graduated?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">Graduating Students</h4>
                                        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                                            <table className="min-w-full text-sm text-left">
                                                <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-4 py-2 w-10">Excl.</th>
                                                        <th className="px-4 py-2">Name</th>
                                                        <th className="px-4 py-2">Current Grade</th>
                                                        <th className="px-4 py-2">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {previewData.graduated.map(student => (
                                                        <tr key={student.id} className={excludedStudentIds.has(student.id) ? 'bg-gray-100 opacity-50' : 'bg-white'}>
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={excludedStudentIds.has(student.id)}
                                                                    onChange={() => toggleExclusion(student.id)}
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2 font-medium text-gray-900">{student.name}</td>
                                                            <td className="px-4 py-2 text-gray-600">{student.current_grade}</td>
                                                            <td className="px-4 py-2 text-blue-600 font-medium">Graduated</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {previewData.issues?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-red-800 mb-3">Issues (Cannot Promote)</h4>
                                        <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden max-h-60 overflow-y-auto">
                                            <table className="min-w-full text-sm text-left">
                                                <thead className="bg-red-100 text-red-800 font-medium border-b border-red-200">
                                                    <tr>
                                                        <th className="px-4 py-2">Name</th>
                                                        <th className="px-4 py-2">Grade</th>
                                                        <th className="px-4 py-2">Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-red-100">
                                                    {previewData.issues.map((issue, idx) => (
                                                        <tr key={idx} className="bg-white">
                                                            <td className="px-4 py-2 font-medium text-gray-900">{issue.student_name}</td>
                                                            <td className="px-4 py-2 text-gray-600">{issue.current_grade}</td>
                                                            <td className="px-4 py-2 text-red-600">{issue.reason}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-12">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Promotion Successful!</h3>
                            <p className="text-gray-600">
                                The promotion process has been completed. Student grades and classes have been updated.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    {step === 'warning' && (
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    )}

                    {step === 'preview' && (
                        <>
                            <button
                                onClick={() => setStep('warning')}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Confirm Promotion'}
                            </button>
                        </>
                    )}

                    {step === 'success' && (
                        <button
                            onClick={handleClose}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;
