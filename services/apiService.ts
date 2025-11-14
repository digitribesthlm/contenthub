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

export const fetchDomains = async (clientId: string): Promise<Domain[]> => {
    // In a real app, the clientId would typically be derived from an auth token 
    // on the backend, not passed from the client. But we pass it here to be explicit.
    console.log(`Fetching domains for clientId: ${clientId}`);
    const response = await fetch(`/api/domains`); // Your backend should use the user's session/token to filter by clientId
    if (!response.ok) {
        throw new Error(`API call to fetch domains failed with status: ${response.status}`);
    }
    return response.json();
};

export const fetchBrandGuides = async (clientId: string): Promise<BrandGuide[]> => {
    console.log(`Fetching brand guides for clientId: ${clientId}`);
    const response = await fetch(`/api/brand-guides`);
    if (!response.ok) {
        throw new Error(`API call to fetch brand guides failed with status: ${response.status}`);
    }
    return response.json();
};

export const fetchContentBriefs = async (clientId: string): Promise<ContentBrief[]> => {
    console.log(`Fetching content briefs for clientId: ${clientId}`);
    const response = await fetch(`/api/content-briefs`);
    if (!response.ok) {
        throw new Error(`API call to fetch content briefs failed with status: ${response.status}`);
    }
    return response.json();
};
