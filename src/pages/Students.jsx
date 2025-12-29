import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import AddStudentModal from '../components/AddStudentModal';
import EditStudentModal from '../components/EditStudentModal';
import PromotionModal from '../components/PromotionModal';
import PromotionHistoryModal from '../components/PromotionHistoryModal';
import { userService, studentService } from '../services';
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    ClockIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [addingStudent, setAddingStudent] = useState(false);
    const [editingStudent, setEditingStudent] = useState(false);

    // Filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedEducationTier, setSelectedEducationTier] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await userService.getStudents({ limit: 1000 });
            setStudents(data);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to map grade to education tier
    const getEducationTier = (grade) => {
        if (!grade) return '';

        const gradeUpper = grade.toUpperCase();
        if (gradeUpper === 'TKA' || gradeUpper === 'TKB') {
            return 'Preschool';
        } else if (gradeUpper.startsWith('SD')) {
            return 'Elementary School';
        } else if (gradeUpper.startsWith('SMP')) {
            return 'Junior High School';
        } else {
            return ''; // default fallback
        }
    };

    // Filtering logic
    const filteredStudents = students.filter(student => {
        const matchesSearch =
            searchTerm === '' ||
            student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.nis?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGender =
            selectedGender === '' || student.gender === selectedGender;
        const matchesGrade =
            selectedGrade === '' || student.grade === selectedGrade;
        const matchesRegion =
            selectedRegion === '' || student.region === selectedRegion;
        const matchesEducationTier =
            selectedEducationTier === '' || getEducationTier(student.grade) === selectedEducationTier;
        return matchesSearch && matchesGender && matchesGrade && matchesRegion && matchesEducationTier;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedGender, selectedGrade, selectedRegion, selectedEducationTier]);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handleDeleteStudent = async id => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await studentService.deleteStudent(id);
                await fetchStudents();
                setSelectedStudent(null);
            } catch (err) {
                console.error('Error deleting student:', err);
                setError('Failed to delete student');
            }
        }
    };

    const handleAddStudent = async (studentData, profilePictureFile) => {
        try {
            setAddingStudent(true);
            const newStudent = await studentService.registerStudent(studentData);

            // Upload profile picture if provided
            if (profilePictureFile && newStudent?.id) {
                try {
                    await userService.uploadProfilePicture(profilePictureFile, newStudent.id);
                } catch (picErr) {
                    console.error('Error uploading profile picture:', picErr);
                    // Don't fail the whole operation if picture upload fails
                }
            }

            await fetchStudents(); // Refresh the list
            setIsAddModalOpen(false);
            setError(null);
        } catch (err) {
            console.error('Error adding student:', err);
            setError('Failed to add student. Please try again.');
        } finally {
            setAddingStudent(false);
        }
    };

    const handleEditStudent = async (studentData, profilePictureFile) => {
        try {
            setEditingStudent(true);
            await studentService.updateStudent(selectedStudent.id, studentData);

            // Upload profile picture if provided
            if (profilePictureFile) {
                try {
                    await userService.uploadProfilePicture(profilePictureFile, selectedStudent.id);
                } catch (picErr) {
                    console.error('Error uploading profile picture:', picErr);
                    // Don't fail the whole operation if picture upload fails
                }
            }

            await fetchStudents(); // Refresh the list
            setIsEditModalOpen(false);
            setSelectedStudent(null);
            setError(null);
        } catch (err) {
            console.error('Error updating student:', err);
            setError('Failed to update student. Please try again.');
        } finally {
            setEditingStudent(false);
        }
    };

    const openEditModal = () => {
        if (selectedStudent) {
            setIsEditModalOpen(true);
        }
    };

    return (
        <Layout>
            <div className="flex bg-white min-h-[calc(100vh-4rem)]">
                {/* Main Table Section */}
                <div className={`flex-1 transition-all duration-300 ${selectedStudent ? 'mr-[300px]' : ''}`}>
                    <div className="p-8">
                        {/* Back Button */}
                        <div className="mb-6 flex justify-start">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-800 ml-4">Students</h1>
                        </div>

                        {/* Search + Filters Row */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative max-w-md">
                                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full border text-black border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <select
                                    value={selectedGender}
                                    onChange={e => setSelectedGender(e.target.value)}
                                    className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 bg-white min-w-[100px]"
                                >
                                    <option value="">Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>

                                <select
                                    value={selectedGrade}
                                    onChange={e => setSelectedGrade(e.target.value)}
                                    className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 bg-white min-w-[100px]"
                                >
                                    <option value="">Grade</option>
                                    {['TKA', 'TKB', 'SD1', 'SD2', 'SD3', 'SD4', 'SD5', 'SD6', 'SMP1', 'SMP2', 'SMP3'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedRegion}
                                    onChange={e => setSelectedRegion(e.target.value)}
                                    className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 bg-white min-w-[100px]"
                                >
                                    <option value="">Region</option>
                                    {[...new Set(students.map(s => s.region).filter(Boolean))].sort().map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedEducationTier}
                                    onChange={e => setSelectedEducationTier(e.target.value)}
                                    className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px]"
                                >
                                    <option value="">Education Tier</option>
                                    <option value="Preschool">Preschool</option>
                                    <option value="Elementary School">Elementary School</option>
                                    <option value="Junior High School">Junior High School</option>
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsHistoryModalOpen(true)}
                                    className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition"
                                    title="Promotion History"
                                >
                                    <ClockIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setIsPromotionModalOpen(true)}
                                    className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-blue-700 transition"
                                >
                                    Mass Promotion
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-[#6B7280] text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-[#5B6170] transition"
                                >
                                    ADD
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* Student count */}
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">
                                Showing {startIndex + 1} - {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
                            </p>
                        </div>

                        {/* Table */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                                </div>
                            ) : (
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">PHOTO</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">NIS ID</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">FIRST NAME</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">LAST NAME</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">GENDER</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">GRADE</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">REGION</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">EDUCATION TIER</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentStudents.map(student => (
                                            <tr
                                                key={student.id}
                                                onClick={() => setSelectedStudent(student)}
                                                className={`cursor-pointer transition-colors text-start ${selectedStudent?.id === student.id
                                                    ? 'bg-blue-50 border-l-4 border-blue-500'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <td className="px-6 py-4">
                                                    {student.profile_picture_url ? (
                                                        <img
                                                            src={`${API_BASE_URL}${student.profile_picture_url}`}
                                                            alt={student.name}
                                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <UserCircleIcon 
                                                        className={`w-10 h-10 text-gray-400 ${student.profile_picture_url ? 'hidden' : ''}`}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 font-medium">{student.nis || ''}</td>
                                                <td className="px-6 py-4 text-gray-700">{student.name?.split(' ')[0] || ''}</td>
                                                <td className="px-6 py-4 text-gray-700">{student.name?.split(' ').slice(1).join(' ') || ''}</td>
                                                <td className="px-6 py-4 text-gray-700 capitalize">{student.gender || ''}</td>
                                                <td className="px-6 py-4 text-gray-700 font-medium">{student.grade || ''}</td>
                                                <td className="px-6 py-4 text-gray-700">{student.region || ''}</td>
                                                <td className="px-6 py-4 text-gray-700">{getEducationTier(student.grade)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {!loading && filteredStudents.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No students found.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button
                                    onClick={goToPreviousPage}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, index) => {
                                    const page = index + 1;
                                    const isCurrentPage = page === currentPage;

                                    // Show first page, last page, current page, and pages around current page
                                    const showPage = page === 1 || page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1);

                                    if (!showPage) {
                                        // Show ellipsis
                                        if (page === currentPage - 2 || page === currentPage + 2) {
                                            return <span key={page} className="px-2 text-gray-500">...</span>;
                                        }
                                        return null;
                                    }

                                    return (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`w-8 h-8 rounded-full font-medium text-sm ${isCurrentPage
                                                ? 'bg-orange-500 text-white'
                                                : 'hover:bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-500'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Student Detail */}
                {selectedStudent && (
                    <div className="fixed right-0 top-16 w-[380px] h-[calc(100vh-4rem)] bg-white border-l border-gray-200 flex flex-col shadow-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-xl font-bold text-gray-800">Student Details</h2>
                            <button onClick={() => setSelectedStudent(null)}>
                                <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
                            {/* Profile Picture */}
                            <div className="flex justify-center">
                                {selectedStudent.profile_picture_url ? (
                                    <img
                                        src={`${API_BASE_URL}${selectedStudent.profile_picture_url}`}
                                        alt={selectedStudent.name}
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`w-24 h-24 rounded-full bg-gray-100 items-center justify-center ${selectedStudent.profile_picture_url ? 'hidden' : 'flex'}`}>
                                    <UserCircleIcon className="w-20 h-20 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Region</p>
                                <p className="text-gray-900 font-bold text-base mt-1">{selectedStudent.region || ''}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">NIS ID</p>
                                <p className="text-gray-900 font-bold text-base mt-1">{selectedStudent.nis || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">FIRST NAME</p>
                                <p className="text-gray-900 font-semibold text-base mt-1">{selectedStudent.name?.split(' ')[0] || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">LAST NAME</p>
                                <p className="text-gray-900 font-semibold text-base mt-1">{selectedStudent.name?.split(' ').slice(1).join(' ') || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">GENDER</p>
                                <p className="text-gray-900 font-semibold text-base mt-1 uppercase">{selectedStudent.gender || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">ADDRESS</p>
                                <p className="text-blue-600 font-semibold text-base mt-1">{selectedStudent.address || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">RELIGION</p>
                                <p className="text-gray-900 font-semibold text-base mt-1 capitalize">{selectedStudent.religion || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">DATE OF BIRTH</p>
                                <p className="text-gray-900 font-semibold text-base mt-1">
                                    {selectedStudent.dob ? new Date(selectedStudent.dob).toLocaleDateString() : ''}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">EDUCATION TIER</p>
                                <p className="text-gray-900 font-semibold text-base mt-1 leading-relaxed">
                                    {getEducationTier(selectedStudent.grade)}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">GRADE</p>
                                <p className="text-gray-900 font-bold text-base mt-1">{selectedStudent.grade || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">CLASS</p>
                                <p className="text-gray-900 font-bold text-base mt-1">
                                    {selectedStudent.class_obj?.name || selectedStudent.class_name || 'Not Assigned'}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">DATE CREATED</p>
                                <p className="text-gray-900 font-semibold text-base mt-1">{selectedStudent.created_at || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">STUDENT STATUS</p>
                                <p className={`font-bold text-base mt-1 uppercase ${selectedStudent.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                    {selectedStudent.status || 'ACTIVE'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-6 border-t bg-gray-50">
                            <button
                                onClick={openEditModal}
                                className="flex-1 border-2 border-gray-300 py-3 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wide"
                            >
                                <PencilIcon className="h-5 w-5" /> EDIT
                            </button>
                            <button
                                onClick={() => handleDeleteStudent(selectedStudent.id)}
                                className="flex-1 border-2 border-red-500 text-red-500 py-3 rounded-md hover:bg-red-50 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide"
                            >
                                <TrashIcon className="h-5 w-5" /> DELETE
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Student Modal */}
            <AddStudentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddStudent}
                loading={addingStudent}
            />

            {/* Edit Student Modal */}
            <EditStudentModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditStudent}
                loading={editingStudent}
                student={selectedStudent}
            />

            {/* Promotion Modal */}
            <PromotionModal
                isOpen={isPromotionModalOpen}
                onClose={() => setIsPromotionModalOpen(false)}
                onSuccess={() => {
                    fetchStudents();
                }}
            />

            {/* Promotion History Modal */}
            <PromotionHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                onSuccess={() => {
                    fetchStudents();
                }}
            />
        </Layout>
    );
};

export default Students;
