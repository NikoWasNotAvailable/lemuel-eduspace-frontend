import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { regionService, classService, userService, notificationService } from '../services';

const AddNotificationModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'general',
        nominal: '',
        date: '',
        is_scheduled: 0,
        image: null,
        assignmentType: 'none', // none, all, region, class, specific
        regionId: '',
        classId: '',
        specificUserIds: []
    });

    const [errors, setErrors] = useState({});
    const [regions, setRegions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingRegions, setLoadingRegions] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const notificationTypes = [
        { value: 'general', label: 'General' },
        { value: 'announcement', label: 'Announcement' },
        { value: 'assignment', label: 'Assignment' },
        { value: 'event', label: 'Event' },
        { value: 'payment', label: 'Payment' }
    ];

    const assignmentTypes = [
        { value: 'none', label: 'Do not assign yet' },
        { value: 'all', label: 'All users' },
        { value: 'region', label: 'Users in a region' },
        { value: 'class', label: 'Students in a class' },
        { value: 'specific', label: 'Specific users' }
    ];

    // Load resources when modal opens
    useEffect(() => {
        if (isOpen) {
            loadRegions();
            loadUsers();
        }
    }, [isOpen]);

    // Load classes when region is selected
    useEffect(() => {
        if (formData.regionId && formData.assignmentType === 'class') {
            loadClassesByRegion(formData.regionId);
        }
    }, [formData.regionId, formData.assignmentType]);

    const loadRegions = async () => {
        setLoadingRegions(true);
        try {
            const data = await regionService.getAllRegions();
            setRegions(data);
        } catch (error) {
            console.error('Failed to load regions:', error);
        } finally {
            setLoadingRegions(false);
        }
    };

    const loadClassesByRegion = async (regionId) => {
        setLoadingClasses(true);
        try {
            const data = await classService.getClassesByRegion(regionId);
            setClasses(data);
        } catch (error) {
            console.error('Failed to load classes:', error);
        } finally {
            setLoadingClasses(false);
        }
    };

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const data = await userService.getAllUsers(1, 1000);
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                image: e.target.files[0]
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'is_scheduled') {
            setFormData(prev => ({
                ...prev,
                [name]: checked ? 1 : 0
            }));
        } else if (name === 'assignmentType') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                regionId: '',
                classId: '',
                specificUserIds: []
            }));
        } else if (name === 'specificUserIds') {
            const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
            setFormData(prev => ({
                ...prev,
                [name]: selectedOptions
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.type) newErrors.type = 'Type is required';

        // Validate nominal for payment type
        if (formData.type === 'payment') {
            if (!formData.nominal) {
                newErrors.nominal = 'Nominal is required for payment notifications';
            } else if (parseFloat(formData.nominal) >= 100000000) {
                newErrors.nominal = 'Nominal must be less than 100,000,000 IDR';
            } else if (parseFloat(formData.nominal) < 0) {
                newErrors.nominal = 'Nominal must be a positive number';
            }
        }

        // Validate assignment selections
        if (formData.assignmentType === 'region' && !formData.regionId) {
            newErrors.regionId = 'Please select a region';
        }
        if (formData.assignmentType === 'class') {
            if (!formData.regionId) newErrors.regionId = 'Please select a region first';
            if (!formData.classId) newErrors.classId = 'Please select a class';
        }
        if (formData.assignmentType === 'specific' && formData.specificUserIds.length === 0) {
            newErrors.specificUserIds = 'Please select at least one user';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            let imagePath = null;

            // Upload image if selected
            if (formData.image instanceof File) {
                setIsUploading(true);
                try {
                    const uploadResponse = await notificationService.uploadImage(formData.image);
                    imagePath = uploadResponse.image_path;
                } catch (error) {
                    console.error('Failed to upload image:', error);
                    setErrors(prev => ({ ...prev, image: 'Failed to upload image' }));
                    setIsUploading(false);
                    return;
                }
                setIsUploading(false);
            }

            // Prepare data for submission
            const submitData = {
                notificationData: {
                    title: formData.title,
                    description: formData.description || null,
                    type: formData.type,
                    is_scheduled: formData.is_scheduled,
                    image: imagePath
                },
                assignmentType: formData.assignmentType,
                regionId: formData.regionId || null,
                classId: formData.classId || null,
                userIds: formData.specificUserIds
            };

            // Include nominal if type is payment
            if (formData.type === 'payment' && formData.nominal) {
                submitData.notificationData.nominal = parseFloat(formData.nominal);
            }

            // Include date if provided
            if (formData.date) {
                submitData.notificationData.date = new Date(formData.date).toISOString();
            }

            onSubmit(submitData);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'general',
            nominal: '',
            date: '',
            is_scheduled: 0,
            assignmentType: 'none',
            regionId: '',
            classId: '',
            specificUserIds: []
        });
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-[50%] max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Add New Notification</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="h-7 w-7" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                                placeholder="Enter notification title"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-2">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                                placeholder="Enter notification description (optional)"
                            />
                        </div>

                        {/* Image */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Image (Optional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            />
                            {formData.image && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">Selected: {formData.image.name}</p>
                                </div>
                            )}
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.type ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                            >
                                {notificationTypes.map((type) => (
                                    <option key={type.value} value={type.value} className="text-gray-900">
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            {errors.type && <p className="text-red-500 text-xs mt-2">{errors.type}</p>}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Date
                            </label>
                            <input
                                type="datetime-local"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">Optional: Set a specific date for this notification</p>
                        </div>

                        {/* Nominal (only for payment type) */}
                        {formData.type === 'payment' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Payment Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="nominal"
                                    value={formData.nominal}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    max="99999999.99"
                                    className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.nominal ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                        }`}
                                    placeholder="Enter payment amount (IDR)"
                                />
                                <p className="text-xs text-gray-500 mt-1">Maximum: 99,999,999.99 IDR</p>
                                {errors.nominal && <p className="text-red-500 text-xs mt-2">{errors.nominal}</p>}
                            </div>
                        )}

                        {/* Is Scheduled */}
                        <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                            <input
                                type="checkbox"
                                name="is_scheduled"
                                id="is_scheduled"
                                checked={formData.is_scheduled === 1}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_scheduled" className="ml-2 block text-sm text-gray-900">
                                Add to calendar/schedule
                            </label>
                        </div>

                        {/* Assignment Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Assign To
                            </label>
                            <select
                                name="assignmentType"
                                value={formData.assignmentType}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            >
                                {assignmentTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Region Selection (for region or class assignment) */}
                        {(formData.assignmentType === 'region' || formData.assignmentType === 'class') && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Region <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="regionId"
                                    value={formData.regionId}
                                    onChange={handleInputChange}
                                    disabled={loadingRegions}
                                    className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.regionId ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                        }`}
                                >
                                    <option value="">Select a region</option>
                                    {regions.map((region) => (
                                        <option key={region.id} value={region.id}>
                                            {region.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.regionId && <p className="text-red-500 text-xs mt-2">{errors.regionId}</p>}
                            </div>
                        )}

                        {/* Class Selection (only for class assignment) */}
                        {formData.assignmentType === 'class' && formData.regionId && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Class <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="classId"
                                    value={formData.classId}
                                    onChange={handleInputChange}
                                    disabled={loadingClasses}
                                    className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.classId ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                        }`}
                                >
                                    <option value="">Select a class</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.classId && <p className="text-red-500 text-xs mt-2">{errors.classId}</p>}
                            </div>
                        )}

                        {/* Specific Users Selection */}
                        {formData.assignmentType === 'specific' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Users <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="specificUserIds"
                                    multiple
                                    value={formData.specificUserIds}
                                    onChange={handleInputChange}
                                    disabled={loadingUsers}
                                    className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.specificUserIds ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                        }`}
                                    size="6"
                                >
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.role})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple users</p>
                                {errors.specificUserIds && <p className="text-red-500 text-xs mt-2">{errors.specificUserIds}</p>}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-8 border-t border-gray-200 mt-8">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || isUploading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-semibold transition-all"
                        >
                            {isUploading ? 'Uploading Image...' : (loading ? 'Creating Notification...' : 'Create Notification')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNotificationModal;
