import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { regionService } from '../services';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import AddRegionModal from '../components/AddRegionModal';
import EditRegionModal from '../components/EditRegionModal';
import {
    MapPinIcon,
    ArrowLeftIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const RegionsList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addingRegion, setAddingRegion] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRegion, setEditingRegion] = useState(null);
    const [updatingRegion, setUpdatingRegion] = useState(false);

    // Load regions on component mount
    useEffect(() => {
        loadRegions();
    }, []);

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

    const handleRegionClick = (region) => {
        navigate(`/classes/${region.id}`);
    };

    const handleAddRegion = async (regionData) => {
        try {
            setAddingRegion(true);
            await regionService.createRegion(regionData);
            await loadRegions();
            setIsAddModalOpen(false);
            setError(null);
        } catch (error) {
            console.error('Failed to add region:', error);
            setError(error.response?.data?.detail || 'Failed to add region. Please try again.');
        } finally {
            setAddingRegion(false);
        }
    };

    const handleEditRegion = (region, e) => {
        e.stopPropagation();
        setEditingRegion(region);
        setIsEditModalOpen(true);
    };

    const handleUpdateRegion = async (formData) => {
        try {
            setUpdatingRegion(true);
            await regionService.updateRegion(editingRegion.id, formData);
            await loadRegions();
            setIsEditModalOpen(false);
            setEditingRegion(null);
            setError(null);
        } catch (error) {
            console.error('Failed to update region:', error);
            setError(error.response?.data?.detail || 'Failed to update region. Please try again.');
        } finally {
            setUpdatingRegion(false);
        }
    };

    const handleDeleteRegion = async (regionId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this region? This will also affect all classes in this region.')) {
            return;
        }

        try {
            await regionService.deleteRegion(regionId);
            await loadRegions();
            setError(null);
        } catch (error) {
            console.error('Failed to delete region:', error);
            setError(error.response?.data?.detail || 'Failed to delete region. Please try again.');
        }
    };

    return (
        <Layout>
            <div className="flex bg-white min-h-[calc(100vh-4rem)]">
                <div className="flex-1 transition-all duration-300">
                    <div className="p-8">
                        {/* Header */}
                        <div className="mb-6 flex justify-between items-center">
                            <h1 className="text-2xl font-semibold text-gray-800">
                                Regions
                            </h1>
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-[#6B7280] text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-[#5B6170] transition flex items-center gap-2"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    ADD REGION
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

                        {/* Regions Grid */}
                        {!loading && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {regions.map((region) => (
                                    <div
                                        key={region.id}
                                        className="bg-[#EAF2FF] h-28 rounded-xl relative group
                                           hover:bg-[#d8e9ff] transition shadow-sm"
                                    >
                                        <div
                                            onClick={() => handleRegionClick(region)}
                                            className="flex flex-col items-center justify-center h-full cursor-pointer"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <MapPinIcon className="h-6 w-6 text-blue-600" />
                                                <span className="text-xl font-semibold text-gray-800">{region.name}</span>
                                            </div>

                                            <p className="text-sm text-gray-600 mt-1">
                                                Click to view grades
                                            </p>
                                        </div>

                                        {user?.role === 'admin' && (
                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleEditRegion(region, e)}
                                                    className="bg-white p-1.5 rounded-md shadow-md hover:bg-gray-100 transition"
                                                    title="Edit region"
                                                >
                                                    <PencilIcon className="h-4 w-4 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteRegion(region.id, e)}
                                                    className="bg-white p-1.5 rounded-md shadow-md hover:bg-gray-100 transition"
                                                    title="Delete region"
                                                >
                                                    <TrashIcon className="h-4 w-4 text-red-600" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Region Modal */}
            <AddRegionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddRegion}
                loading={addingRegion}
            />

            {/* Edit Region Modal */}
            <EditRegionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingRegion(null);
                }}
                onSubmit={handleUpdateRegion}
                loading={updatingRegion}
                regionData={editingRegion}
            />
        </Layout>
    );
};

export default RegionsList;