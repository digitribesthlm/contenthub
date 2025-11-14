import { Domain, BrandGuide, ContentBrief } from '../types';

// ############################################################################
// #                                                                          #
// #               --- LIVE API SERVICE - PRODUCTION READY ---                #
// #                                                                          #
// # This file contains functions to fetch data from your live backend API.   #
// # Each function assumes you have a running backend that handles            #
// # authentication and returns data scoped to the logged-in user.            #
// #                                                                          #
// ############################################################################

// Use relative path in production (Vercel), localhost in development
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export const fetchClientData = async (clientId: string) => {
    try {
        const response = await fetch(`${API_URL}/api/client/${clientId}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'X-Client-ID': clientId // Authentication header
            },
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching client data:', error);
        throw error;
    }
};

export const fetchDomains = async (clientId: string): Promise<Domain[]> => {
    try {
        const data = await fetchClientData(clientId);
        return data.data?.domains || [];
    } catch (error) {
        console.error('Error fetching domains:', error);
        return [];
    }
};

export const fetchBrandGuides = async (clientId: string): Promise<BrandGuide[]> => {
    try {
        const data = await fetchClientData(clientId);
        return data.data?.brandGuides || [];
    } catch (error) {
        console.error('Error fetching brand guides:', error);
        return [];
    }
};

export const fetchContentBriefs = async (clientId: string): Promise<ContentBrief[]> => {
    try {
        const data = await fetchClientData(clientId);
        return data.data?.briefs || [];
    } catch (error) {
        console.error('Error fetching content briefs:', error);
        return [];
    }
};

export const saveBrandGuideImage = async (brandGuideId: string, imageData: string, mimeType: string = 'image/jpeg'): Promise<void> => {
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
    
    try {
        const payload = {
            styleImageData: imageData,
            styleImageMimeType: mimeType,
        };
        
        const response = await fetch(`${apiUrl}/api/brand-guide/${brandGuideId}/image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to save image: ${response.status}`);
        }
    } catch (error) {
        console.error('Error saving image:', error);
        throw error;
    }
};
