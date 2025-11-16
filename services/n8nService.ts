import { ContentBrief } from '../types';
import { N8N_WEBHOOK_NEW_BRIEF, N8N_WEBHOOK_PUBLISH, N8N_WEBHOOK_SCHEDULE } from '../constants';

// Generate a unique content brief ID (format: w23434ksdfkdsfksdfsdf)
const generateContentBriefId = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

// Calls an n8n webhook to create a new content brief record
export const submitBrief = async (brief: string, title: string, domainId: string, clientId: string): Promise<ContentBrief> => {
  const contentBriefId = generateContentBriefId();
  
  const payload = { 
    id: contentBriefId,
    BriefID: contentBriefId, // Custom brief identifier for MongoDB
    title, 
    brief, 
    domainId, 
    clientId,
    createdAt: new Date().toISOString(),
    status: 'Draft',
    contentType: 'Blog',
  };

  console.log('\n' + '='.repeat(60));
  console.log('📤 SUBMITTING NEW BRIEF TO N8N');
  console.log('='.repeat(60));
  console.log('Content Brief ID:', contentBriefId);
  console.log('Webhook URL:', N8N_WEBHOOK_NEW_BRIEF);
  console.log('Payload:', payload);

  if (!N8N_WEBHOOK_NEW_BRIEF) {
    console.error('❌ N8N_WEBHOOK_NEW_BRIEF not configured in .env.local');
    throw new Error('N8N webhook URL not configured. Add VITE_N8N_WEBHOOK_NEW_BRIEF to your .env.local');
  }

  try {
    const response = await fetch(N8N_WEBHOOK_NEW_BRIEF, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('✓ Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ N8N error response:', errorText);
      throw new Error(`N8N API returned ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Brief created:', result);
    
    // Ensure we use the custom contentBriefId, not MongoDB _id
    const briefData: ContentBrief = {
      id: contentBriefId, // Use our unique ID, not the MongoDB _id
      title: result.title || payload.title,
      brief: result.brief || payload.brief,
      domainId: result.domainId || payload.domainId,
      clientId: result.clientId || payload.clientId,
      content: result.content || '',
      status: result.status || 'Draft',
      contentType: result.contentType || 'Blog',
      createdAt: result.createdAt || new Date().toISOString(),
    };
    
    console.log('Final brief object:', briefData);
    console.log('='.repeat(60) + '\n');
    return briefData;
  } catch (error) {
    console.error('❌ Failed to submit brief to n8n:', error);
    console.log('='.repeat(60) + '\n');
    throw error;
  }
};

// Calls an n8n webhook to publish content
export const publishContent = async (brief: ContentBrief): Promise<{ success: boolean }> => {
  const payload = {
    // Core brief data
    id: brief.id,
    title: brief.title,
    brief: brief.brief,
    content: brief.content,
    contentType: brief.contentType,
    status: brief.status,
    
    // Client & domain info
    clientId: brief.clientId,
    domainId: brief.domainId,
    
    // Image data
    heroImageUrl: brief.heroImageUrl,
    heroImageData: brief.heroImageData || null, // Base64 encoded image if generated
    
    // Metadata
    createdAt: brief.createdAt,
  };

  console.log('\n' + '='.repeat(60));
  console.log('📤 PUBLISHING CONTENT TO N8N');
  console.log('='.repeat(60));
  console.log('Webhook URL:', N8N_WEBHOOK_PUBLISH);
  console.log('Brief ID:', brief.id);

  if (!N8N_WEBHOOK_PUBLISH) {
    console.error('❌ N8N_WEBHOOK_PUBLISH not configured in .env.local');
    throw new Error('N8N webhook URL not configured. Add VITE_N8N_WEBHOOK_PUBLISH to your .env.local');
  }

  try {
    const response = await fetch(N8N_WEBHOOK_PUBLISH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('✓ Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ N8N error response:', errorText);
      throw new Error(`N8N API returned ${response.status}: ${errorText}`);
    }

    console.log('✅ Content published');
    console.log('='.repeat(60) + '\n');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to publish content via n8n:', error);
    console.log('='.repeat(60) + '\n');
    throw error;
  }
};


// Calls an n8n webhook to schedule content
export const scheduleContent = async (brief: ContentBrief, scheduledAt: string): Promise<{ success: boolean }> => {
  const payload = {
    // Core brief data
    id: brief.id,
    title: brief.title,
    brief: brief.brief,
    content: brief.content,
    contentType: brief.contentType,
    status: brief.status,
    
    // Client & domain info
    clientId: brief.clientId,
    domainId: brief.domainId,
    
    // Image data
    heroImageUrl: brief.heroImageUrl,
    heroImageData: brief.heroImageData || null, // Base64 encoded image if generated
    
    // Scheduling
    scheduledAt,
    createdAt: brief.createdAt,
  };

  console.log('\n' + '='.repeat(60));
  console.log('📤 SCHEDULING CONTENT WITH N8N');
  console.log('='.repeat(60));
  console.log('Webhook URL:', N8N_WEBHOOK_SCHEDULE);
  console.log('Brief ID:', brief.id);
  console.log('Scheduled at:', scheduledAt);

  if (!N8N_WEBHOOK_SCHEDULE) {
    console.error('❌ N8N_WEBHOOK_SCHEDULE not configured in .env.local');
    throw new Error('N8N webhook URL not configured. Add VITE_N8N_WEBHOOK_SCHEDULE to your .env.local');
  }

  try {
    const response = await fetch(N8N_WEBHOOK_SCHEDULE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('✓ Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ N8N error response:', errorText);
      throw new Error(`N8N API returned ${response.status}: ${errorText}`);
    }

    console.log('✅ Content scheduled');
    console.log('='.repeat(60) + '\n');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to schedule content via n8n:', error);
    console.log('='.repeat(60) + '\n');
    throw error;
  }
};
