import { Domain, BrandGuide, ContentBrief, Status, ContentType } from './types';

export const N8N_WEBHOOK_NEW_BRIEF = 'https://n8n.example.com/webhook/new-brief';
export const N8N_WEBHOOK_PUBLISH = 'https://n8n.example.com/webhook/publish';
export const N8N_WEBHOOK_SCHEDULE = 'https://n8n.example.com/webhook/schedule';

const LOGGED_IN_USER_CLIENT_ID = '6728ba02768b0b66c95ccadbc8';
const OTHER_CLIENT_ID = 'client-abc-123';


export const MOCK_DOMAINS: Domain[] = [
  { id: 'xxx', name: 'XXX Domain', clientId: LOGGED_IN_USER_CLIENT_ID },
  { id: 'yyy', name: 'YYY Domain', clientId: LOGGED_IN_USER_CLIENT_ID },
  { id: 'zzz', name: 'ZZZ Domain', clientId: LOGGED_IN_USER_CLIENT_ID },
  { id: 'abc', name: 'ABC Corp', clientId: OTHER_CLIENT_ID },
];

export const MOCK_BRAND_GUIDES: BrandGuide[] = [
  {
    domainId: 'xxx',
    clientId: LOGGED_IN_USER_CLIENT_ID,
    stylePrompt: 'High-quality, professional photograph suitable for a leading technology publication. Clean, modern aesthetic with a focus on detail and innovation. Use a neutral color palette with a single accent color. Cinematic, soft lighting.',
    toneOfVoice: 'Authoritative, insightful, and forward-looking. Avoid jargon where possible, but maintain a tone of expertise. The language should be clear, concise, and professional.',
  },
  {
    domainId: 'yyy',
    clientId: LOGGED_IN_USER_CLIENT_ID,
    stylePrompt: 'Warm, inviting, and authentic lifestyle photography. Use natural light and candid shots. The images should feel relatable and optimistic. Bright and airy color palette.',
    toneOfVoice: 'Friendly, engaging, and helpful. Use a conversational and approachable style. The content should be positive and encouraging, aiming to connect with the reader on a personal level.',
  },
  {
    domainId: 'zzz',
    clientId: LOGGED_IN_USER_CLIENT_ID,
    stylePrompt: 'Elegant, sophisticated, and artistic hero image. Minimalist composition with a strong focal point. High-fashion aesthetic, can be abstract or photographic. Focus on texture and form. A muted or monochrome color scheme is preferred.',
    toneOfVoice: 'Chic, aspirational, and confident. The tone should be elevated and descriptive, using evocative language. It should reflect luxury and exclusivity.',
  },
  {
    domainId: 'abc',
    clientId: OTHER_CLIENT_ID,
    stylePrompt: 'Corporate, clean, blue and white color scheme. Professional headshots.',
    toneOfVoice: 'Formal and direct.',
  },
];

export const MOCK_CONTENT_BRIEFS: ContentBrief[] = [
  {
    id: 'brief-1',
    domainId: 'xxx',
    clientId: LOGGED_IN_USER_CLIENT_ID,
    title: 'The Future of AI Assistants',
    brief: 'Write an article about the future of AI personal assistants, focusing on their potential impact on daily life and productivity.',
    content: 'In the next decade, AI personal assistants will transcend simple voice commands. They will become proactive partners, managing our schedules, anticipating our needs, and even offering emotional support. This article explores the technological advancements driving this change and the societal shifts that will follow.',
    status: Status.Draft,
    contentType: ContentType.Blog,
    heroImageUrl: 'https://picsum.photos/1200/600?random=1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'brief-2',
    domainId: 'yyy',
    clientId: LOGGED_IN_USER_CLIENT_ID,
    title: 'Top 5 Weekend Getaways for Families',
    brief: 'Create a listicle of the top 5 family-friendly weekend getaway spots. Include details on activities, accommodation, and budget.',
    content: 'Looking for the perfect family adventure? We\'ve curated a list of the top five destinations that promise fun for all ages. From mountain retreats to beachside resorts, discover your next memorable family trip here.',
    status: Status.Published,
    contentType: ContentType.Blog,
    heroImageUrl: 'https://picsum.photos/1200/600?random=2',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'brief-3',
    domainId: 'xxx',
    clientId: LOGGED_IN_USER_CLIENT_ID,
    title: 'Quantum Computing Explained',
    brief: 'An in-depth explanation of quantum computing for a tech-savvy audience. Explain qubits, superposition, and entanglement in simple terms.',
    content: 'Quantum computing is poised to revolutionize industries from medicine to finance. But what is it, really? This guide demystifies the core concepts of qubits, superposition, and entanglement, offering a clear look at the next frontier of computation.',
    status: Status.Draft,
    contentType: ContentType.Page,
    heroImageUrl: undefined,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'brief-4',
    domainId: 'zzz',
    clientId: LOGGED_IN_USER_CLIENT_ID,
    title: 'New Fashion Line Launch',
    brief: 'Announce the launch of the new summer fashion line.',
    content: 'Get ready for summer! Our new exclusive fashion line drops next week, featuring...',
    status: Status.Scheduled,
    contentType: ContentType.News,
    scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    heroImageUrl: 'https://picsum.photos/1200/600?random=4',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'brief-5-other-client',
    domainId: 'abc',
    clientId: OTHER_CLIENT_ID,
    title: 'ABC Corp Quarterly Report',
    brief: 'Summarize Q3 earnings.',
    content: 'Q3 earnings were strong, driven by growth in the enterprise sector.',
    status: Status.Published,
    contentType: ContentType.News,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];