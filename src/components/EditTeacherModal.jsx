import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { regionService } from '../services';

const EditTeacherModal = ({ isOpen, onClose, onSubmit, teacher, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        gender: '',
        region_id: '',
        dob: '',
        birth_place: '',
        address: '',
        religion: '',
        status: 'active'
    });

    const [errors, setErrors] = useState({});
    const [regions, setRegions] = useState([]);
    const [loadingRegions, setLoadingRegions] = useState(false);

    // Load regions when modal opens
    useEffect(() => {
        const loadRegions = async () => {
            if (isOpen) {
                setLoadingRegions(true);
                try {
                    const regionsData = await regionService.getAllRegions();
                    setRegions(regionsData);
                } catch (error) {
                    console.error('Failed to load regions:', error);
                } finally {
                    setLoadingRegions(false);
                }
            }
        };
        loadRegions();
    }, [isOpen]);

    useEffect(() => {
        if (teacher) {
            setFormData({
                name: teacher.name || '',
                email: teacher.email || '',
                password: teacher.password || '',
                gender: teacher.gender || '',
                region_id: teacher.region_id || '',
                dob: teacher.dob || '',
                birth_place: teacher.birth_place || '',
                address: teacher.address || '',
                religion: teacher.religion || '',
                status: teacher.status || 'active'
            });
        }
    }, [teacher]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password.trim()) newErrors.password = 'Password is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.region_id) newErrors.region_id = 'Region is required';
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
        if (!formData.birth_place.trim()) newErrors.birth_place = 'Birth place is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.religion) newErrors.religion = 'Religion is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
            setErrors({});
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-[60%] max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Teacher</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="h-7 w-7" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                                placeholder="Enter full name"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-2">{errors.name}</p>}
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.dob ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                            />
                            {errors.dob && <p className="text-red-500 text-xs mt-2">{errors.dob}</p>}
                        </div>

                        {/* Birth Place */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Birth Place <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="birth_place"
                                value={formData.birth_place}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.birth_place ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                                placeholder="Enter birth place"
                            />
                            {errors.birth_place && <p className="text-red-500 text-xs mt-2">{errors.birth_place}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                                placeholder="Enter email address"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                                placeholder="Update password"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password}</p>}
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                            >
                                <option value="" className="text-gray-500">Select gender</option>
                                <option value="male" className="text-gray-900">Male</option>
                                <option value="female" className="text-gray-900">Female</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-xs mt-2">{errors.gender}</p>}
                        </div>

                        {/* Region */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Region <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="region_id"
                                value={formData.region_id}
                                onChange={handleInputChange}
                                disabled={loadingRegions}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.region_id ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
                                    ${loadingRegions ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            >
                                <option value="" className="text-gray-500">
                                    {loadingRegions ? 'Loading regions...' : 'Select region'}
                                </option>
                                {regions.map((region) => (
                                    <option key={region.id} value={region.id} className="text-gray-900">
                                        {region.name}
                                    </option>
                                ))}
                            </select>
                            {errors.region_id && <p className="text-red-500 text-xs mt-2">{errors.region_id}</p>}
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                                placeholder="Enter address"
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-2">{errors.address}</p>}
                        </div>

                        {/* Religion */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Religion <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="religion"
                                value={formData.religion}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.religion ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                            >
                                <option value="" className="text-gray-500">Select religion</option>
                                <option value="islam" className="text-gray-900">Islam</option>
                                <option value="christianity" className="text-gray-900">Christianity</option>
                                <option value="buddhism" className="text-gray-900">Buddhism</option>
                                <option value="hinduism" className="text-gray-900">Hinduism</option>
                                <option value="other" className="text-gray-900">Other</option>
                            </select>
                            {errors.religion && <p className="text-red-500 text-xs mt-2">{errors.religion}</p>}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 bg-white rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                            >
                                <option value="active" className="text-gray-900">Active</option>
                                <option value="inactive" className="text-gray-900">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-8 border-t border-gray-200 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-semibold transition-all"
                        >
                            {loading ? 'Updating Teacher...' : 'Update Teacher'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTeacherModal;