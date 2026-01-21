import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { bannerService, regionService } from '../services';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        image: null,
        description: '',
        region_id: ''
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageError, setImageError] = useState('');

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bannersData, regionsData] = await Promise.all([
                bannerService.getAllBanners(),
                regionService.getAllRegions()
            ]);
            setBanners(bannersData);
            setRegions(regionsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('region_id', formData.region_id);
            if (formData.description) data.append('description', formData.description);
            if (formData.image) data.append('image', formData.image);

            if (editingBanner) {
                await bannerService.updateBanner(editingBanner.id, data);
            } else {
                await bannerService.createBanner(data);
            }
            await fetchData();
            closeModal();
        } catch (err) {
            console.error('Error saving banner:', err);
            setError('Failed to save banner');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            await bannerService.deleteBanner(id);
            await fetchData();
        } catch (err) {
            console.error('Error deleting banner:', err);
            setError('Failed to delete banner');
        }
    };

    const openModal = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                image: null,
                description: banner.description || '',
                region_id: banner.region_id
            });
            setPreviewUrl(getImageUrl(banner.image_url));
        } else {
            setEditingBanner(null);
            setFormData({
                image: null,
                description: '',
                region_id: regions.length > 0 ? regions[0].id : ''
            });
            setPreviewUrl(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBanner(null);
        setFormData({ image: null, description: '', region_id: '' });
        setPreviewUrl(null);
        setImageError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setImageError('Image size exceeds 10MB limit');
                return;
            }
            setImageError('');
            setFormData({ ...formData, image: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const getRegionName = (regionId) => {
        const region = regions.find(r => r.id === regionId);
        return region ? region.name : 'Unknown Region';
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    return (
        <Layout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Banners Management</h1>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add Banner
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {banners.map((banner) => (
                            <div key={banner.id} className="bg-white rounded-xl shadow-md overflow-hidden group">
                                <div className="relative h-48 bg-gray-200">
                                    <img
                                        src={getImageUrl(banner.image_url)}
                                        alt={banner.description || 'Banner'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error';
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openModal(banner)}
                                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                                        >
                                            <PencilIcon className="h-4 w-4 text-blue-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner.id)}
                                            className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                                        >
                                            <TrashIcon className="h-4 w-4 text-red-600" />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
                                        <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded-md">
                                            {getRegionName(banner.region_id)}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {banner.description || 'No description'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">
                                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Region
                                        </label>
                                        <select
                                            value={formData.region_id}
                                            onChange={(e) => setFormData({ ...formData, region_id: parseInt(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Region</option>
                                            {regions.map(region => (
                                                <option key={region.id} value={region.id}>
                                                    {region.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Banner Image
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                            <div className="space-y-1 text-center">
                                                {previewUrl ? (
                                                    <div className="relative">
                                                        <img
                                                            src={previewUrl}
                                                            alt="Preview"
                                                            className="mx-auto h-48 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, image: null });
                                                                setPreviewUrl(null);
                                                            }}
                                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                        <div className="flex text-sm text-gray-600">
                                                            <label
                                                                htmlFor="file-upload"
                                                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                                            >
                                                                <span>Upload a file</span>
                                                                <input
                                                                    id="file-upload"
                                                                    name="file-upload"
                                                                    type="file"
                                                                    className="sr-only"
                                                                    accept="image/*"
                                                                    onChange={handleImageChange}
                                                                    required={!editingBanner}
                                                                />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG, GIF up to 10MB
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {imageError && (
                                            <p className="text-red-500 text-xs mt-2">{imageError}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        {editingBanner ? 'Save Changes' : 'Create Banner'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Banners;
