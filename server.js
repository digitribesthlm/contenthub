import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();

// Load ALL config from environment variables
const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE;
const MONGODB_COLLECTION_USERS = process.env.MONGODB_COLLECTION_USERS;
const MONGODB_COLLECTION_DOMAINS = process.env.MONGODB_COLLECTION_DOMAINS || 'domains';
const MONGODB_COLLECTION_BRAND_GUIDES = process.env.MONGODB_COLLECTION_BRAND_GUIDES || 'brand_guides';
const MONGODB_COLLECTION_CONTENT_BRIEFS = process.env.MONGODB_COLLECTION_CONTENT_BRIEFS || 'content_briefs';

// Debug: Show all env vars loaded
console.log('\n📋 ENVIRONMENT VARIABLES LOADED:');
console.log('   MONGODB_URL:', MONGODB_URL ? MONGODB_URL.substring(0, 50) + '...' : 'UNDEFINED');
console.log('   MONGODB_DATABASE:', MONGODB_DATABASE || 'UNDEFINED');
console.log('   MONGODB_COLLECTION_USERS:', MONGODB_COLLECTION_USERS || 'UNDEFINED');
console.log('   MONGODB_COLLECTION_DOMAINS:', MONGODB_COLLECTION_DOMAINS || 'UNDEFINED');
console.log('   MONGODB_COLLECTION_BRAND_GUIDES:', MONGODB_COLLECTION_BRAND_GUIDES || 'UNDEFINED');
console.log('   MONGODB_COLLECTION_CONTENT_BRIEFS:', MONGODB_COLLECTION_CONTENT_BRIEFS || 'UNDEFINED');

// Validate required env vars
if (!MONGODB_URL || !MONGODB_DATABASE || !MONGODB_COLLECTION_USERS) {
  console.error('\n❌ MISSING REQUIRED ENVIRONMENT VARIABLES:');
  console.error('   MONGODB_URL:', MONGODB_URL ? '✓' : '✗ MISSING');
  console.error('   MONGODB_DATABASE:', MONGODB_DATABASE ? '✓' : '✗ MISSING');
  console.error('   MONGODB_COLLECTION_USERS:', MONGODB_COLLECTION_USERS ? '✓' : '✗ MISSING');
  console.error('\nAdd these to your .env.local file (WITHOUT quotes)');
  process.exit(1);
}

