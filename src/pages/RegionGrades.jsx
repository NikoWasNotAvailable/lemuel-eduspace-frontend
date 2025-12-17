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

const RegionGrades = () => {
    const { regionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const ALL_GRADES = ['TKA', 'TKB', 'SD1', 'SD2', 'SD3', 'SD4', 'SD5', 'SD6', 'SMP1', 'SMP2', 'SMP3'];

    const [regionInfo, setRegionInfo] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [error, setError] = useState(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addingClass, setAddingClass] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [updatingClass, setUpdatingClass] = useState(false);

    // Redirect students to their class page
    useEffect(() => {
        if (user?.role === 'student' && user?.class_id && user?.region_id) {
            navigate(`/classes/${user.region_id}/class/${user.class_id}`, { replace: true });
        }
    }, [user, navigate]);

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

    const handleViewAllClick = (category) => {
        navigate(`/classes/${regionId}/grade/${category}`);
    };

    const getClassesForGrade = (grade) => {
        return classes.filter(cls => cls.name.toUpperCase().startsWith(grade));
    };

    const getGradesByCategory = () => {
        const categories = {
            TK: ALL_GRADES.filter(grade => grade.startsWith('TK')),
            SD: ALL_GRADES.filter(grade => grade.startsWith('SD')),
            SMP: ALL_GRADES.filter(grade => grade.startsWith('SMP'))
        };
        return categories;
    };

    return (
        <Layout>
            <div className="flex bg-white min-h-[calc(100vh-4rem)]">
                <div className="flex-1 transition-all duration-300">
                    <div className="p-8">
                        {/* Header with back button */}
                        <div className="mb-6 flex justify-start">
                            {user?.role !== 'student' && (
                                <button
                                    onClick={() => navigate('/classes')}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                                </button>
                            )}
                            <h1 className={`text-2xl font-semibold text-gray-800 ${user?.role !== 'student' ? 'ml-4' : ''}`}>
                                {regionInfo ? `Grades in ${regionInfo.name}` : 'Region Grades'}
                            </h1>
                        </div>

                        {/* Navigation and action buttons */}
                        <div className="flex items-center justify-between mb-6">
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-[#6B7280] text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-[#5B6170] transition"
                                >
                                    ADD CLASS
                                </button>
                            )}
                        </div>

                        {/* Region Info Card */}
                        {/* {regionInfo && (
                            <div className="bg-[#EAF2FF] rounded-lg p-6 mb-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">{regionInfo.name}</h2>
                                        <p className="text-gray-600 mt-1">Region Overview</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-800">{classes.length}</p>
                                        <p className="text-sm text-gray-600">Total Classes</p>
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

                        {/* Grades overview - show all grades even with no data */}
                        {!loading && (
                            <div className="space-y-10">
                                {(() => {
                                    const gradeCategories = getGradesByCategory();

                                    return Object.entries(gradeCategories).map(([category, grades]) => {
                                        // Filter grades for student
                                        let displayGrades = grades;
                                        if (user?.role === 'student' && user?.grade) {
                                            displayGrades = grades.filter(g => g === user.grade);
                                        }

                                        // If no grades to display in this category, skip it
                                        if (displayGrades.length === 0) return null;

                                        const categoryClasses = classes.filter(cls => {
                                            const name = cls.name.toUpperCase();
                                            return name.startsWith(category);
                                        });

                                        return (
                                            <div key={category}>
                                                {/* Category Header */}
                                                <div className="flex items-center justify-between mb-6">
                                                    <h2 className="text-xl font-semibold text-gray-800">{category} Grades</h2>
                                                    <button
                                                        onClick={() => handleViewAllClick(category)}
                                                        className="text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
                                                    >
                                                        View All
                                                    </button>
                                                </div>

                                                {/* Grades Grid - Show all grades */}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                                    {displayGrades.map(grade => {
                                                        const gradeClasses = getClassesForGrade(grade);
                                                        const hasClasses = gradeClasses.length > 0;

                                                        return (
                                                            <div key={grade} className="space-y-2">
                                                                {/* Grade Header */}
                                                                <div className="flex items-center justify-center">
                                                                    <h3 className="font-medium text-gray-700">{grade}</h3>
                                                                </div>

                                                                {/* Grade Classes Preview */}
                                                                <div className="space-y-2">
                                                                    {hasClasses ? (
                                                                        gradeClasses.slice(0, 2).map(cls => (
                                                                            <div
                                                                                key={cls.id}
                                                                                className="bg-[#EAF2FF] h-16 rounded-lg relative group
                                                                                           hover:bg-[#d8e9ff] transition"
                                                                            >
                                                                                <div
                                                                                    onClick={() => navigate(`/classes/${regionId}/class/${cls.id}`)}
                                                                                    className="flex items-center justify-center h-full cursor-pointer
                                                                                       text-sm font-medium text-gray-800"
                                                                                >
                                                                                    {cls.name}
                                                                                </div>
                                                                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    <button
                                                                                        onClick={(e) => handleEditClass(cls, e)}
                                                                                        className="bg-white p-1 rounded shadow-md hover:bg-gray-100 transition"
                                                                                        title="Edit class"
                                                                                    >
                                                                                        <PencilIcon className="h-3 w-3 text-blue-600" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={(e) => handleDeleteClass(cls.id, e)}
                                                                                        className="bg-white p-1 rounded shadow-md hover:bg-gray-100 transition"
                                                                                        title="Delete class"
                                                                                    >
                                                                                        <TrashIcon className="h-3 w-3 text-red-600" />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="bg-gray-100 h-16 flex items-center justify-center rounded-lg text-xs text-gray-500 border-2 border-dashed border-gray-300">
                                                                            No classes yet
                                                                        </div>
                                                                    )}

                                                                    {gradeClasses.length > 2 && (
                                                                        <div className="bg-gray-50 h-8 flex items-center justify-center rounded text-xs text-gray-600">
                                                                            +{gradeClasses.length - 2} more
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
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

export default RegionGrades;