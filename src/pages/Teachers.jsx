import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import AddTeacherModal from '../components/AddTeacherModal';
import EditTeacherModal from '../components/EditTeacherModal';
import { teacherService, userService } from '../services';
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [addingTeacher, setAddingTeacher] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(false);

    // Filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const teachersPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const data = await teacherService.getTeachers({ limit: 1000 });
            setTeachers(data);
        } catch (err) {
            console.error('Error fetching teachers:', err);
            setError('Failed to fetch teachers');
        } finally {
            setLoading(false);
        }
    };

    // Filtering logic
    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch =
            searchTerm === '' ||
            teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGender =
            selectedGender === '' || teacher.gender === selectedGender;
        const matchesRegion =
            selectedRegion === '' || teacher.region === selectedRegion;
        return matchesSearch && matchesGender && matchesRegion;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);
    const startIndex = (currentPage - 1) * teachersPerPage;
    const endIndex = startIndex + teachersPerPage;
    const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedGender, selectedRegion]);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handleDeleteTeacher = async id => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await teacherService.deleteTeacher(id);
                await fetchTeachers();
                setSelectedTeacher(null);
            } catch (err) {
                console.error('Error deleting teacher:', err);
                setError('Failed to delete teacher');
            }
        }
    };

    const handleAddTeacher = async (teacherData, profilePictureFile) => {
        try {
            setAddingTeacher(true);
            const newTeacher = await teacherService.registerTeacher(teacherData);

            // Upload profile picture if provided
            if (profilePictureFile && newTeacher?.id) {
                try {
                    await userService.uploadProfilePicture(profilePictureFile, newTeacher.id);
                } catch (picErr) {
                    console.error('Error uploading profile picture:', picErr);
                    // Don't fail the whole operation if picture upload fails
                }
            }

            await fetchTeachers(); // Refresh the list
            setIsAddModalOpen(false);
            setError(null);
        } catch (err) {
            console.error('Error adding teacher:', err);
            throw err; // Re-throw for modal to handle
        } finally {
            setAddingTeacher(false);
        }
    };

    const handleEditTeacher = async (teacherData, profilePictureFile) => {
        try {
            setEditingTeacher(true);
            await teacherService.updateTeacher(selectedTeacher.id, teacherData);

            // Upload profile picture if provided
            if (profilePictureFile) {
                try {
                    await userService.uploadProfilePicture(profilePictureFile, selectedTeacher.id);
                } catch (picErr) {
                    console.error('Error uploading profile picture:', picErr);
                    // Don't fail the whole operation if picture upload fails
                }
            }

            await fetchTeachers(); // Refresh the list
            setIsEditModalOpen(false);
            setSelectedTeacher(null);
            setError(null);
        } catch (err) {
            console.error('Error updating teacher:', err);
            throw err; // Re-throw for modal to handle
        } finally {
            setEditingTeacher(false);
        }
    };

    const openEditModal = () => {
        if (selectedTeacher) {
            setIsEditModalOpen(true);
        }
    };

    return (
        <Layout>
            <div className="flex bg-white min-h-[calc(100vh-4rem)]">
                {/* Main Table Section */}
                <div className={`flex-1 transition-all duration-300 ${selectedTeacher ? 'mr-[300px]' : ''}`}>
                    <div className="p-8">
                        {/* Back Button */}
                        <div className="mb-6 flex justify-start">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-800 ml-4">Teachers</h1>
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
                                    value={selectedRegion}
                                    onChange={e => setSelectedRegion(e.target.value)}
                                    className="border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 bg-white min-w-[100px]"
                                >
                                    <option value="">Region</option>
                                    {[...new Set(teachers.map(t => t.region).filter(Boolean))].sort().map(region => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-[#6B7280] text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-[#5B6170] transition"
                            >
                                ADD
                            </button>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {/* Teacher count */}
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">
                                Showing {startIndex + 1} - {Math.min(endIndex, filteredTeachers.length)} of {filteredTeachers.length} teachers
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
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">NAME</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">EMAIL</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">GENDER</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">REGION</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentTeachers.map(teacher => (
                                            <tr
                                                key={teacher.id}
                                                onClick={() => setSelectedTeacher(teacher)}
                                                className={`cursor-pointer transition-colors text-start ${selectedTeacher?.id === teacher.id
                                                    ? 'bg-blue-50 border-l-4 border-blue-500'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <td className="px-6 py-4">
                                                    {teacher.profile_picture_url ? (
                                                        <img
                                                            src={`${API_BASE_URL}${teacher.profile_picture_url}`}
                                                            alt={teacher.name}
                                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <UserCircleIcon 
                                                        className={`w-10 h-10 text-gray-400 ${teacher.profile_picture_url ? 'hidden' : ''}`}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 font-medium">{teacher.name || ''}</td>
                                                <td className="px-6 py-4 text-gray-700">{teacher.email || ''}</td>
                                                <td className="px-6 py-4 text-gray-700 capitalize">{teacher.gender || ''}</td>
                                                <td className="px-6 py-4 text-gray-700">{teacher.region || ''}</td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${teacher.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {teacher.status || 'inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {!loading && filteredTeachers.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No teachers found.
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

                {/* Sidebar Teacher Detail */}
                {selectedTeacher && (
                    <div className="fixed right-0 top-16 w-[380px] h-[calc(100vh-4rem)] bg-white border-l border-gray-200 flex flex-col shadow-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-xl font-bold text-gray-800">Teacher Details</h2>
                            <button onClick={() => setSelectedTeacher(null)}>
                                <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
                            {/* Profile Picture */}
                            <div className="flex justify-center">
                                {selectedTeacher.profile_picture_url ? (
                                    <img
                                        src={`${API_BASE_URL}${selectedTeacher.profile_picture_url}`}
                                        alt={selectedTeacher.name}
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`w-24 h-24 rounded-full bg-gray-100 items-center justify-center ${selectedTeacher.profile_picture_url ? 'hidden' : 'flex'}`}>
                                    <UserCircleIcon className="w-20 h-20 text-gray-400" />
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">NAME</p>
                                <p className="text-gray-900 font-bold text-base mt-1">{selectedTeacher.name || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">EMAIL</p>
                                <p className="text-blue-600 font-semibold text-base mt-1">{selectedTeacher.email || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">GENDER</p>
                                <p className="text-gray-900 font-semibold text-base mt-1 capitalize">{selectedTeacher.gender || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">DATE OF BIRTH</p>
                                <p className="text-gray-900 font-semibold text-base mt-1">
                                    {selectedTeacher.dob ? new Date(selectedTeacher.dob).toLocaleDateString() : ''}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">BIRTH PLACE</p>
                                <p className="text-gray-900 font-semibold text-base mt-1">{selectedTeacher.birth_place || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">REGION</p>
                                <p className="text-gray-900 font-semibold text-base mt-1">{selectedTeacher.region || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">ADDRESS</p>
                                <p className="text-gray-900 font-semibold text-base mt-1">{selectedTeacher.address || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">RELIGION</p>
                                <p className="text-gray-900 font-semibold text-base mt-1 capitalize">{selectedTeacher.religion || ''}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">ROLE</p>
                                <p className="text-gray-900 font-semibold text-base mt-1 capitalize">{selectedTeacher.role || 'Teacher'}</p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">STATUS</p>
                                <p className={`font-bold text-base mt-1 uppercase ${selectedTeacher.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                    {selectedTeacher.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">DATE CREATED</p>
                                <p className="text-gray-900 font-semibold text-base mt-1">
                                    {selectedTeacher.created_at ? new Date(selectedTeacher.created_at).toLocaleDateString() : ''}
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
                                onClick={() => handleDeleteTeacher(selectedTeacher.id)}
                                className="flex-1 border-2 border-red-500 text-red-500 py-3 rounded-md hover:bg-red-50 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide"
                            >
                                <TrashIcon className="h-5 w-5" /> DELETE
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Teacher Modal */}
            <AddTeacherModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddTeacher}
                loading={addingTeacher}
            />

            {/* Edit Teacher Modal */}
            <EditTeacherModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditTeacher}
                loading={editingTeacher}
                teacher={selectedTeacher}
            />
        </Layout>
    );
};

export default Teachers;
