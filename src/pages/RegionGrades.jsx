import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { regionService, classService } from '../services';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import AddClassModal from '../components/AddClassModal';
import {
    AcademicCapIcon,
    ArrowLeftIcon,
    PlusIcon
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
                            <button
                                onClick={() => navigate('/classes')}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-800 ml-4">
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
                                                                                onClick={() => navigate(`/classes/${regionId}/class/${cls.id}`)}
                                                                                className="bg-[#EAF2FF] h-16 flex items-center justify-center rounded-lg 
                                                                                           text-sm font-medium text-gray-800 cursor-pointer 
                                                                                           hover:bg-[#d8e9ff] transition"
                                                                            >
                                                                                {cls.name}
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
        </Layout>
    );
};

export default RegionGrades;