console.log('\n🚀 Starting Content Hub Backend');
console.log('📡 MongoDB URL type:', MONGODB_URL.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local/Remote MongoDB');
console.log('📦 Database:', MONGODB_DATABASE);
console.log('👥 Users collection:', MONGODB_COLLECTION_USERS);

let db;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const client = new MongoClient(MONGODB_URL);
    await client.connect();
    db = client.db(MONGODB_DATABASE);
    console.log('✓ Connected to MongoDB\n');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    console.error('   Make sure MongoDB is running and URL is correct.\n');
    process.exit(1);
  }
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log('🔐 LOGIN ATTEMPT - DEBUG INFO');
    console.log('='.repeat(60));
    console.log('📧 Email received:', email);
    console.log('🔑 Password received:', password);
    console.log('🔢 Password length:', password.length);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Show ALL users in database
    console.log('\n📋 ALL USERS IN DATABASE:');
    console.log('   Collection name:', MONGODB_COLLECTION_USERS);
    const allUsers = await db.collection(MONGODB_COLLECTION_USERS).find({}).toArray();
    console.log('   Total users:', allUsers.length);
    allUsers.forEach((u, idx) => {
      console.log(`\n  User ${idx + 1}:`);
      console.log(`    Email: ${u.email}`);
      console.log(`    Password: ${u.password}`);
      console.log(`    Password length: ${u.password.length}`);
      console.log(`    Role: ${u.role}`);
      console.log(`    ClientId: ${u.clientId}`);
    });

    // Query MongoDB users collection
    console.log('\n🔍 SEARCHING FOR USER...');
    const user = await db.collection(MONGODB_COLLECTION_USERS).findOne({ email });

    if (!user) {
      console.log('   ✗ User NOT found in database');
      console.log('='.repeat(60) + '\n');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Simple string comparison
    console.log('   ✓ User FOUND in database');
    console.log('\n📦 PASSWORD COMPARISON:');
    console.log('   Stored in DB:', user.password);
    console.log('   Sent by user:', password);
    console.log('   DB length:', user.password.length);
    console.log('   Sent length:', password.length);
    console.log('   Exact match:', user.password === password);
    
    if (user.password !== password) {
      console.log('\n   ✗ PASSWORDS DO NOT MATCH');
      console.log('='.repeat(60) + '\n');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('\n   ✓ PASSWORDS MATCH - LOGIN SUCCESS!');
    console.log('='.repeat(60) + '\n');
    
    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        clientId: user.clientId.toString(),
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get client data
app.get('/api/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    console.log('\n' + '='.repeat(60));
    console.log('📦 FETCHING CLIENT DATA');
    console.log('='.repeat(60));
    console.log('ClientId received:', clientId);
    console.log('ClientId type:', typeof clientId);

    if (!ObjectId.isValid(clientId)) {
      console.log('✗ Invalid ObjectId format');
      return res.status(400).json({ error: 'Invalid clientId' });
    }

    // Keep clientId as STRING - your data stores it as a string!
    const queryClientId = clientId;
    
    console.log('Query clientId (STRING):', queryClientId);
    console.log('Query clientId type:', typeof queryClientId);

    console.log('\n🔍 Querying collections:');
    console.log('   - Domains collection:', MONGODB_COLLECTION_DOMAINS);
    console.log('   - Brand guides collection:', MONGODB_COLLECTION_BRAND_GUIDES);
    console.log('   - Content briefs collection:', MONGODB_COLLECTION_CONTENT_BRIEFS);

    // First, let's see what's ACTUALLY in each collection
    console.log('\n🔎 CHECKING WHAT\'S IN COLLECTIONS...');
    
    const allBrandGuides = await db.collection(MONGODB_COLLECTION_BRAND_GUIDES).find({}).toArray();
    console.log(`   Total brand guides in collection: ${allBrandGuides.length}`);
    if (allBrandGuides.length > 0) {
      console.log('   Sample brand guide:');
      console.log('     clientId:', allBrandGuides[0].clientId, '(type:', typeof allBrandGuides[0].clientId, ')');
      console.log('     clientId equals queryClientId?', allBrandGuides[0].clientId === queryClientId);
      console.log('     clientId toString:', String(allBrandGuides[0].clientId));
    }

    const allBriefs = await db.collection(MONGODB_COLLECTION_CONTENT_BRIEFS).find({}).toArray();
    console.log(`   Total briefs in collection: ${allBriefs.length}`);
    if (allBriefs.length > 0) {
      console.log('   Sample brief:');
      console.log('     clientId:', allBriefs[0].clientId, '(type:', typeof allBriefs[0].clientId, ')');
      console.log('     clientId equals queryClientId?', allBriefs[0].clientId === queryClientId);
      console.log('     clientId toString:', String(allBriefs[0].clientId));
    }

    console.log('\n🔍 NOW QUERYING WITH clientId:', queryClientId, '(type:', typeof queryClientId, ')');

    const [domains, brandGuides, briefs] = await Promise.all([
      db.collection(MONGODB_COLLECTION_DOMAINS).find({ clientId: queryClientId }).toArray(),
      db.collection(MONGODB_COLLECTION_BRAND_GUIDES).find({ clientId: queryClientId }).toArray(),
      db.collection(MONGODB_COLLECTION_CONTENT_BRIEFS).find({ clientId: queryClientId }).sort({ createdAt: -1 }).toArray(),
    ]);

    console.log('\n✓ Query Results:');
    console.log(`   Domains found: ${domains.length}`);
    console.log(`   Brand guides found: ${brandGuides.length}`);
    console.log(`   Content briefs found: ${briefs.length}`);
    
    if (domains.length > 0) {
      console.log(`   First domain: ${domains[0].name}`);
    }
    console.log('='.repeat(60) + '\n');

    // Transform domains from brand guides if no domains collection
    const uniqueDomains = new Map();
    brandGuides.forEach(bg => {
      if (bg.domainId && !uniqueDomains.has(bg.domainId)) {
        uniqueDomains.set(bg.domainId, { id: bg.domainId, name: bg.domainId });
      }
    });
    briefs.forEach(b => {
      if (b.domainId && !uniqueDomains.has(b.domainId)) {
        uniqueDomains.set(b.domainId, { id: b.domainId, name: b.domainId });
      }
    });
    
    const domainsData = domains.length > 0 
      ? domains.map(d => ({ id: d._id?.toString() || d.id, name: d.name, clientId: typeof d.clientId === 'string' ? d.clientId : d.clientId?.toString() }))
      : Array.from(uniqueDomains.values());

    res.json({
      success: true,
      data: {
        domains: domainsData,
        brandGuides: brandGuides.map(bg => ({
          id: bg._id.toString(),
          domainId: bg.domainId,
          stylePrompt: bg.stylePrompt,
          toneOfVoice: bg.toneOfVoice,
          styleImageUrl: bg.styleImageUrl,
        })),
        briefs: briefs.map(b => ({
          id: b._id.toString(),
          domainId: b.domainId,
          title: b.title,
          brief: b.brief,
          content: b.content,
          status: b.status,
          contentType: b.contentType,
          scheduledAt: b.scheduledAt,
          heroImageUrl: b.heroImageUrl,
          createdAt: b.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching client data:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}\n`);
  });
});
