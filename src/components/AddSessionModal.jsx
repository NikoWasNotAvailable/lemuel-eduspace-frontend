import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { sessionService } from '../services';
import { parseBackendErrors } from '../utils/errorHandler';

const AddSessionModal = ({ isOpen, onClose, onSubmit, loading, subjectId, subjectName }) => {
    const [formData, setFormData] = useState({
        session_no: '',
        name: '',
        date: '',
        subject_id: subjectId
    });
    const [nextSessionLoading, setNextSessionLoading] = useState(false);

    useEffect(() => {
        if (isOpen && subjectId) {
            fetchNextSessionNumber();
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({ ...prev, date: today, subject_id: subjectId, name: '' }));
        }
    }, [isOpen, subjectId]);

    const fetchNextSessionNumber = async () => {
        try {
            setNextSessionLoading(true);
            const nextNo = await sessionService.getNextSessionNumber(subjectId);
            setFormData(prev => ({ ...prev, session_no: nextNo }));
        } catch (error) {
            console.error('Failed to fetch next session number:', error);
        } finally {
            setNextSessionLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await onSubmit({
            ...formData,
            session_no: parseInt(formData.session_no),
            subject_id: parseInt(subjectId)
        });
        // Note: AddSessionModal doesn't have errors state, might need to add
    };

    if (!isOpen) return null;

    return (
        <div className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />

            {/* Full-screen container to center the panel */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                {/* The actual dialog panel */}
                <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Add New Session
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            Adding session for <span className="font-semibold">{subjectName}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="session_no" className="block text-sm font-medium text-gray-700">
                                Session Number
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type="number"
                                    name="session_no"
                                    id="session_no"
                                    required
                                    min="1"
                                    className="block w-full rounded-md border-gray-300 pl-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                                    value={formData.session_no}
                                    onChange={(e) => setFormData({ ...formData, session_no: e.target.value })}
                                    disabled={nextSessionLoading}
                                />
                                {nextSessionLoading && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Session Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Introduction to Algebra"
                            />
                        </div>

                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                id="date"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || nextSessionLoading}
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Adding...' : 'Add Session'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddSessionModal;
