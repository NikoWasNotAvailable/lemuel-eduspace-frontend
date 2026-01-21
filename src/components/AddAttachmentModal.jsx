import React, { useState, useRef } from 'react';
import { XMarkIcon, CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';

const ATTACHMENT_TYPES = [
    { value: 'material', label: 'Material' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'other', label: 'Other' }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const AddAttachmentModal = ({ isOpen, onClose, onSubmit, loading, sessionId }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'material',
        file: null
    });
    const [dragActive, setDragActive] = useState(false);
    const [fileError, setFileError] = useState('');
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            setFileError('File size exceeds 10MB limit');
            return false;
        }
        setFileError('');
        return true;
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                setFormData(prev => ({
                    ...prev,
                    file,
                    name: prev.name || file.name.replace(/\.[^/.]+$/, '') // Use filename without extension as default name
                }));
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setFormData(prev => ({
                    ...prev,
                    file,
                    name: prev.name || file.name.replace(/\.[^/.]+$/, '') // Use filename without extension as default name
                }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.file) {
            alert('Please select a file to upload');
            return;
        }

        const submitData = new FormData();
        submitData.append('session_id', sessionId);
        submitData.append('file', formData.file);
        submitData.append('type', formData.type);
        if (formData.name) {
            submitData.append('name', formData.name);
        }

        onSubmit(submitData);
    };

    const handleClose = () => {
        setFormData({ name: '', type: 'material', file: null });
        setFileError('');
        onClose();
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                            Add Attachment
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* File Drop Zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : formData.file
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {formData.file ? (
                                <div className="space-y-2">
                                    <DocumentIcon className="mx-auto h-12 w-12 text-green-500" />
                                    <p className="text-sm font-medium text-gray-900">
                                        {formData.file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatFileSize(formData.file.size)}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { setFormData(prev => ({ ...prev, file: null })); setFileError(''); }}
                                        className="text-sm text-red-600 hover:text-red-700"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                        Drag and drop your file here, or{' '}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            browse
                                        </button>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Supports PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, images, video files (max 10MB)
                                    </p>
                                </div>
                            )}
                            {fileError && (
                                <p className="mt-2 text-sm text-red-600">{fileError}</p>
                            )}
                        </div>

                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Display Name (Optional)
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Lecture Notes Chapter 1"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                If left empty, the filename will be used
                            </p>
                        </div>

                        {/* Type Field */}
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                Attachment Type
                            </label>
                            <select
                                name="type"
                                id="type"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border px-3"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                {ATTACHMENT_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
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
                                disabled={loading || !formData.file}
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAttachmentModal;
