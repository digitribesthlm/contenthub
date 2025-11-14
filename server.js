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

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Query MongoDB users collection
    const user = await db.collection(MONGODB_COLLECTION_USERS).findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Simple string comparison
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✅ Login successful for:', email);
    
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

    if (!ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'Invalid clientId' });
    }

    // Keep clientId as STRING - stored as string in database
    const queryClientId = clientId;

    const [domains, brandGuides, briefs] = await Promise.all([
      db.collection(MONGODB_COLLECTION_DOMAINS).find({ clientId: queryClientId }).toArray(),
      db.collection(MONGODB_COLLECTION_BRAND_GUIDES).find({ clientId: queryClientId }).toArray(),
      db.collection(MONGODB_COLLECTION_CONTENT_BRIEFS).find({ clientId: queryClientId }).sort({ createdAt: -1 }).toArray(),
    ]);

    console.log(`✓ Fetched client data - ${domains.length} domains, ${brandGuides.length} guides, ${briefs.length} briefs`);

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
