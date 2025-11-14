
import { ContentBrief, Status, ContentType } from '../types';
import { N8N_WEBHOOK_NEW_BRIEF, N8N_WEBHOOK_PUBLISH, N8N_WEBHOOK_SCHEDULE } from '../constants';

// Mocks a call to an n8n webhook to create a new content brief record
export const submitBrief = (brief: string, title: string, domainId: string): Promise<ContentBrief> => {
  const payload = {
    title,
    brief,
    domainId,
  };

  console.log(`Submitting to n8n webhook: ${N8N_WEBHOOK_NEW_BRIEF}`);
  console.log('Payload:', payload);

  // In a real app, this would be a fetch call:
  // await fetch(N8N_WEBHOOK_NEW_BRIEF, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });

  // For this demo, we simulate a successful response from n8n/MongoDB
  // by creating a new brief object locally.
  return new Promise(resolve => {
    setTimeout(() => {
      const newBrief: ContentBrief = {
        id: `brief-${Date.now()}`,
        domainId,
        title,
        brief,
        content: `This is the initial content generated from the brief: "${brief}". Please expand upon it.`,
        status: Status.Draft,
        contentType: ContentType.Blog, // Default to blog
        createdAt: new Date().toISOString(),
      };
      console.log('Mock n8n response:', newBrief);
      resolve(newBrief);
    }, 500); // Simulate network delay
  });
};

// Mocks a call to an n8n webhook to publish content
export const publishContent = (brief: ContentBrief): Promise<{ success: boolean }> => {
  const payload = {
    id: brief.id,
    title: brief.title,
    content: brief.content,
    heroImageUrl: brief.heroImageUrl,
    domain: brief.domainId,
    contentType: brief.contentType,
  };

  console.log(`Publishing to n8n webhook: ${N8N_WEBHOOK_PUBLISH}`);
  console.log('Payload:', payload);

  // In a real app, this would be a fetch call:
  // await fetch(N8N_WEBHOOK_PUBLISH, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });

  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Mock n8n publish successful for brief:', brief.id);
      resolve({ success: true });
    }, 1000); // Simulate network delay for publishing
  });
};


// Mocks a call to an n8n webhook to schedule content
export const scheduleContent = (brief: ContentBrief, scheduledAt: string): Promise<{ success: boolean }> => {
  const payload = {
    id: brief.id,
    title: brief.title,
    content: brief.content,
    heroImageUrl: brief.heroImageUrl,
    domain: brief.domainId,
    contentType: brief.contentType,
    scheduledAt,
  };

  console.log(`Scheduling with n8n webhook: ${N8N_WEBHOOK_SCHEDULE}`);
  console.log('Payload:', payload);

  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Mock n8n schedule successful for brief:', brief.id);
      resolve({ success: true });
    }, 1000); // Simulate network delay
  });
};
