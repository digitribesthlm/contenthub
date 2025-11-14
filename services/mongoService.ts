import { MongoClient } from 'mongodb';
import { User, ContentBrief, BrandGuide, Domain } from '../types';

// MongoDB connection from environment variables
const MONGODB_URL = import.meta.env.VITE_MONGODB_URL || '';
const MONGODB_DATABASE = import.meta.env.VITE_MONGODB_DATABASE || 'task-manager';

let client: MongoClient | null = null;

/**
 * Get MongoDB client connection
 */
async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    client = new MongoClient(MONGODB_URL);
    await client.connect();
  }
  return client;
}

/**
 * Get database instance
 */
async function getDatabase() {
  const mongoClient = await getMongoClient();
  return mongoClient.db(MONGODB_DATABASE);
}

/**
 * Find a user by email and password - DIRECT MongoDB query
 */
export async function findUserByCredentials(email: string, password: string): Promise<User | null> {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
      password: password, // Simple string comparison as requested
    });

    if (!user) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
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
    const db = await getDatabase();
    const domainsCollection = db.collection('domains');
    
    const domains = await domainsCollection.find({ clientId }).toArray();
    return domains as Domain[];
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
    const db = await getDatabase();
    const briefsCollection = db.collection('content_briefs');
    
    const briefs = await briefsCollection.find({ clientId }).toArray();
    
    // Map _id to id for frontend
    return briefs.map(brief => ({
      ...brief,
      id: brief._id.toString(),
    })) as ContentBrief[];
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
    const db = await getDatabase();
    const guidesCollection = db.collection('brand_guides');
    
    const guides = await guidesCollection.find({ clientId }).toArray();
    return guides as BrandGuide[];
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
    const db = await getDatabase();
    const guidesCollection = db.collection('brand_guides');
    
    await guidesCollection.updateOne(
      { clientId, domainId },
      { $set: updates }
    );
  } catch (error) {
    console.error('Error updating brand guide:', error);
    throw error;
  }
}
