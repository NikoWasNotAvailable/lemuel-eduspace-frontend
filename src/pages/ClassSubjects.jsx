import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subjectService, classService, teacherSubjectService } from '../services';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import AddSubjectModal from '../components/AddSubjectModal';
import AssignTeacherModal from '../components/AssignTeacherModal';
import EditSubjectModal from '../components/EditSubjectModal';
import {
    BookOpenIcon,
    ArrowLeftIcon,
    PlusIcon,
    AcademicCapIcon,
    UserPlusIcon,
    UserIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const ClassSubjects = () => {
    const { regionId, classId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [classInfo, setClassInfo] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [subjectTeachers, setSubjectTeachers] = useState({}); // Map of subjectId -> teachers[]
    const [teacherAssignments, setTeacherAssignments] = useState([]); // For filtering teacher's subjects
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addingSubject, setAddingSubject] = useState(false);

    // Assign teacher modal states
    const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState(false);
    const [selectedSubjectForAssignment, setSelectedSubjectForAssignment] = useState(null);
    const [assigningTeacher, setAssigningTeacher] = useState(false);

    // Edit modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [updatingSubject, setUpdatingSubject] = useState(false);

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

            // If user is teacher, load their assignments
            if (user?.role === 'teacher') {
                try {
                    const assignments = await teacherSubjectService.getTeacherSubjectAssignments({ teacher_id: user.id });
                    setTeacherAssignments(assignments || []);
                } catch (err) {
                    console.error('Failed to load teacher assignments:', err);
                }
            }

            // Load teachers for each subject
            await loadTeachersForSubjects(subjectsData);
        } catch (error) {
            console.error('Failed to load class data:', error);
            setError('Failed to load class information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadTeachersForSubjects = async (subjectsList) => {
        try {
            const teachersMap = {};
            await Promise.all(
                subjectsList.map(async (subject) => {
                    try {
                        const response = await teacherSubjectService.getSubjectTeachers(subject.id);
                        teachersMap[subject.id] = response.teachers || [];
                    } catch (err) {
                        console.error(`Failed to load teachers for subject ${subject.id}:`, err);
                        teachersMap[subject.id] = [];
                    }
                })
            );
            setSubjectTeachers(teachersMap);
        } catch (error) {
            console.error('Failed to load teachers for subjects:', error);
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
            await loadTeachersForSubjects(updatedSubjects);

            setIsAddModalOpen(false);
            setError(null);
        } catch (error) {
            console.error('Failed to add subject:', error);
            setError(error.response?.data?.detail || 'Failed to add subject. Please try again.');
        } finally {
            setAddingSubject(false);
        }
    };

    const handleOpenAssignTeacher = (e, subject) => {
        e.stopPropagation(); // Prevent navigation to subject sessions
        setSelectedSubjectForAssignment(subject);
        setIsAssignTeacherModalOpen(true);
    };

    const handleAssignTeachers = async ({ subjectId, teachersToAdd, teachersToRemove }) => {
        try {
            setAssigningTeacher(true);
            setError(null);

            // Remove teachers that were unselected
            for (const teacherId of teachersToRemove) {
                await teacherSubjectService.unassignTeacherFromSubject(teacherId, subjectId);
            }

            // Add newly selected teachers
            for (const teacherId of teachersToAdd) {
                await teacherSubjectService.assignTeacherToSubject({
                    teacher_id: teacherId,
                    subject_id: subjectId
                });
            }

            // Refresh teachers for this subject
            const response = await teacherSubjectService.getSubjectTeachers(subjectId);
            setSubjectTeachers(prev => ({
                ...prev,
                [subjectId]: response.teachers || []
            }));

            setIsAssignTeacherModalOpen(false);
            setSelectedSubjectForAssignment(null);
        } catch (error) {
            console.error('Failed to assign teachers:', error);
            setError(error.response?.data?.detail || 'Failed to assign teachers. Please try again.');
        } finally {
            setAssigningTeacher(false);
        }
    };

    const handleSubjectClick = (subject) => {
        // Navigate to subject sessions or subject detail page
        navigate(`/subjects/${subject.id}/sessions`);
    };

    const handleEditSubject = (e, subject) => {
        e.stopPropagation();
        setEditingSubject(subject);
        setIsEditModalOpen(true);
    };

    const handleUpdateSubject = async (formData) => {
        try {
            setUpdatingSubject(true);
            await subjectService.updateSubject(editingSubject.id, formData);

            // Refresh subjects
            const updatedSubjects = await subjectService.getSubjectsByClass(classId);
            setSubjects(updatedSubjects);
            await loadTeachersForSubjects(updatedSubjects);

            setIsEditModalOpen(false);
            setEditingSubject(null);
            setError(null);
        } catch (error) {
            console.error('Failed to update subject:', error);
            setError(error.response?.data?.detail || 'Failed to update subject. Please try again.');
        } finally {
            setUpdatingSubject(false);
        }
    };

    const handleDeleteSubject = async (e, subjectId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
            return;
        }

        try {
            await subjectService.deleteSubject(subjectId);

            // Refresh subjects
            const updatedSubjects = await subjectService.getSubjectsByClass(classId);
            setSubjects(updatedSubjects);
            await loadTeachersForSubjects(updatedSubjects);

            setError(null);
        } catch (error) {
            console.error('Failed to delete subject:', error);
            setError(error.response?.data?.detail || 'Failed to delete subject. Please try again.');
        }
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
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-[#6B7280] text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-[#5B6170] transition"
                                >
                                    ADD SUBJECT
                                </button>
                            )}
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
                            (() => {
                                // Filter subjects for teacher
                                let displaySubjects = subjects;
                                if (user?.role === 'teacher' && teacherAssignments.length > 0) {
                                    const assignedSubjectIds = teacherAssignments.map(a => a.subject_id);
                                    displaySubjects = subjects.filter(s => assignedSubjectIds.includes(s.id));
                                }

                                return displaySubjects.length === 0 ? (
                                    <div className="text-center py-12">
                                        <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects found</h3>
                                        <p className="text-gray-600 mb-6">
                                            {user?.role === 'teacher'
                                                ? 'You are not assigned to any subjects in this class.'
                                                : (classInfo ? `There are no subjects for ${classInfo.name} yet.` : 'There are no subjects for this class yet.')}
                                        </p>
                                        <button
                                            onClick={() => setIsAddModalOpen(true)}
                                            className={`bg-[#6B7280] text-white px-4 py-2 rounded-lg hover:bg-[#5B6170] transition-colors flex items-center mx-auto ${user?.role !== 'admin' ? 'hidden' : ''}`}
                                        >
                                            <PlusIcon className="h-5 w-5 mr-2" />
                                            Create First Subject
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {displaySubjects.map((subject) => {
                                            const teachers = subjectTeachers[subject.id] || [];

                                            return (
                                                <div
                                                    key={subject.id}
                                                    onClick={() => handleSubjectClick(subject)}
                                                    className="bg-[#EAF2FF] min-h-32 rounded-xl flex flex-col items-center justify-center
                                                        text-lg font-semibold text-gray-800 cursor-pointer 
                                                        hover:bg-[#d8e9ff] transition shadow-sm p-4 relative group"
                                                >
                                                    {/* Action Buttons */}
                                                    {user?.role === 'admin' && (
                                                        <div className="absolute top-2 right-2 flex gap-1">
                                                            {/* Assign Teacher Button */}
                                                            <button
                                                                onClick={(e) => handleOpenAssignTeacher(e, subject)}
                                                                className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                                                                title="Assign Teachers"
                                                            >
                                                                <UserPlusIcon className="h-4 w-4 text-blue-600" />
                                                            </button>
                                                            {/* Edit/Delete Buttons - shown on hover */}
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => handleEditSubject(e, subject)}
                                                                    className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                                                                    title="Edit subject"
                                                                >
                                                                    <PencilIcon className="h-4 w-4 text-blue-600" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleDeleteSubject(e, subject.id)}
                                                                    className="p-1.5 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                                                                    title="Delete subject"
                                                                >
                                                                    <TrashIcon className="h-4 w-4 text-red-600" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <BookOpenIcon className="h-8 w-8 text-blue-600 mb-2" />
                                                    <span className="text-center">{subject.name}</span>

                                                    {/* Teachers Display */}
                                                    {teachers.length > 0 ? (
                                                        <div className="mt-2 flex items-center text-sm text-gray-600">
                                                            <UserIcon className="h-4 w-4 mr-1" />
                                                            <span className="truncate max-w-[150px]">
                                                                {teachers.map(t => t.name).join(', ')}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2 text-xs text-gray-400 italic">
                                                            No teacher assigned
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()
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

            {/* Assign Teacher Modal */}
            <AssignTeacherModal
                isOpen={isAssignTeacherModalOpen}
                onClose={() => {
                    setIsAssignTeacherModalOpen(false);
                    setSelectedSubjectForAssignment(null);
                }}
                onSubmit={handleAssignTeachers}
                loading={assigningTeacher}
                subjectId={selectedSubjectForAssignment?.id}
                subjectName={selectedSubjectForAssignment?.name}
                currentTeachers={selectedSubjectForAssignment ? (subjectTeachers[selectedSubjectForAssignment.id] || []) : []}
            />

            {/* Edit Subject Modal */}
            <EditSubjectModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingSubject(null);
                }}
                onSubmit={handleUpdateSubject}
                loading={updatingSubject}
                subjectData={editingSubject}
            />
        </Layout>
    );
};

export default ClassSubjects;