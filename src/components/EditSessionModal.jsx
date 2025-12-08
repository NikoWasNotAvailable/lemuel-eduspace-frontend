import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const EditSessionModal = ({ isOpen, onClose, onSubmit, loading, sessionData }) => {
    const [formData, setFormData] = useState({
        session_no: '',
        name: '',
        date: '',
        subject_id: ''
    });

    useEffect(() => {
        if (isOpen && sessionData) {
            setFormData({
                session_no: sessionData.session_no || '',
                name: sessionData.name || '',
                date: sessionData.date || '',
                subject_id: sessionData.subject_id || ''
            });
        }
    }, [isOpen, sessionData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            session_no: parseInt(formData.session_no),
            subject_id: parseInt(formData.subject_id)
        });
    };

    const handleClose = () => {
        setFormData({ session_no: '', name: '', date: '', subject_id: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="relative z-50">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={handleClose} />

            {/* Full-screen container to center the panel */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                {/* The actual dialog panel */}
                <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Edit Session
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="session_no" className="block text-sm font-medium text-gray-700">
                                Session Number
                            </label>
                            <input
                                type="number"
                                name="session_no"
                                id="session_no"
                                required
                                min="1"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3"
                                value={formData.session_no}
                                onChange={(e) => setFormData({ ...formData, session_no: e.target.value })}
                            />
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
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditSessionModal;
