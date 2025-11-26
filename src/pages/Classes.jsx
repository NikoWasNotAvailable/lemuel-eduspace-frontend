import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { regionService, classService } from '../services';
import Layout from '../components/Layout/Layout';
import AddClassModal from '../components/AddClassModal';
import {
    MapPinIcon,
    AcademicCapIcon,
    ChevronRightIcon,
    ArrowLeftIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const Classes = () => {
    const ALL_GRADES = ['TKA', 'TKB', 'SD1', 'SD2', 'SD3', 'SD4', 'SD5', 'SD6', 'SMP1', 'SMP2', 'SMP3'];

    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [error, setError] = useState(null);
    const [viewingCategory, setViewingCategory] = useState(null); // For category-specific view (TK, SD, SMP)

    // Modal and form states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addingClass, setAddingClass] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});

    const navigate = useNavigate();

    // Load regions on component mount
    useEffect(() => {
        loadRegions();
    }, []);

    // Load classes when region is selected
    useEffect(() => {
        if (selectedRegion) {
            loadRegionClasses(selectedRegion.id);
        }
    }, [selectedRegion]);

    const loadRegions = async () => {
        try {
            setLoading(true);
            setError(null);
            const regionsData = await regionService.getAllRegions();
            setRegions(regionsData);
        } catch (error) {
            console.error('Failed to load regions:', error);
            setError('Failed to load regions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadRegionClasses = async (regionId) => {
        try {
            setLoadingClasses(true);
            const classesData = await classService.getClassesByRegion(regionId);
            setClasses(classesData);
        } catch (error) {
            console.error('Failed to load classes:', error);
            setError('Failed to load classes. Please try again.');
        } finally {
            setLoadingClasses(false);
        }
    };

    const handleRegionClick = (region) => {
        setSelectedRegion(region);
        setClasses([]); // Clear previous classes
    };

    const handleBackToRegions = () => {
        setSelectedRegion(null);
        setClasses([]);
        setExpandedCategories({});
        setViewingCategory(null);
    };

    const handleBackToGrades = () => {
        setViewingCategory(null);
    };

    const handleAddClass = async (classData) => {
        try {
            setAddingClass(true);
            await classService.createClass(classData);

            // Refresh classes for the selected region
            if (selectedRegion) {
                await loadRegionClasses(selectedRegion.id);
            }

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
        setViewingCategory(category);
    };

    const getClassesForCategory = (category) => {
        return classes.filter(cls => {
            const name = cls.name.toUpperCase();
            return name.startsWith(category);
        });
    };

    const getGradeCategory = (gradeName) => {
        if (gradeName.startsWith('TK')) return 'TK';
        if (gradeName.startsWith('SD')) return 'SD';
        if (gradeName.startsWith('SMP')) return 'SMP';
        return 'Other';
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
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-800 ml-4">
                                {viewingCategory
                                    ? `${viewingCategory} Classes in ${selectedRegion.name}`
                                    : selectedRegion
                                        ? `Classes in ${selectedRegion.name}`
                                        : 'Region'
                                }
                            </h1>
                        </div>

                        {/* Region navigation and action buttons */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                {viewingCategory ? (
                                    <button
                                        onClick={handleBackToGrades}
                                        className="flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                                    >
                                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                        Back to Grades
                                    </button>
                                ) : selectedRegion && (
                                    <button
                                        onClick={handleBackToRegions}
                                        className="flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                                    >
                                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                        Back to Regions
                                    </button>
                                )}
                            </div>

                            {selectedRegion && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-[#6B7280] text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-[#5B6170] transition"
                                >
                                    ADD CLASS
                                </button>
                            )}
                        </div>

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

                        {/* Main Content Area */}
                        {!loading && !selectedRegion ? (
                            /* Region Grid */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {regions.map((region) => (
                                    <div
                                        key={region.id}
                                        onClick={() => handleRegionClick(region)}
                                        className="bg-[#EAF2FF] h-28 rounded-xl flex flex-col items-center justify-center
                       text-xl font-semibold text-gray-800 cursor-pointer 
                       hover:bg-[#d8e9ff] transition shadow-sm"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <MapPinIcon className="h-6 w-6 text-blue-600" />
                                            <span>{region.name}</span>
                                        </div>

                                        <p className="text-sm text-gray-600 mt-1">
                                            Click to view classes
                                        </p>
                                    </div>
                                ))}
                            </div>


                        ) : selectedRegion && (
                            <div>
                                {loadingClasses ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">Loading classes...</span>
                                    </div>
                                ) : viewingCategory ? (
                                    /* Category-specific view (TK, SD, SMP) */
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold text-gray-800">{viewingCategory} Classes</h2>
                                            <button
                                                onClick={() => setIsAddModalOpen(true)}
                                                className="bg-[#6B7280] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#5B6170] transition flex items-center"
                                            >
                                                <PlusIcon className="h-4 w-4 mr-2" />
                                                Add {viewingCategory} Class
                                            </button>
                                        </div>

                                        {(() => {
                                            const categoryClasses = getClassesForCategory(viewingCategory);
                                            const categoryGrades = ALL_GRADES.filter(grade => grade.startsWith(viewingCategory));

                                            return (
                                                <div className="space-y-8">
                                                    {categoryGrades.map(grade => {
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
                                                                                className="bg-[#EAF2FF] h-20 flex items-center justify-center rounded-xl 
                                                                                   text-lg font-semibold text-gray-800 cursor-pointer 
                                                                                   hover:bg-[#d8e9ff] transition"
                                                                            >
                                                                                {cls.name}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Show overall empty state if no classes in category */}
                                                    {categoryClasses.length === 0 && (
                                                        <div className="text-center py-12">
                                                            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No {viewingCategory} classes found</h3>
                                                            <p className="text-gray-600 mb-6">
                                                                There are no {viewingCategory} classes in {selectedRegion.name} region yet.
                                                            </p>
                                                            <button
                                                                onClick={() => setIsAddModalOpen(true)}
                                                                className="bg-[#6B7280] text-white px-4 py-2 rounded-lg hover:bg-[#5B6170] transition-colors flex items-center mx-auto"
                                                            >
                                                                <PlusIcon className="h-5 w-5 mr-2" />
                                                                Create First {viewingCategory} Class
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    /* Grades overview - show all grades even with no data */
                                    <div className="space-y-10">
                                        {(() => {
                                            const gradeCategories = getGradesByCategory();

                                            return Object.entries(gradeCategories).map(([category, grades]) => {
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
                                                            {grades.map(grade => {
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
                selectedRegionId={selectedRegion?.id}
                selectedCategory={viewingCategory}
            />
        </Layout>
    );
};

export default Classes;