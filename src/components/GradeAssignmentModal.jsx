import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const GradeAssignmentModal = ({ isOpen, onClose, onSubmit, loading, submission }) => {
    const [formData, setFormData] = useState({
        grade: submission?.grade || '',
        feedback: submission?.feedback || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.grade === '' || formData.grade < 0 || formData.grade > 100) {
            alert('Please enter a valid grade between 0 and 100');
            return;
        }

        onSubmit({
            grade: parseFloat(formData.grade),
            feedback: formData.feedback || null
        });
    };

    const handleClose = () => {
        setFormData({
            grade: submission?.grade || '',
            feedback: submission?.feedback || ''
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm" aria-hidden="true" onClick={handleClose} />

            {/* Full-screen container to center the panel */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                {/* The actual dialog panel */}
                <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Grade Assignment
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {submission && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Student: <span className="font-medium text-gray-900">{submission.student_name || 'Unknown'}</span></p>
                            <p className="text-sm text-gray-600">File: <span className="font-medium text-gray-900">{submission.filename}</span></p>
                            <p className="text-sm text-gray-600">Submitted: <span className="font-medium text-gray-900">{new Date(submission.submitted_at).toLocaleString()}</span></p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Grade Field */}
                        <div>
                            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                                Grade <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="grade"
                                id="grade"
                                min="0"
                                max="100"
                                step="0.01"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                placeholder="0-100"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Enter a grade between 0 and 100
                            </p>
                        </div>

                        {/* Feedback Field */}
                        <div>
                            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                                Feedback (Optional)
                            </label>
                            <textarea
                                name="feedback"
                                id="feedback"
                                rows="4"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3"
                                value={formData.feedback}
                                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                                placeholder="Enter feedback for the student..."
                            />
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Grade'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GradeAssignmentModal;
