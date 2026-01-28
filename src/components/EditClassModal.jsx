import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { parseBackendErrors } from '../utils';

const EditClassModal = ({ isOpen, onClose, onSubmit, loading, classData }) => {
    const VALID_GRADES = ['TKA', 'TKB', 'SD1', 'SD2', 'SD3', 'SD4', 'SD5', 'SD6', 'SMP1', 'SMP2', 'SMP3'];

    const [formData, setFormData] = useState({
        name: '',
        region_id: ''
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        if (isOpen && classData) {
            setFormData({
                name: classData.name || '',
                region_id: classData.region_id || classData.region?.id || ''
            });
            setErrors({});
            setGeneralError('');
        }
    }, [isOpen, classData]);

    const validateClassName = (name) => {
        if (!name) return false;
        const upperName = name.toUpperCase();
        return VALID_GRADES.some(grade => upperName.startsWith(grade));
    };

    const handleNameChange = (e) => {
        const newName = e.target.value;
        setFormData({ ...formData, name: newName });

        // Clear error when user starts typing
        if (errors.name) {
            setErrors({ ...errors, name: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate class name
        if (!validateClassName(formData.name)) {
            setErrors({
                name: `Class name must start with a valid grade prefix: ${VALID_GRADES.join(', ')}`
            });
            return;
        }

        try {
            setGeneralError('');
            await onSubmit({
                ...formData,
                region_id: parseInt(formData.region_id)
            });
        } catch (error) {
            const { fieldErrors, generalError: genErr } = parseBackendErrors(error);
            setErrors(prev => ({ ...prev, ...fieldErrors }));
            if (genErr) setGeneralError(genErr);
        }
    };

    const handleClose = () => {
        setFormData({ name: '', region_id: '' });
        setErrors({});
        setGeneralError('');
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
                            Edit Class
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {generalError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{generalError}</p>
                            </div>
                        )}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Class Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3 ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                value={formData.name}
                                onChange={handleNameChange}
                                placeholder="e.g. SD1A, TKA, SMP1B"
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Must start with: {VALID_GRADES.join(', ')}
                            </p>
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

export default EditClassModal;
