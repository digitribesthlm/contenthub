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
app.use(express.json({ limit: '100mb' })); // Allow large base64 image uploads
app.use(express.urlencoded({ limit: '100mb', extended: true })); // Also for form data

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

    const [domains, brandGuidesRaw, briefs] = await Promise.all([
      db.collection(MONGODB_COLLECTION_DOMAINS).find({ clientId: queryClientId }).toArray(),
      db.collection(MONGODB_COLLECTION_BRAND_GUIDES).find({ clientId: queryClientId }).toArray(),
      db.collection(MONGODB_COLLECTION_CONTENT_BRIEFS).find({ clientId: queryClientId }).sort({ createdAt: -1 }).toArray(),
    ]);

    // Debug: Check what fields are in the brand guides
    if (brandGuidesRaw.length > 0) {
      console.log('First brand guide fields:', Object.keys(brandGuidesRaw[0]));
      console.log('First brand guide data:', {
        domainId: brandGuidesRaw[0].domainId,
        styleImageData: brandGuidesRaw[0].styleImageData ? `exists (${brandGuidesRaw[0].styleImageData.substring(0, 30)}...)` : 'missing',
        styleImageMimeType: brandGuidesRaw[0].styleImageMimeType,
      });
    }
    
    const brandGuides = brandGuidesRaw;

    // Fix briefs without domainId - assign them to the first available domain or extract from brand guides
    const briefsWithDomain = briefs.map(brief => {
      if (!brief.domainId) {
        // Try to find a domain for this brief
        if (domains.length > 0) {
          brief.domainId = domains[0].id;
        } else if (brandGuides.length > 0) {
          brief.domainId = brandGuides[0].domainId;
        }
      }
      return brief;
    });

    console.log(`✓ Fetched client data - ${domains.length} domains, ${brandGuides.length} guides, ${briefsWithDomain.length} briefs`);

    // Transform domains from brand guides if no domains collection
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
          // Reconstruct data URL from saved image data (prioritize saved data over old URL)
          console.log('Brand Guide fields:', {
            domainId: bg.domainId,
            hasStyleImageData: !!bg.styleImageData,
            styleImageDataLength: bg.styleImageData ? bg.styleImageData.length : 0,
            styleImageMimeType: bg.styleImageMimeType,
          });
          
          let styleImageUrl = bg.styleImageUrl;
          if (bg.styleImageData && bg.styleImageData.length > 0) {
            const mimeType = bg.styleImageMimeType || 'image/jpeg';
            styleImageUrl = `data:${mimeType};base64,${bg.styleImageData}`;
            console.log(`✓ Reconstructed data URL for: ${bg.domainId}`);
          } else {
            console.log(`ℹ Using original URL for: ${bg.domainId}`);
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
    const { brandGuideId } = req.params;
    const { styleImageData, styleImageMimeType } = req.body;

    console.log('\n' + '='.repeat(60));
    console.log('💾 SAVING BRAND GUIDE IMAGE');
    console.log('='.repeat(60));
    console.log('Brand Guide ID:', brandGuideId);
    console.log('Is valid ObjectId?', ObjectId.isValid(brandGuideId));
    console.log('Image data received?', !!styleImageData);
    console.log('Image size:', styleImageData ? styleImageData.length : 0, 'bytes');

    if (!ObjectId.isValid(brandGuideId)) {
      console.log('❌ Invalid ObjectId');
      return res.status(400).json({ error: 'Invalid brandGuideId' });
    }

    if (!styleImageData) {
      console.log('❌ No image data');
      return res.status(400).json({ error: 'Image data is required' });
    }

    const objectId = new ObjectId(brandGuideId);
    console.log('Querying with ObjectId:', objectId.toString());

    const result = await db.collection(MONGODB_COLLECTION_BRAND_GUIDES).updateOne(
      { _id: objectId },
      {
        $set: {
          styleImageData: styleImageData, // Base64 encoded image
          styleImageMimeType: styleImageMimeType || 'image/jpeg',
          styleImageUpdatedAt: new Date().toISOString(),
        }
      }
    );

    console.log('Update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      acknowledged: result.acknowledged,
    });

    if (result.matchedCount === 0) {
      console.log('❌ Brand guide not found');
      return res.status(404).json({ error: 'Brand guide not found' });
    }

    console.log('✅ Image saved successfully');
    console.log('='.repeat(60) + '\n');
    res.json({ success: true, message: 'Image saved successfully' });
  } catch (error) {
    console.error('❌ Error saving brand guide image:', error.message);
    console.log('='.repeat(60) + '\n');
    res.status(500).json({ error: 'Server error' });
  }
});

// Debug endpoint to check brand guide data
app.get('/api/debug/brand-guides', async (req, res) => {
  try {
    const allBrandGuides = await db.collection(MONGODB_COLLECTION_BRAND_GUIDES).find({}).toArray();
    res.json({
      total: allBrandGuides.length,
      guides: allBrandGuides.map(bg => ({
        id: bg._id.toString(),
        domainId: bg.domainId,
        clientId: bg.clientId,
        hasStyleImageData: !!bg.styleImageData,
        styleImageDataLength: bg.styleImageData ? bg.styleImageData.length : 0,
        styleImageMimeType: bg.styleImageMimeType,
        styleImageUpdatedAt: bg.styleImageUpdatedAt,
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
