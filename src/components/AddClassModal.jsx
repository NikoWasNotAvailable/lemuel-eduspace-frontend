import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { regionService } from '../services';
import { parseBackendErrors } from '../utils';

const AddClassModal = ({ isOpen, onClose, onSubmit, loading, selectedRegionId, selectedGrade, selectedCategory }) => {
    const VALID_GRADES = ['TKA', 'TKB', 'SD1', 'SD2', 'SD3', 'SD4', 'SD5', 'SD6', 'SMP1', 'SMP2', 'SMP3'];

    const getGradesByCategory = (category) => {
        if (!category) return VALID_GRADES;
        return VALID_GRADES.filter(grade => grade.startsWith(category));
    };

    const [formData, setFormData] = useState({
        grade: '',
        suffix: '',
        region_id: selectedRegionId || ''
    });

    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
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

    // Update region_id when selectedRegionId changes
    useEffect(() => {
        if (selectedRegionId) {
            setFormData(prev => ({
                ...prev,
                region_id: selectedRegionId
            }));
        }
    }, [selectedRegionId]);

    // Update grade when selectedGrade changes
    useEffect(() => {
        if (selectedGrade) {
            setFormData(prev => ({
                ...prev,
                grade: selectedGrade
            }));
        }
    }, [selectedGrade]);

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

    // Get the full class name
    const getClassName = () => {
        if (!formData.grade) return '';
        return formData.suffix ? `${formData.grade}${formData.suffix}` : formData.grade;
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.grade) newErrors.grade = 'Grade is required';
        if (!formData.region_id) newErrors.region_id = 'Region is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData = {
                name: getClassName(),
                region_id: formData.region_id
            };
            try {
                setGeneralError('');
                await onSubmit(submitData);
            } catch (error) {
                const { fieldErrors, generalError: genErr } = parseBackendErrors(error);
                setErrors(prev => ({ ...prev, ...fieldErrors }));
                if (genErr) setGeneralError(genErr);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            grade: selectedGrade || '',
            suffix: '',
            region_id: selectedRegionId || ''
        });
        setErrors({});
        setGeneralError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-[90%] max-w-md mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Add New Class</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {generalError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{generalError}</p>
                        </div>
                    )}
                    <div className="space-y-4">
                        {/* Grade Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Grade <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="grade"
                                value={formData.grade}
                                onChange={handleInputChange}
                                disabled={selectedGrade}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.grade ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} ${selectedGrade ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            >
                                <option value="" className="text-gray-500">
                                    {selectedCategory ? `Select ${selectedCategory} grade` : 'Select grade'}
                                </option>
                                {selectedCategory ? (
                                    // Show only grades from selected category
                                    getGradesByCategory(selectedCategory).map(grade => (
                                        <option key={grade} value={grade} className="text-gray-900">
                                            {grade}
                                        </option>
                                    ))
                                ) : (
                                    // Show all grades grouped
                                    <>
                                        <optgroup label="TK (Taman Kanak-kanak)">
                                            <option value="TKA" className="text-gray-900">TKA</option>
                                            <option value="TKB" className="text-gray-900">TKB</option>
                                        </optgroup>
                                        <optgroup label="SD (Sekolah Dasar)">
                                            <option value="SD1" className="text-gray-900">SD1</option>
                                            <option value="SD2" className="text-gray-900">SD2</option>
                                            <option value="SD3" className="text-gray-900">SD3</option>
                                            <option value="SD4" className="text-gray-900">SD4</option>
                                            <option value="SD5" className="text-gray-900">SD5</option>
                                            <option value="SD6" className="text-gray-900">SD6</option>
                                        </optgroup>
                                        <optgroup label="SMP (Sekolah Menengah Pertama)">
                                            <option value="SMP1" className="text-gray-900">SMP1</option>
                                            <option value="SMP2" className="text-gray-900">SMP2</option>
                                            <option value="SMP3" className="text-gray-900">SMP3</option>
                                        </optgroup>
                                    </>
                                )}
                            </select>
                            {errors.grade && <p className="text-red-500 text-xs mt-2">{errors.grade}</p>}
                        </div>

                        {/* Optional Suffix */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Identifier (Optional)
                            </label>
                            <input
                                type="text"
                                name="suffix"
                                value={formData.suffix}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all bg-white"
                                placeholder="e.g., A, B, Alpha, Beta (optional)"
                                maxLength="10"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This will be added after the grade (e.g., SD1A, TKB-Alpha)
                            </p>
                        </div>

                        {/* Preview */}
                        {formData.grade && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Class name preview:</span> {getClassName()}
                                </p>
                            </div>
                        )}

                        {/* Region */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Region <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="region_id"
                                value={formData.region_id}
                                onChange={handleInputChange}
                                disabled={loadingRegions || selectedRegionId}
                                className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all ${errors.region_id ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
                                    ${loadingRegions || selectedRegionId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
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
                            {loading ? 'Adding...' : 'Add Class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClassModal;