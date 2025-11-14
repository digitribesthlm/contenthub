import { User, ContentBrief, BrandGuide, Domain } from '../types';

/**
 * MongoDB service that uses N8N webhooks to interact with MongoDB
 */

const N8N_BASE_URL = 'https://n8n.digitribe.se/webhook';

/**
 * Find a user by email and password
 */
export async function findUserByCredentials(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/find-user`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.user || data || null;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
}

/**
 * Get all domains for a specific client
 */
export async function getDomainsByClientId(clientId: string): Promise<Domain[]> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/get-domains`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch domains: ${response.statusText}`);
    }

    const data = await response.json();
    return data.domains || data || [];
  } catch (error) {
    console.error('Error fetching domains:', error);
    throw error;
  }
}

/**
 * Get all content briefs for a specific client
 */
export async function getAllContentBriefsByClient(clientId: string): Promise<ContentBrief[]> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/get-content-briefs`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch briefs: ${response.statusText}`);
    }

    const data = await response.json();
    return data.briefs || data || [];
  } catch (error) {
    console.error('Error fetching content briefs:', error);
    throw error;
  }
}

/**
 * Get all brand guides for a specific client
 */
export async function getAllBrandGuidesByClient(clientId: string): Promise<BrandGuide[]> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/get-brand-guides`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch brand guides: ${response.statusText}`);
    }

    const data = await response.json();
    return data.brandGuides || data || [];
  } catch (error) {
    console.error('Error fetching brand guides:', error);
    throw error;
  }
}

/**
 * Update a brand guide
 */
export async function updateBrandGuide(
  clientId: string,
  domainId: string,
  updates: Partial<BrandGuide>
): Promise<void> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/update-brand-guide`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId,
        domainId,
        updates,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update brand guide: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating brand guide:', error);
    throw error;
  }
}
