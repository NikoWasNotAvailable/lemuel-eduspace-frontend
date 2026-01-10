import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { academicYearService } from '../services';
import {
    ArrowLeftIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    CameraIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const AcademicYears = () => {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingYear, setEditingYear] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        is_current: false
    });
    const [saving, setSaving] = useState(false);
    const [snapshotting, setSnapshotting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            setLoading(true);
            const data = await academicYearService.getAllYears();
            setYears(data);
        } catch (err) {
            console.error('Error fetching academic years:', err);
            setError('Failed to fetch academic years');
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddYear = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await academicYearService.createYear(formData);
            await fetchYears();
            setIsAddModalOpen(false);
            resetForm();
            showSuccess('Academic year created successfully');
        } catch (err) {
            console.error('Error creating academic year:', err);
            setError(err.response?.data?.detail || 'Failed to create academic year');
        } finally {
            setSaving(false);
        }
    };

    const handleEditYear = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await academicYearService.updateYear(editingYear.id, formData);
            await fetchYears();
            setIsEditModalOpen(false);
            setEditingYear(null);
            resetForm();
            showSuccess('Academic year updated successfully');
        } catch (err) {
            console.error('Error updating academic year:', err);
            setError(err.response?.data?.detail || 'Failed to update academic year');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteYear = async (yearId) => {
        if (!window.confirm('Are you sure you want to delete this academic year? This will also delete all associated user history.')) {
            return;
        }
        try {
            await academicYearService.deleteYear(yearId);
            await fetchYears();
            showSuccess('Academic year deleted successfully');
        } catch (err) {
            console.error('Error deleting academic year:', err);
            setError(err.response?.data?.detail || 'Failed to delete academic year');
        }
    };

    const handleSetCurrent = async (yearId) => {
        try {
            await academicYearService.setCurrentYear(yearId);
            await fetchYears();
            showSuccess('Current academic year updated');
        } catch (err) {
            console.error('Error setting current year:', err);
            setError(err.response?.data?.detail || 'Failed to set current year');
        }
    };

    const handleSnapshot = async () => {
        if (!window.confirm('This will save the current class/grade information for all users. Continue?')) {
            return;
        }
        try {
            setSnapshotting(true);
            const result = await academicYearService.snapshotUsers();
            showSuccess(result.message || 'Snapshot completed successfully');
        } catch (err) {
            console.error('Error creating snapshot:', err);
            setError(err.response?.data?.detail || 'Failed to create snapshot');
        } finally {
            setSnapshotting(false);
        }
    };

    const openEditModal = (year) => {
        setEditingYear(year);
        setFormData({
            name: year.name,
            start_date: year.start_date?.split('T')[0] || '',
            end_date: year.end_date?.split('T')[0] || '',
            is_current: year.is_current
        });
        setIsEditModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            start_date: '',
            end_date: '',
            is_current: false
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Layout>
            <div className="bg-white min-h-[calc(100vh-4rem)]">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-800 ml-4">Academic Years</h1>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSnapshot}
                                disabled={snapshotting}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition disabled:opacity-50"
                            >
                                <CameraIcon className="h-5 w-5" />
                                {snapshotting ? 'Snapshotting...' : 'Snapshot Users'}
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Add Year
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                            <button onClick={() => setError(null)} className="float-right font-bold">×</button>
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {successMessage}
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : (
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">ID</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Name</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Start Date</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">End Date</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Status</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {years.map(year => (
                                        <tr key={year.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-900 font-medium">{year.id}</td>
                                            <td className="px-6 py-4 text-gray-700 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                                                    {year.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{formatDate(year.start_date)}</td>
                                            <td className="px-6 py-4 text-gray-700">{formatDate(year.end_date)}</td>
                                            <td className="px-6 py-4">
                                                {year.is_current ? (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Current
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        Past
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {!year.is_current && (
                                                        <button
                                                            onClick={() => handleSetCurrent(year.id)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                            title="Set as current"
                                                        >
                                                            <CheckCircleIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openEditModal(year)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteYear(year.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {!loading && years.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No academic years found. Click "Add Year" to create one.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Academic Year</h2>
                        <form onSubmit={handleAddYear} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2025/2026"
                                    required
                                    className="w-full border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_current"
                                    id="is_current_add"
                                    checked={formData.is_current}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="is_current_add" className="text-sm text-gray-700">Set as current year</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Academic Year</h2>
                        <form onSubmit={handleEditYear} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border text-black border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_current"
                                    id="is_current_edit"
                                    checked={formData.is_current}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="is_current_edit" className="text-sm text-gray-700">Set as current year</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsEditModalOpen(false); setEditingYear(null); resetForm(); }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AcademicYears;
