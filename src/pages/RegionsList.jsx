import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { regionService } from '../services';
import Layout from '../components/Layout/Layout';
import {
    MapPinIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

const RegionsList = () => {
    const navigate = useNavigate();
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                                Regions
                            </h1>
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
                                            Click to view grades
                                        </p>
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

export default RegionsList;