import { User, ContentBrief, BrandGuide, Domain } from '../types';

/**
 * MongoDB service that uses N8N webhooks to interact with MongoDB
 * This approach allows the frontend to query MongoDB through N8N workflows
 * which handle the database connection and queries securely on the backend
 */

// N8N Webhook endpoints for MongoDB operations
const N8N_BASE_URL = 'https://n8n.digitribe.se/webhook';

// Create webhook endpoints for MongoDB queries
const WEBHOOKS = {
  FIND_USER: `${N8N_BASE_URL}/find-user`,
  GET_DOMAINS: `${N8N_BASE_URL}/get-domains`,
  GET_CONTENT_BRIEFS: `${N8N_BASE_URL}/get-content-briefs`,
  GET_BRAND_GUIDES: `${N8N_BASE_URL}/get-brand-guides`,
  UPDATE_BRAND_GUIDE: `${N8N_BASE_URL}/update-brand-guide`,
};

/**
 * Generic function to call N8N webhooks
 */
async function callN8NWebhook(url: string, payload: any): Promise<any> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling N8N webhook:', error);
    throw error;
  }
}

/**
 * Find a user by email and password
 * The N8N workflow should query the users collection with these credentials
 */
export async function findUserByCredentials(email: string, password: string): Promise<User | null> {
  try {
    const result = await callN8NWebhook(WEBHOOKS.FIND_USER, {
      email: email.toLowerCase(),
      password: password,
    });

    return result.user || null;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
}

/**
 * Get all domains for a specific client
 * The N8N workflow should query the domains collection filtered by clientId
 */
export async function getDomainsByClientId(clientId: string): Promise<Domain[]> {
  try {
    const result = await callN8NWebhook(WEBHOOKS.GET_DOMAINS, {
      clientId,
    });

    return result.domains || [];
  } catch (error) {
    console.error('Error fetching domains:', error);
    throw error;
  }
}

/**
 * Get all content briefs for a specific client and domain
 * The N8N workflow should query content_briefs collection filtered by clientId and domainId
 */
export async function getContentBriefsByClientAndDomain(
  clientId: string,
  domainId: string
): Promise<ContentBrief[]> {
  try {
    const result = await callN8NWebhook(WEBHOOKS.GET_CONTENT_BRIEFS, {
      clientId,
      domainId,
    });

    return result.briefs || [];
  } catch (error) {
    console.error('Error fetching content briefs:', error);
    throw error;
  }
}

/**
 * Get all content briefs for a specific client (all domains)
 * The N8N workflow should query content_briefs collection filtered by clientId only
 */
export async function getAllContentBriefsByClient(clientId: string): Promise<ContentBrief[]> {
  try {
    const result = await callN8NWebhook(WEBHOOKS.GET_CONTENT_BRIEFS, {
      clientId,
    });

    return result.briefs || [];
  } catch (error) {
    console.error('Error fetching all content briefs:', error);
    throw error;
  }
}

/**
 * Get brand guide for a specific client and domain
 * The N8N workflow should query brand_guides collection filtered by clientId and domainId
 */
export async function getBrandGuideByClientAndDomain(
  clientId: string,
  domainId: string
): Promise<BrandGuide | null> {
  try {
    const result = await callN8NWebhook(WEBHOOKS.GET_BRAND_GUIDES, {
      clientId,
      domainId,
    });

    return result.brandGuide || null;
  } catch (error) {
    console.error('Error fetching brand guide:', error);
    throw error;
  }
}

/**
 * Get all brand guides for a specific client
 * The N8N workflow should query brand_guides collection filtered by clientId
 */
export async function getAllBrandGuidesByClient(clientId: string): Promise<BrandGuide[]> {
  try {
    const result = await callN8NWebhook(WEBHOOKS.GET_BRAND_GUIDES, {
      clientId,
    });

    return result.brandGuides || [];
  } catch (error) {
    console.error('Error fetching brand guides:', error);
    throw error;
  }
}

/**
 * Update a brand guide
 * The N8N workflow should update the brand_guides collection
 */
export async function updateBrandGuide(
  clientId: string,
  domainId: string,
  updates: Partial<BrandGuide>
): Promise<void> {
  try {
    await callN8NWebhook(WEBHOOKS.UPDATE_BRAND_GUIDE, {
      clientId,
      domainId,
      updates,
    });
  } catch (error) {
    console.error('Error updating brand guide:', error);
    throw error;
  }
}
