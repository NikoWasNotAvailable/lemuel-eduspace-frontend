import api from './api';

export const regionService = {
    // Create region (admin only)
    createRegion: async (regionData) => {
        const response = await api.post('/regions/', regionData);
        return response.data;
    },

    // Get all regions
    getAllRegions: async (skip = 0, limit = 100) => {
        const params = new URLSearchParams();
        if (skip !== undefined) params.append('skip', skip);
        if (limit !== undefined) params.append('limit', limit);

        const response = await api.get(`/regions/?${params.toString()}`);
        return response.data;
    },

    // Get region by ID
    getRegionById: async (regionId) => {
        const response = await api.get(`/regions/${regionId}`);
        return response.data;
    },

    // Update region (admin only)
    updateRegion: async (regionId, regionData) => {
        const response = await api.put(`/regions/${regionId}`, regionData);
        return response.data;
    },

    // Delete region (admin only)
    deleteRegion: async (regionId) => {
        const response = await api.delete(`/regions/${regionId}`);
        return response.data;
    }
};