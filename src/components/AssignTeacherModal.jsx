import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserPlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { teacherSubjectService } from '../services';

const AssignTeacherModal = ({ isOpen, onClose, onSubmit, loading, subjectId, subjectName, currentTeachers = [] }) => {
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadAvailableTeachers();
            // Pre-select current teachers
            setSelectedTeachers(currentTeachers.map(t => t.id));
        }
    }, [isOpen, currentTeachers]);

    const loadAvailableTeachers = async () => {
        try {
            setLoadingTeachers(true);
            setError(null);
            const teachers = await teacherSubjectService.getAvailableTeachers();
            setAvailableTeachers(teachers);
        } catch (err) {
            console.error('Failed to load teachers:', err);
            setError('Failed to load available teachers.');
        } finally {
            setLoadingTeachers(false);
        }
    };

    const handleTeacherToggle = (teacherId) => {
        setSelectedTeachers(prev => {
            if (prev.includes(teacherId)) {
                return prev.filter(id => id !== teacherId);
            } else {
                return [...prev, teacherId];
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Determine which teachers to add and which to remove
        const currentTeacherIds = currentTeachers.map(t => t.id);
        const teachersToAdd = selectedTeachers.filter(id => !currentTeacherIds.includes(id));
        const teachersToRemove = currentTeacherIds.filter(id => !selectedTeachers.includes(id));

        onSubmit({
            subjectId,
            teachersToAdd,
            teachersToRemove
        });
    };

    const handleClose = () => {
        setSelectedTeachers([]);
        setError(null);
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
                        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                            <UserPlusIcon className="h-6 w-6 mr-2 text-blue-600" />
                            Assign Teachers
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {subjectName && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">
                                Assigning teachers to <span className="font-semibold">{subjectName}</span>
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Teachers List */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Teachers
                            </label>

                            {loadingTeachers ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                                </div>
                            ) : availableTeachers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No teachers available
                                </div>
                            ) : (
                                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                                    {availableTeachers.map((teacher) => {
                                        const isSelected = selectedTeachers.includes(teacher.id);
                                        const isCurrentlyAssigned = currentTeachers.some(t => t.id === teacher.id);

                                        return (
                                            <div
                                                key={teacher.id}
                                                onClick={() => handleTeacherToggle(teacher.id)}
                                                className={`flex items-center justify-between p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3 ${isSelected ? 'bg-blue-600' : 'bg-gray-400'
                                                        }`}>
                                                        {teacher.name?.[0]?.toUpperCase() || 'T'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{teacher.name}</p>
                                                        <p className="text-sm text-gray-500">{teacher.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    {isCurrentlyAssigned && (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">
                                                            Assigned
                                                        </span>
                                                    )}
                                                    {isSelected && (
                                                        <CheckIcon className="h-5 w-5 text-blue-600" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="text-sm text-gray-500">
                            {selectedTeachers.length} teacher(s) selected
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
                                disabled={loading || loadingTeachers}
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save Assignments'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignTeacherModal;
