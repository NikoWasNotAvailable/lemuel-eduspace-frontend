import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { regionService, classService } from '../services';

const AddStudentModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        nis: '',
        name: '',
        email: '',
        password: '',
        parent_password: '',
        role: 'student',
        grade: '',
        gender: '',
        region_id: '',
        class_id: '',
        dob: '',
        birth_place: '',
        religion: '',
        status: 'active',
        address: ''
    });

    const [errors, setErrors] = useState({});
    const [regions, setRegions] = useState([]);
    const [loadingRegions, setLoadingRegions] = useState(false);
    const [classes, setClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);

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

    // Load classes when region is selected
    useEffect(() => {
        const loadClasses = async () => {
            if (formData.region_id) {
                setLoadingClasses(true);
                try {
                    const classesData = await classService.getClassesByRegion(formData.region_id);
                    setClasses(classesData);
                } catch (error) {
                    console.error('Failed to load classes:', error);
                    setClasses([]);
                } finally {
                    setLoadingClasses(false);
                }
            } else {
                setClasses([]);
                setFormData(prev => ({ ...prev, class_id: '' }));
            }
        };
        loadClasses();
    }, [formData.region_id]);

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

        if (!formData.nis.trim()) newErrors.nis = 'NIS is required';
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password.trim()) newErrors.password = 'Password is required';
        if (!formData.parent_password.trim()) newErrors.parent_password = 'Parent password is required';
        if (!formData.grade) newErrors.grade = 'Grade is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.region_id) newErrors.region_id = 'Region is required';
        if (!formData.class_id) newErrors.class_id = 'Class is required';
        if (!formData.dob) newErrors.dob = 'Date of birth is required';
        if (!formData.birth_place.trim()) newErrors.birth_place = 'Birth place is required';
        if (!formData.religion) newErrors.religion = 'Religion is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const resetForm = () => {
        setFormData({
            nis: '',
            name: '',
            email: '',
            password: '',
            parent_password: '',
            role: 'student',
            grade: '',
            gender: '',
            region_id: '',
            class_id: '',
            dob: '',
            birth_place: '',
            religion: '',
            status: 'active',
            address: ''
        });
        setErrors({});
        setClasses([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0   bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-[60%] max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Add New Student</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="h-7 w-7" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                NIS <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nis"
                                value={formData.nis}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.nis ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                                placeholder="Enter NIS"
                            />
                            {errors.nis && <p className="text-red-500 text-xs mt-2">{errors.nis}</p>}
                        </div>

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
                                placeholder="Enter password"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Parent Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="parent_password"
                                value={formData.parent_password}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.parent_password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                                placeholder="Enter parent password"
                            />
                            {errors.parent_password && <p className="text-red-500 text-xs mt-2">{errors.parent_password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="role"
                                value={formData.role}
                                readOnly
                                className="w-full border border-gray-300 bg-gray-100 rounded-lg px-4 py-3 text-sm text-gray-900 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Grade <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="grade"
                                value={formData.grade}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.grade ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                            >
                                <option value="" className="text-gray-500">Select grade</option>
                                <option value="TKA" className="text-gray-900">TKA</option>
                                <option value="TKB" className="text-gray-900">TKB</option>
                                <option value="SD1" className="text-gray-900">SD1</option>
                                <option value="SD2" className="text-gray-900">SD2</option>
                                <option value="SD3" className="text-gray-900">SD3</option>
                                <option value="SD4" className="text-gray-900">SD4</option>
                                <option value="SD5" className="text-gray-900">SD5</option>
                                <option value="SD6" className="text-gray-900">SD6</option>
                                <option value="SMP1" className="text-gray-900">SMP1</option>
                                <option value="SMP2" className="text-gray-900">SMP2</option>
                                <option value="SMP3" className="text-gray-900">SMP3</option>
                            </select>
                            {errors.grade && <p className="text-red-500 text-xs mt-2">{errors.grade}</p>}
                        </div>

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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Class <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="class_id"
                                value={formData.class_id}
                                onChange={handleInputChange}
                                disabled={!formData.region_id || loadingClasses}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.class_id ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
                                    ${(!formData.region_id || loadingClasses) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            >
                                <option value="" className="text-gray-500">
                                    {!formData.region_id ? 'Select region first' : loadingClasses ? 'Loading classes...' : 'Select class'}
                                </option>
                                {classes.map((classItem) => (
                                    <option key={classItem.id} value={classItem.id} className="text-gray-900">
                                        {classItem.name}
                                    </option>
                                ))}
                            </select>
                            {errors.class_id && <p className="text-red-500 text-xs mt-2">{errors.class_id}</p>}
                        </div>

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
                                <option value="christian" className="text-gray-900">Christian</option>
                                <option value="catholic" className="text-gray-900">Catholic</option>
                                <option value="buddhism" className="text-gray-900">Buddhism</option>
                                <option value="hindu" className="text-gray-900">Hindu</option>
                                <option value="confucianism" className="text-gray-900">Confucianism</option>
                                <option value="other" className="text-gray-900">Other</option>
                            </select>
                            {errors.religion && <p className="text-red-500 text-xs mt-2">{errors.religion}</p>}
                        </div>

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
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-semibold transition-all"
                        >
                            {loading ? 'Adding Student...' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudentModal;