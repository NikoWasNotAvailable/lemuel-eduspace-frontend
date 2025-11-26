import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { regionService, classService } from '../services';
import Layout from '../components/Layout/Layout';
import {
    MapPinIcon,
    AcademicCapIcon,
    ChevronRightIcon,
    ArrowLeftIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

const Classes = () => {
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [error, setError] = useState(null);

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
                                {selectedRegion ? `Classes in ${selectedRegion.name}` : 'Region'}
                            </h1>
                        </div>

                        {/* Region navigation and action buttons */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                {selectedRegion && (
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
                                <button className="bg-[#6B7280] text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-[#5B6170] transition">
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
                            <div className="space-y-10">

                                {(() => {
                                    const grouped = {
                                        TK: [],
                                        SD: [],
                                        SMP: []
                                    };

                                    classes.forEach(cls => {
                                        const name = cls.name.toUpperCase();

                                        if (name.startsWith("TK")) grouped.TK.push(cls);
                                        else if (name.startsWith("SD")) grouped.SD.push(cls);
                                        else if (name.startsWith("SMP")) grouped.SMP.push(cls);
                                    });

                                    return Object.entries(grouped).map(([category, list]) => {
                                        if (list.length === 0) return null;

                                        return (
                                            <div key={category}>
                                                {/* Category Header */}
                                                <div className="flex items-center justify-start gap-2 mb-3">
                                                    <h2 className="text-xl font-semibold text-gray-800">{category}</h2>
                                                    <button className="text-sm bg-black text-white px-4 py-1 rounded-md hover:bg-gray-800">
                                                        View All
                                                    </button>
                                                </div>

                                                {/* Class Boxes Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                                    {list.map(cls => (
                                                        <div
                                                            key={cls.id}
                                                            className="bg-[#EAF2FF] h-24 flex items-center justify-center rounded-xl 
                                           text-xl font-semibold text-gray-800 cursor-pointer 
                                           hover:bg-[#d8e9ff] transition"
                                                        >
                                                            {cls.name}
                                                        </div>
                                                    ))}
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
        </Layout>
    );
};

export default Classes;