
import { ContentBrief, Status, ContentType } from '../types';
import { N8N_WEBHOOK_NEW_BRIEF, N8N_WEBHOOK_PUBLISH, N8N_WEBHOOK_SCHEDULE } from '../constants';

// Submit a new brief to n8n webhook with clientId for filtering
export const submitBrief = (
  brief: string, 
  title: string, 
  domainId: string, 
  clientId: string
): Promise<ContentBrief> => {
  const payload = {
    title,
    brief,
    domainId,
    clientId, // Include clientId for MongoDB filtering
  };

  console.log(`Submitting to n8n webhook: ${N8N_WEBHOOK_NEW_BRIEF}`);
  console.log('Payload:', payload);

  return fetch(N8N_WEBHOOK_NEW_BRIEF, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`N8N webhook error: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('N8N response:', data);
      // The webhook should return the created brief from MongoDB
      return data as ContentBrief;
    })
    .catch(error => {
      console.error('Error submitting brief:', error);
      throw error;
    });
};

// Publish content via n8n webhook with clientId verification
export const publishContent = (brief: ContentBrief, clientId: string): Promise<{ success: boolean }> => {
  const payload = {
    id: brief.id,
    title: brief.title,
    content: brief.content,
    heroImageUrl: brief.heroImageUrl,
    domainId: brief.domainId,
    contentType: brief.contentType,
    clientId, // Include clientId for verification
  };

  console.log(`Publishing to n8n webhook: ${N8N_WEBHOOK_PUBLISH}`);
  console.log('Payload:', payload);

  return fetch(N8N_WEBHOOK_PUBLISH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`N8N webhook error: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('N8N publish successful for brief:', brief.id);
      return { success: true };
    })
    .catch(error => {
      console.error('Error publishing content:', error);
      throw error;
    });
};

// Schedule content via n8n webhook with clientId verification
export const scheduleContent = (
  brief: ContentBrief, 
  scheduledAt: string, 
  clientId: string
): Promise<{ success: boolean }> => {
  const payload = {
    id: brief.id,
    title: brief.title,
    content: brief.content,
    heroImageUrl: brief.heroImageUrl,
    domainId: brief.domainId,
    contentType: brief.contentType,
    scheduledAt,
    clientId, // Include clientId for verification
  };

  console.log(`Scheduling with n8n webhook: ${N8N_WEBHOOK_SCHEDULE}`);
  console.log('Payload:', payload);

  return fetch(N8N_WEBHOOK_SCHEDULE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`N8N webhook error: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('N8N schedule successful for brief:', brief.id);
      return { success: true };
    })
    .catch(error => {
      console.error('Error scheduling content:', error);
      throw error;
    });
};
