import { ContentBrief } from '../types';
import { N8N_WEBHOOK_NEW_BRIEF, N8N_WEBHOOK_PUBLISH, N8N_WEBHOOK_SCHEDULE } from '../constants';

// Calls an n8n webhook to create a new content brief record
export const submitBrief = async (brief: string, title: string, domainId: string, clientId: string): Promise<ContentBrief> => {
  const payload = { title, brief, domainId, clientId };

  console.log(`Submitting to n8n webhook: ${N8N_WEBHOOK_NEW_BRIEF}`, payload);

  const response = await fetch(N8N_WEBHOOK_NEW_BRIEF, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to submit new brief to n8n.');
  }
  
  // n8n should be configured to return the newly created brief object
  return response.json();
};

// Calls an n8n webhook to publish content
export const publishContent = async (brief: ContentBrief): Promise<{ success: boolean }> => {
  const payload = {
    id: brief.id,
    title: brief.title,
    content: brief.content,
    heroImageUrl: brief.heroImageUrl,
    domainId: brief.domainId,
    clientId: brief.clientId,
    contentType: brief.contentType,
  };

  console.log(`Publishing to n8n webhook: ${N8N_WEBHOOK_PUBLISH}`, payload);

  const response = await fetch(N8N_WEBHOOK_PUBLISH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to publish content via n8n.');
  }

  return { success: true };
};


// Calls an n8n webhook to schedule content
export const scheduleContent = async (brief: ContentBrief, scheduledAt: string): Promise<{ success: boolean }> => {
  const payload = {
    id: brief.id,
    title: brief.title,
    content: brief.content,
    heroImageUrl: brief.heroImageUrl,
    domainId: brief.domainId,
    clientId: brief.clientId,
    contentType: brief.contentType,
    scheduledAt,
  };

  console.log(`Scheduling with n8n webhook: ${N8N_WEBHOOK_SCHEDULE}`, payload);

  const response = await fetch(N8N_WEBHOOK_SCHEDULE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error('Failed to schedule content via n8n.');
  }

  return { success: true };
};
