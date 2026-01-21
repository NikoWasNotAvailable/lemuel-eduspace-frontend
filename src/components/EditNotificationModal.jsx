import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { notificationService } from '../services';

const EditNotificationModal = ({ isOpen, onClose, onSubmit, loading, notification }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'general',
        nominal: '',
        date: '',
        is_scheduled: 0,
        image: null,
        existingImage: null
    });

    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    const notificationTypes = [
        { value: 'general', label: 'General' },
        { value: 'announcement', label: 'Announcement' },
        { value: 'assignment', label: 'Assignment' },
        { value: 'event', label: 'Event' },
        { value: 'payment', label: 'Payment' }
    ];

    // Populate form with notification data when modal opens
    useEffect(() => {
        if (isOpen && notification) {
            // Format date for datetime-local input
            let formattedDate = '';
            if (notification.date) {
                const date = new Date(notification.date);
                formattedDate = date.toISOString().slice(0, 16);
            }

            setFormData({
                title: notification.title || '',
                description: notification.description || '',
                type: notification.type || 'general',
                nominal: notification.nominal || '',
                date: formattedDate,
                is_scheduled: notification.is_scheduled ? 1 : 0,
                image: null,
                existingImage: notification.image || null
            });
            setErrors({});
        }
    }, [isOpen, notification]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                image: e.target.files[0]
            }));
        }
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            image: null,
            existingImage: null
        }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'is_scheduled') {
            setFormData(prev => ({
                ...prev,
                [name]: checked ? 1 : 0
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            let imagePath = formData.existingImage;

            // Upload new image if selected
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

            // Prepare update data
            const updateData = {
                title: formData.title,
                description: formData.description || null,
                type: formData.type,
                is_scheduled: formData.is_scheduled === 1
            };

            // Include nominal if type is payment
            if (formData.type === 'payment' && formData.nominal) {
                updateData.nominal = parseFloat(formData.nominal);
            } else {
                updateData.nominal = null;
            }

            // Include date if provided
            if (formData.date) {
                updateData.date = new Date(formData.date).toISOString();
            } else {
                updateData.date = null;
            }

            onSubmit(notification.id, updateData);
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            type: 'general',
            nominal: '',
            date: '',
            is_scheduled: 0,
            image: null,
            existingImage: null
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-[50%] max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Notification</h2>
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
                            
                            {/* Show existing image */}
                            {formData.existingImage && !formData.image && (
                                <div className="mb-3">
                                    <div className="relative inline-block">
                                        <img
                                            src={`http://localhost:8000${formData.existingImage}`}
                                            alt="Current notification"
                                            className="max-h-32 rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Current image (click X to remove)</p>
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            />
                            {formData.image && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">New image selected: {formData.image.name}</p>
                                </div>
                            )}
                            {errors.image && <p className="text-red-500 text-xs mt-2">{errors.image}</p>}
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
                                id="edit_is_scheduled"
                                checked={formData.is_scheduled === 1}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="edit_is_scheduled" className="ml-2 block text-sm text-gray-900">
                                Add to calendar/schedule
                            </label>
                        </div>

                        {/* Info about recipients */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> Editing a notification will update it for all assigned recipients. 
                                To change recipients, please delete and create a new notification.
                            </p>
                        </div>
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
                            {isUploading ? 'Uploading Image...' : (loading ? 'Saving Changes...' : 'Save Changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditNotificationModal;
