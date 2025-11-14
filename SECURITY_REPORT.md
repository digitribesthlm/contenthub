# Security Vulnerabilities - Content Hub

## CRITICAL ISSUES 🔴

### 1. **NO AUTHENTICATION ON DATA ENDPOINTS**
- **Location**: `/api/client/:clientId` endpoint (server.js line 106)
- **Issue**: Anyone can fetch ANY client's data by guessing or trying different clientIds
- **Risk**: Complete data breach - all briefs, brand guides, domains exposed
- **Fix**: Add JWT token validation or session middleware
```javascript
// VULNERABLE - NO AUTH:
app.get('/api/client/:clientId', async (req, res) => {
  // Any user can access any clientId!
}
```

### 2. **PLAINTEXT PASSWORD STORAGE & COMPARISON**
- **Location**: server.js line 84-86
- **Issue**: Passwords stored as plaintext, compared with `===`
- **Risk**: If database is breached, all passwords exposed. No protection against timing attacks
- **Fix**: Use bcrypt or similar for password hashing
```javascript
// VULNERABLE - PLAINTEXT:
if (user.password !== password) { // Timing attack possible
  return res.status(401).json({ error: 'Invalid email or password' });
}
```

### 3. **NO RATE LIMITING ON LOGIN**
- **Location**: `/api/auth/login` endpoint
- **Issue**: Unlimited login attempts = brute force vulnerability
- **Risk**: Attacker can try millions of passwords
- **Fix**: Add rate limiter (npm install express-rate-limit)

### 4. **OPEN CORS - ACCEPTS REQUESTS FROM ANYWHERE**
- **Location**: server.js line 49
- **Issue**: `app.use(cors())` with no restrictions
- **Risk**: Any website can make requests to your API
- **Fix**: Whitelist specific origins
```javascript
// VULNERABLE:
app.use(cors()); // Allows all origins

// SECURE:
app.use(cors({ 
  origin: ['https://yourdomain.com'], 
  credentials: true 
}));
```

### 5. **NO INPUT VALIDATION**
- **Location**: All endpoints
- **Issue**: No validation of email format, password strength, clientId format
- **Risk**: Injection attacks, invalid data
- **Fix**: Use validator library
```javascript
// VULNERABLE:
const { email, password } = req.body;
// No checks!

// SECURE:
const validator = require('validator');
if (!validator.isEmail(email)) return res.status(400).json({error: 'Invalid email'});
```

### 6. **GENERIC ERROR MESSAGES LEAK INFO**
- **Location**: server.js line 80, 85
- **Issue**: Same error message "Invalid email or password" is good, but server logs login attempts with full email
- **Risk**: Server logs expose all login attempts
- **Fix**: Don't log full emails, hash them

---

## HIGH ISSUES 🟠

### 7. **NO HTTPS ENFORCED**
- **Issue**: Passwords sent over HTTP (if not using HTTPS in production)
- **Fix**: Force HTTPS in production, set secure cookies

### 8. **LARGE FILE UPLOAD LIMIT**
- **Location**: server.js line 50
- **Issue**: `limit: '100mb'` allows DoS attacks with huge payloads
- **Fix**: Reduce to reasonable size (e.g., 10mb)

### 9. **NO HELMET PROTECTION**
- **Issue**: Missing HTTP security headers
- **Fix**: `npm install helmet` and use it

### 10. **DEBUG ENDPOINT EXPOSED**
- **Location**: `/api/debug/brand-guides` endpoint
- **Issue**: Leaks all brand guide metadata in production
- **Fix**: Remove or protect with authentication

### 11. **NO ENVIRONMENT VARIABLE VALIDATION**
- **Location**: vite.config.ts line 11-12
- **Issue**: ALL environment variables exposed to frontend via `define`
- **Risk**: API keys, secrets visible in browser JavaScript
- **Fix**: Only expose VITE_* prefixed variables
```javascript
// VULNERABLE:
Object.keys(env).forEach(key => {
  define[`import.meta.env.${key}`] = JSON.stringify(env[key]);
});

// SECURE:
Object.keys(env).forEach(key => {
  if (key.startsWith('VITE_')) {
    define[`import.meta.env.${key}`] = JSON.stringify(env[key]);
  }
});
```

### 12. **NO WEBHOOK SIGNATURE VERIFICATION**
- **Issue**: n8n webhooks not verified - could receive fake data
- **Fix**: Verify webhook signatures from n8n

---

## MEDIUM ISSUES 🟡

### 13. **CLIENTID ENUMERATION**
- **Issue**: Can enumerate all client IDs by trying different values
- **Risk**: Discover all clients in system
- **Fix**: Require authentication + authorization checks

### 14. **NO RATE LIMITING ON ENDPOINTS**
- **Issue**: No protection against API spam
- **Fix**: Add rate limiting globally

### 15. **MISSING REQUEST VALIDATION**
- **Issue**: `brandGuideId` only checks ObjectId validity, not authorization
- **Risk**: User can modify other users' brand guides
- **Fix**: Verify ownership before allowing updates

---

## RECOMMENDATIONS 🛡️

### Immediate (Before Going Public):
1. ✅ Add authentication middleware to all data endpoints
2. ✅ Hash passwords with bcrypt
3. ✅ Add rate limiting to login
4. ✅ Lock down CORS to your domain only
5. ✅ Remove `/api/debug/*` endpoints or protect them
6. ✅ Fix vite.config.ts to not expose all env vars

### Short-term:
7. Add input validation to all endpoints
8. Add helmet for security headers
9. Implement JWT tokens
10. Add authorization checks (verify user owns data)

### Long-term:
11. Add audit logging
12. Implement API key system for n8n webhooks
13. Add monitoring/alerting
14. Penetration testing

---

## Quick Security Checklist:
- [ ] No hardcoded secrets in code
- [ ] Authentication on all protected endpoints
- [ ] Password hashing (bcrypt)
- [ ] Rate limiting on login
- [ ] CORS locked down
- [ ] Input validation everywhere
- [ ] No debug endpoints in production
- [ ] HTTPS enforced
- [ ] Security headers (helmet)
- [ ] No sensitive data in logs

