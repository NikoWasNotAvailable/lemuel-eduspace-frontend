import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherSubjectService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useAcademicYear } from '../context/AcademicYearContext';
import Layout from '../components/Layout/Layout';
import {
    AcademicCapIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';

const TeacherClasses = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeClassId, activeRegionId } = useAcademicYear();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user?.role === 'teacher' && user?.id) {
            loadTeacherSubjects();
        } else if (user?.role === 'student') {
            // Redirect students to their class page (use historical class if viewing past year)
            const classId = activeClassId || user?.class_id;
            const regionId = activeRegionId || user?.region_id;
            if (classId && regionId) {
                navigate(`/classes/${regionId}/class/${classId}`, { replace: true });
            }
        } else if (user?.role === 'admin') {
            // Redirect admin to regions list
            navigate('/classes', { replace: true });
        }
    }, [user, navigate, activeClassId, activeRegionId]);

    const loadTeacherSubjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await teacherSubjectService.getTeacherSubjects(user.id);
            // Extract subjects array from response
            const subjectsArray = response?.subjects || [];
            setSubjects(subjectsArray);
        } catch (error) {
            console.error('Failed to load teacher subjects:', error);
            setError('Failed to load your subjects. Please try again.');
            setSubjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectClick = (subject) => {
        // Navigate to the subject sessions page using the subject path
        navigate(`/subjects/${subject.id}/sessions`);
    };

    // Group subjects by class
    const subjectsByClass = Array.isArray(subjects) ? subjects.reduce((acc, subject) => {
        const classId = subject.class_id;
        if (!acc[classId]) {
            acc[classId] = {
                class_id: subject.class_id,
                class_name: subject.class_name,
                subjects: []
            };
        }
        acc[classId].subjects.push(subject);
        return acc;
    }, {}) : {};

    return (
        <Layout>
            <div className="flex bg-white min-h-[calc(100vh-4rem)]">
                <div className="flex-1 transition-all duration-300">
                    <div className="p-8">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold text-gray-800">
                                My Classes & Subjects
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                View all classes and subjects you teach
                            </p>
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

                        {/* Classes and Subjects */}
                        {!loading && Object.keys(subjectsByClass).length === 0 && (
                            <div className="text-center py-12">
                                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects assigned</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    You haven't been assigned to teach any subjects yet.
                                </p>
                            </div>
                        )}

                        {!loading && Object.keys(subjectsByClass).length > 0 && (
                            <div className="space-y-8">
                                {Object.values(subjectsByClass).map(({ class_id, class_name, subjects: classSubjects }) => (
                                    <div key={class_id} className="bg-gray-50 rounded-lg p-6">
                                        <div className="flex items-center mb-4">
                                            <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-2" />
                                            <h2 className="text-xl font-semibold text-gray-800">
                                                {class_name}
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {classSubjects.map((subject) => (
                                                <div
                                                    key={subject.id}
                                                    onClick={() => handleSubjectClick(subject)}
                                                    className="bg-white border-2 border-blue-200 rounded-lg p-4 cursor-pointer
                                                        hover:bg-blue-50 hover:border-blue-400 transition shadow-sm"
                                                >
                                                    <div className="flex items-center">
                                                        <BookOpenIcon className="h-5 w-5 text-blue-600 mr-2" />
                                                        <h3 className="text-base font-semibold text-gray-800">
                                                            {subject.name}
                                                        </h3>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Click to view sessions
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default TeacherClasses;
