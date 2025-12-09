import api from './api';

export const bannerService = {
    getAllBanners: async (regionId = null) => {
        const params = regionId ? { region_id: regionId } : {};
        const response = await api.get('/banners/', { params });
        return response.data;
    },

    getMyBanners: async () => {
        const response = await api.get('/banners/my-banners');
        return response.data;
    },

    createBanner: async (formData) => {
        const response = await api.post('/banners/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateBanner: async (id, formData) => {
        const response = await api.put(`/banners/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteBanner: async (id) => {
        await api.delete(`/banners/${id}`);
    }
};
