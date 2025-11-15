import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();

// Load config from environment variables
const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE;
const MONGODB_COLLECTION_USERS = process.env.MONGODB_COLLECTION_USERS;
const MONGODB_COLLECTION_DOMAINS = process.env.MONGODB_COLLECTION_DOMAINS || 'domains';
const MONGODB_COLLECTION_BRAND_GUIDES = process.env.MONGODB_COLLECTION_BRAND_GUIDES || 'brand_guides';
const MONGODB_COLLECTION_CONTENT_BRIEFS = process.env.MONGODB_COLLECTION_CONTENT_BRIEFS || 'content_briefs';

let db;
let client;

// Connect to MongoDB (reuse connection in serverless)
const connectDB = async () => {
  if (db) return db;
  
  try {
    client = new MongoClient(MONGODB_URL);
    await client.connect();
    db = client.db(MONGODB_DATABASE);
    console.log('✓ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    throw error;
  }
};

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await db.collection(MONGODB_COLLECTION_USERS).findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

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

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  const { clientId } = req.params;
  const requestClientId = req.get('X-Client-ID');
  
  if (!requestClientId || requestClientId !== clientId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Get client data
app.get('/api/client/:clientId', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const { clientId } = req.params;

    if (!ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'Invalid clientId' });
    }

    const queryClientId = clientId;

    const [domains, brandGuidesRaw, briefs] = await Promise.all([
      db.collection(MONGODB_COLLECTION_DOMAINS).find({ clientId: queryClientId }).toArray(),
      db.collection(MONGODB_COLLECTION_BRAND_GUIDES).find({ clientId: queryClientId }).toArray(),
      db.collection(MONGODB_COLLECTION_CONTENT_BRIEFS).find({ clientId: queryClientId }).sort({ createdAt: -1 }).toArray(),
    ]);

    const brandGuides = brandGuidesRaw;

    const briefsWithDomain = briefs.map(brief => {
      if (!brief.domainId) {
        if (domains.length > 0) {
          brief.domainId = domains[0].id;
        } else if (brandGuides.length > 0) {
          brief.domainId = brandGuides[0].domainId;
        }
      }
      return brief;
    });

    const uniqueDomains = new Map();
    brandGuides.forEach(bg => {
      if (bg.domainId && !uniqueDomains.has(bg.domainId)) {
        uniqueDomains.set(bg.domainId, { id: bg.domainId, name: bg.domainId });
      }
    });
    briefsWithDomain.forEach(b => {
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
        brandGuides: brandGuides.map(bg => {
          let styleImageUrl = bg.styleImageUrl;
          if (bg.styleImageData && bg.styleImageData.length > 0) {
            const mimeType = bg.styleImageMimeType || 'image/jpeg';
            styleImageUrl = `data:${mimeType};base64,${bg.styleImageData}`;
          }
          
          return {
            id: bg._id.toString(),
            domainId: bg.domainId,
            stylePrompt: bg.stylePrompt,
            toneOfVoice: bg.toneOfVoice,
            styleImageUrl: styleImageUrl,
            styleImageData: bg.styleImageData,
            styleImageMimeType: bg.styleImageMimeType,
          };
        }),
        briefs: briefsWithDomain.map(b => ({
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
          clientId: b.clientId,
        })),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching client data:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update brand guide with image data
app.post('/api/brand-guide/:brandGuideId/image', async (req, res) => {
  try {
    await connectDB();
    const { brandGuideId } = req.params;
    const { styleImageData, styleImageMimeType } = req.body;

    if (!ObjectId.isValid(brandGuideId)) {
      return res.status(400).json({ error: 'Invalid brandGuideId' });
    }

    if (!styleImageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const objectId = new ObjectId(brandGuideId);

    const result = await db.collection(MONGODB_COLLECTION_BRAND_GUIDES).updateOne(
      { _id: objectId },
      {
        $set: {
          styleImageData: styleImageData,
          styleImageMimeType: styleImageMimeType || 'image/jpeg',
          styleImageUpdatedAt: new Date().toISOString(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Brand guide not found' });
    }

    res.json({ success: true, message: 'Image saved successfully' });
  } catch (error) {
    console.error('❌ Error saving brand guide image:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete brief
app.delete('/api/brief/:briefId', async (req, res) => {
  try {
    await connectDB();
    const { briefId } = req.params;

    if (!ObjectId.isValid(briefId)) {
      return res.status(400).json({ error: 'Invalid briefId' });
    }

    const objectId = new ObjectId(briefId);

    const result = await db.collection(MONGODB_COLLECTION_CONTENT_BRIEFS).deleteOne(
      { _id: objectId }
    );

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Brief not found' });
    }

    console.log('✅ Brief deleted:', briefId);
    res.json({ success: true, message: 'Brief deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting brief:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel
export default app;
