import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subjectService, classService } from '../services';
import Layout from '../components/Layout/Layout';
import AddSubjectModal from '../components/AddSubjectModal';
import {
    BookOpenIcon,
    ArrowLeftIcon,
    PlusIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

const ClassSubjects = () => {
    const { regionId, classId } = useParams();
    const navigate = useNavigate();

    const [classInfo, setClassInfo] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addingSubject, setAddingSubject] = useState(false);

    // Load class info and subjects on component mount
    useEffect(() => {
        if (classId) {
            loadClassAndSubjects();
        }
    }, [classId]);

    const loadClassAndSubjects = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load class info and subjects in parallel
            const [classData, subjectsData] = await Promise.all([
                classService.getClassById(classId),
                subjectService.getSubjectsByClass(classId)
            ]);

            setClassInfo(classData);
            setSubjects(subjectsData);
        } catch (error) {
            console.error('Failed to load class data:', error);
            setError('Failed to load class information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async (subjectData) => {
        try {
            setAddingSubject(true);

            // Add class_id to subject data
            const subjectWithClass = {
                ...subjectData,
                class_id: parseInt(classId)
            };

            await subjectService.createSubject(subjectWithClass);

            // Refresh subjects list
            const updatedSubjects = await subjectService.getSubjectsByClass(classId);
            setSubjects(updatedSubjects);

            setIsAddModalOpen(false);
            setError(null);
        } catch (error) {
            console.error('Failed to add subject:', error);
            setError(error.response?.data?.detail || 'Failed to add subject. Please try again.');
        } finally {
            setAddingSubject(false);
        }
    };

    const handleSubjectClick = (subject) => {
        // Navigate to subject sessions or subject detail page
        navigate(`/subjects/${subject.id}/sessions`);
    };

    const handleBackToClasses = () => {
        // Use regionId from URL params, fallback to classInfo.region.id
        const targetRegionId = regionId || classInfo?.region?.id;

        if (targetRegionId) {
            const gradeCategory = getGradeCategory(classInfo?.name);
            if (gradeCategory) {
                navigate(`/classes/${targetRegionId}/grade/${gradeCategory}`);
            } else {
                navigate(`/classes/${targetRegionId}`);
            }
        } else {
            navigate('/classes');
        }
    };

    const getGradeCategory = (className) => {
        if (!className) return null;
        const name = className.toUpperCase();
        if (name.startsWith('TK')) return 'TK';
        if (name.startsWith('SD')) return 'SD';
        if (name.startsWith('SMP')) return 'SMP';
        return null;
    };

    return (
        <Layout>
            <div className="flex bg-white min-h-[calc(100vh-4rem)]">
                <div className="flex-1 transition-all duration-300">
                    <div className="p-8">
                        {/* Header with back button */}
                        <div className="mb-6 flex justify-start">
                            <button
                                onClick={handleBackToClasses}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-800 ml-4">
                                {classInfo ? `${classInfo.name} Subjects` : 'Class Subjects'}
                            </h1>
                        </div>

                        {/* Navigation and action buttons */}
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-[#6B7280] text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-[#5B6170] transition"
                            >
                                ADD SUBJECT
                            </button>
                        </div>

                        {/* Class Info Card */}
                        {/* {classInfo && (
                            <div className="bg-[#EAF2FF] rounded-lg p-6 mb-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">{classInfo.name}</h2>
                                        <p className="text-gray-600 mt-1">
                                            Region: {classInfo.region?.name || 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-800">{subjects.length}</p>
                                        <p className="text-sm text-gray-600">Subjects</p>
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

                        {/* Subjects Grid */}
                        {!loading && (
                            subjects.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects found</h3>
                                    <p className="text-gray-600 mb-6">
                                        {classInfo ? `There are no subjects for ${classInfo.name} yet.` : 'There are no subjects for this class yet.'}
                                    </p>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="bg-[#6B7280] text-white px-4 py-2 rounded-lg hover:bg-[#5B6170] transition-colors flex items-center mx-auto"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Create First Subject
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {subjects.map((subject) => (
                                        <div
                                            key={subject.id}
                                            onClick={() => handleSubjectClick(subject)}
                                            className="bg-[#EAF2FF] h-32 rounded-xl flex flex-col items-center justify-center
                                       text-lg font-semibold text-gray-800 cursor-pointer 
                                       hover:bg-[#d8e9ff] transition shadow-sm p-4"
                                        >
                                            <BookOpenIcon className="h-8 w-8 text-blue-600 mb-2" />
                                            <span className="text-center">{subject.name}</span>
                                            {subject.class_name && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {subject.class_name}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Add Subject Modal */}
            <AddSubjectModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddSubject}
                loading={addingSubject}
                classId={classId}
                className={classInfo?.name}
            />
        </Layout>
    );
};

export default ClassSubjects;