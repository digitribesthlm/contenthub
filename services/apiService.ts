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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchClientData = async (clientId: string) => {
    console.log('\n' + '='.repeat(60));
    console.log('📡 === FETCHING CLIENT DATA ===');
    console.log('='.repeat(60));
    console.log('ClientId:', clientId);
    console.log('API URL:', `${API_URL}/api/client/${clientId}`);
    
    try {
        const response = await fetch(`${API_URL}/api/client/${clientId}`);
        console.log('✓ Response status:', response.status);
        
        if (!response.ok) {
            console.error('✗ Response not OK');
            throw new Error(`API call failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('\n✓ Full response data:', data);
        console.log('\n📊 Parsed data:');
        console.log('   Domains:', data.data?.domains?.length || 0, 'items');
        if (data.data?.domains) {
            data.data.domains.forEach((d, i) => console.log(`      [${i}] ${d.name} (id: ${d.id})`));
        }
        console.log('   Brand guides:', data.data?.brandGuides?.length || 0, 'items');
        if (data.data?.brandGuides) {
            data.data.brandGuides.forEach((bg, i) => console.log(`      [${i}] Domain: ${bg.domainId}`));
        }
        console.log('   Content briefs:', data.data?.briefs?.length || 0, 'items');
        if (data.data?.briefs) {
            data.data.briefs.forEach((b, i) => console.log(`      [${i}] ${b.title} (domain: ${b.domainId})`));
        }
        console.log('='.repeat(60) + '\n');
        
        return data;
    } catch (error) {
        console.error('❌ Error fetching client data:', error);
        console.log('='.repeat(60) + '\n');
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
