import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { regionService, classService } from '../services';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import AddClassModal from '../components/AddClassModal';
import EditClassModal from '../components/EditClassModal';
import {
    AcademicCapIcon,
    ArrowLeftIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const GradeClasses = () => {
    const { regionId, category } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const ALL_GRADES = ['TKA', 'TKB', 'SD1', 'SD2', 'SD3', 'SD4', 'SD5', 'SD6', 'SMP1', 'SMP2', 'SMP3'];

    const [regionInfo, setRegionInfo] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addingClass, setAddingClass] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [updatingClass, setUpdatingClass] = useState(false);

    // Load region info and classes on component mount
    useEffect(() => {
        if (regionId) {
            loadRegionAndClasses();
        }
    }, [regionId]);

    const loadRegionAndClasses = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load region info and classes in parallel
            const [regionData, classesData] = await Promise.all([
                regionService.getRegionById(regionId),
                classService.getClassesByRegion(regionId)
            ]);

            setRegionInfo(regionData);
            setClasses(classesData);
        } catch (error) {
            console.error('Failed to load region data:', error);
            setError('Failed to load region information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async (classData) => {
        try {
            setAddingClass(true);
            await classService.createClass(classData);

            // Refresh classes for the selected region
            const updatedClasses = await classService.getClassesByRegion(regionId);
            setClasses(updatedClasses);

            setIsAddModalOpen(false);
            setError(null);
        } catch (error) {
            console.error('Failed to add class:', error);
            setError(error.response?.data?.detail || 'Failed to add class. Please try again.');
        } finally {
            setAddingClass(false);
        }
    };

    const handleEditClass = (cls, e) => {
        e.stopPropagation();
        setEditingClass(cls);
        setIsEditModalOpen(true);
    };

    const handleUpdateClass = async (formData) => {
        try {
            setUpdatingClass(true);
            await classService.updateClass(editingClass.id, formData);

            // Refresh classes
            const updatedClasses = await classService.getClassesByRegion(regionId);
            setClasses(updatedClasses);

            setIsEditModalOpen(false);
            setEditingClass(null);
            setError(null);
        } catch (error) {
            console.error('Failed to update class:', error);
            setError(error.response?.data?.detail || 'Failed to update class. Please try again.');
        } finally {
            setUpdatingClass(false);
        }
    };

    const handleDeleteClass = async (classId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            return;
        }

        try {
            await classService.deleteClass(classId);

            // Refresh classes
            const updatedClasses = await classService.getClassesByRegion(regionId);
            setClasses(updatedClasses);

            setError(null);
        } catch (error) {
            console.error('Failed to delete class:', error);
            setError(error.response?.data?.detail || 'Failed to delete class. Please try again.');
        }
    };

    const getClassesForCategory = (category) => {
        let filteredClasses = classes.filter(cls => {
            const name = cls.name.toUpperCase();
            return name.startsWith(category);
        });

        // Filter for student: only show their assigned class
        if (user?.role === 'student' && user?.class_id) {
            filteredClasses = filteredClasses.filter(cls => cls.id === user.class_id);
        }

        return filteredClasses;
    };

    const getCategoryGrades = () => {
        let grades = ALL_GRADES.filter(grade => grade.startsWith(category));
        
        // Filter for student: only show their assigned grade
        if (user?.role === 'student' && user?.grade) {
            grades = grades.filter(g => g === user.grade);
        }
        
        return grades;
    };

    return (
        <Layout>
            <div className="flex bg-white min-h-[calc(100vh-4rem)]">
                <div className="flex-1 transition-all duration-300">
                    <div className="p-8">
                        {/* Header with back button */}
                        <div className="mb-6 flex justify-start">
                            <button
                                onClick={() => navigate(`/classes/${regionId}`)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-800 ml-4">
                                {regionInfo ? `${category} Classes in ${regionInfo.name}` : `${category} Classes`}
                            </h1>
                        </div>

                        {/* Navigation and action buttons */}
                        <div className="flex items-center justify-between mb-6">
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-[#6B7280] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#5B6170] transition flex items-center"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add {category} Class
                                </button>
                            )}
                        </div>

                        {/* Region Info Card */}
                        {/* {regionInfo && (
                            <div className="bg-[#EAF2FF] rounded-lg p-6 mb-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">{category} Classes</h2>
                                        <p className="text-gray-600 mt-1">Region: {regionInfo.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-800">{getClassesForCategory(category).length}</p>
                                        <p className="text-sm text-gray-600">{category} Classes</p>
                                    </div>
                                </div>
                            </div>
                        )} */}

                        {/* Error display */}
                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* Loading state */}
                        {loading && (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                        )}

                        {/* Category-specific view */}
                        {!loading && (
                            <div className="space-y-8">
                                {(() => {
                                    const categoryClasses = getClassesForCategory(category);
                                    const categoryGrades = getCategoryGrades();

                                    return categoryGrades.map(grade => {
                                        const gradeClasses = classes.filter(cls => cls.name.toUpperCase().startsWith(grade));

                                        return (
                                            <div key={grade}>
                                                {/* Grade Header */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-800">{grade}</h3>
                                                    <span className="text-sm text-gray-500">{gradeClasses.length} classes</span>
                                                </div>

                                                {/* Grade Classes */}
                                                {gradeClasses.length === 0 ? (
                                                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                                        <AcademicCapIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-gray-500 text-sm">No {grade} classes yet</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                        {gradeClasses.map(cls => (
                                                            <div
                                                                key={cls.id}
                                                                className="bg-[#EAF2FF] h-20 rounded-xl relative group
                                                                   hover:bg-[#d8e9ff] transition"
                                                            >
                                                                <div
                                                                    onClick={() => navigate(`/classes/${regionId}/class/${cls.id}`)}
                                                                    className="flex items-center justify-center h-full cursor-pointer
                                                                       text-lg font-semibold text-gray-800"
                                                                >
                                                                    {cls.name}
                                                                </div>
                                                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={(e) => handleEditClass(cls, e)}
                                                                        className="bg-white p-1.5 rounded-md shadow-md hover:bg-gray-100 transition"
                                                                        title="Edit class"
                                                                    >
                                                                        <PencilIcon className="h-4 w-4 text-blue-600" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleDeleteClass(cls.id, e)}
                                                                        className="bg-white p-1.5 rounded-md shadow-md hover:bg-gray-100 transition"
                                                                        title="Delete class"
                                                                    >
                                                                        <TrashIcon className="h-4 w-4 text-red-600" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                })()}

                                {/* Show overall empty state if no classes in category */}
                                {getClassesForCategory(category).length === 0 && (
                                    <div className="text-center py-12">
                                        <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No {category} classes found</h3>
                                        <p className="text-gray-600 mb-6">
                                            There are no {category} classes in {regionInfo?.name} region yet.
                                        </p>
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className={`bg-[#6B7280] text-white px-4 py-2 rounded-lg hover:bg-[#5B6170] transition-colors flex items-center mx-auto ${user?.role !== 'admin' ? 'hidden' : ''}`}
                                        >
                                            <PlusIcon className="h-5 w-5 mr-2" />
                                            Create First {category} Class
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Class Modal */}
            <AddClassModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddClass}
                loading={addingClass}
                selectedRegionId={regionId}
                selectedCategory={category}
            />

            {/* Edit Class Modal */}
            <EditClassModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingClass(null);
                }}
                onSubmit={handleUpdateClass}
                loading={updatingClass}
                classData={editingClass}
            />
        </Layout>
    );
};

export default GradeClasses;