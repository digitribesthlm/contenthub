import { Domain, BrandGuide, ContentBrief, Status, ContentType } from '../types';

// ############################################################################
// #                                                                          #
// #                  --- MOCK API FOR DEVELOPMENT ---                        #
// #                                                                          #
// # This file simulates a backend API to allow for frontend development.     #
// # It returns sample data and mimics network delay.                         #
// #                                                                          #
// #        >>> REPLACE THESE FUNCTIONS WITH REAL API CALLS <<<               #
// #           >>> BEFORE DEPLOYING TO PRODUCTION <<<                         #
// #                                                                          #
// ############################################################################


// --- MOCK DATABASE ---
const MOCK_DOMAINS: Domain[] = [
  { id: 'xxx', name: 'XXX Corporation', clientId: 'client-123' },
  { id: 'yyy', name: 'YYY Industries', clientId: 'client-123' },
  { id: 'abc', name: 'ABC Limited', clientId: 'client-abc' }, // Belongs to another client
];

const MOCK_BRAND_GUIDES: BrandGuide[] = [
  {
    domainId: 'xxx',
    clientId: 'client-123',
    stylePrompt: 'Cinematic, professional photography with a focus on clean lines, high-tech environments, and a blue/silver color palette. Images should feel innovative and futuristic.',
    toneOfVoice: 'Authoritative, insightful, and forward-looking. Use clear, concise language. Avoid jargon. The tone should be professional and trustworthy, targeting industry experts and decision-makers.',
  },
  {
    domainId: 'yyy',
    clientId: 'client-123',
    stylePrompt: 'Warm, inviting photography featuring natural light and people collaborating. Focus on authentic interactions in a modern office setting. Earthy tones with pops of green and orange.',
    toneOfVoice: 'Friendly, approachable, and supportive. Use a conversational style. Focus on benefits and solutions for small to medium-sized businesses. The tone should be encouraging and helpful.',
  },
];

const MOCK_CONTENT_BRIEFS: ContentBrief[] = [
    {
        id: '1',
        domainId: 'xxx',
        clientId: 'client-123',
        title: 'The Future of AI in Manufacturing',
        brief: 'An in-depth article about the integration of AI in modern manufacturing processes.',
        content: 'The integration of Artificial Intelligence (AI) in manufacturing is revolutionizing the industry...',
        status: Status.Draft,
        contentType: ContentType.Blog,
        createdAt: new Date('2024-07-20T10:00:00Z').toISOString(),
    },
    {
        id: '2',
        domainId: 'xxx',
        clientId: 'client-123',
        title: 'Q3 Product Launch Announcement',
        brief: 'Press release for the new Quantum Processor launch.',
        content: 'XXX Corporation is proud to announce the launch of our new Quantum Processor, set to redefine computational limits...',
        status: Status.Published,
        contentType: ContentType.News,
        heroImageUrl: 'https://storage.googleapis.com/maker-me/media/images/tech_cpu.width-1024.jpg',
        createdAt: new Date('2024-07-18T14:30:00Z').toISOString(),
    },
    {
        id: '3',
        domainId: 'yyy',
        clientId: 'client-123',
        title: 'Building a Strong Company Culture',
        brief: 'A blog post on the importance of company culture for employee retention.',
        content: 'In today\'s competitive job market, a strong company culture is more important than ever...',
        status: Status.Scheduled,
        contentType: ContentType.Blog,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date('2024-07-21T11:00:00Z').toISOString(),
    },
];
// --- END MOCK DATABASE ---

const simulateApiCall = <T>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 500));
};


export const fetchDomains = async (clientId: string): Promise<Domain[]> => {
    console.log(`--- DEVELOPMENT MODE: Fetching MOCK domains for clientId: ${clientId} ---`);
    const data = MOCK_DOMAINS.filter(d => d.clientId === clientId);
    return simulateApiCall(data);

    /*
    // --- PRODUCTION CODE ---
    const response = await fetch(`/api/domains`); // Assumes backend uses auth token to get clientId
    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }
    return response.json();
    */
};

export const fetchBrandGuides = async (clientId: string): Promise<BrandGuide[]> => {
    console.log(`--- DEVELOPMENT MODE: Fetching MOCK brand guides for clientId: ${clientId} ---`);
    const data = MOCK_BRAND_GUIDES.filter(bg => bg.clientId === clientId);
    return simulateApiCall(data);

     /*
    // --- PRODUCTION CODE ---
    const response = await fetch(`/api/brand-guides`);
    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }
    return response.json();
    */
};

export const fetchContentBriefs = async (clientId: string): Promise<ContentBrief[]> => {
    console.log(`--- DEVELOPMENT MODE: Fetching MOCK content briefs for clientId: ${clientId} ---`);
    const data = MOCK_CONTENT_BRIEFS.filter(cb => cb.clientId === clientId);
    return simulateApiCall(data);
    
     /*
    // --- PRODUCTION CODE ---
    const response = await fetch(`/api/content-briefs`);
    if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
    }
    return response.json();
    */
};