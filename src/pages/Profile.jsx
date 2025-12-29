import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { authService } from '../services/authService';
import { UserCircleIcon, EnvelopeIcon, IdentificationIcon, AcademicCapIcon, BuildingOfficeIcon, CalendarIcon } from '@heroicons/react/24/outline';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authService.getCurrentUser();
                setProfile(data);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D336B]"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application info.</p>
                        </div>
                        <div className="h-16 w-16 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-2xl font-bold">
                            {profile?.profile_picture ? (
                                <img src={profile.profile_picture} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
                            ) : (
                                <span>{profile?.name?.[0] || 'U'}</span>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-gray-200">
                        <dl>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <UserCircleIcon className="h-5 w-5 mr-2" /> Full name
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile?.name}</dd>
                            </div>
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <IdentificationIcon className="h-5 w-5 mr-2" /> Role
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{profile?.role}</dd>
                            </div>
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <EnvelopeIcon className="h-5 w-5 mr-2" /> Email address
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile?.email}</dd>
                            </div>
                            {profile?.nis && (
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <IdentificationIcon className="h-5 w-5 mr-2" /> NIS
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.nis}</dd>
                                </div>
                            )}
                            {profile?.grade && (
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <AcademicCapIcon className="h-5 w-5 mr-2" /> Grade
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.grade}</dd>
                                </div>
                            )}
                            {profile?.region && (
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <BuildingOfficeIcon className="h-5 w-5 mr-2" /> Region
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.region}</dd>
                                </div>
                            )}
                            {profile?.class_name && (
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <AcademicCapIcon className="h-5 w-5 mr-2" /> Class
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.class_name}</dd>
                                </div>
                            )}
                            {profile?.dob && (
                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <CalendarIcon className="h-5 w-5 mr-2" /> Date of Birth
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date(profile.dob).toLocaleDateString()}</dd>
                                </div>
                            )}
                            {profile?.status && (
                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {profile.status}
                                        </span>
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
