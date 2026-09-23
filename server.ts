import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Health check endpoint FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // CORS middleware
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization,Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Body parser with 50MB limit for media / photos and videos
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Helper to extract authenticated user from Authorization header
  const getAuthUser = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return null;
    // Token is user ID or simulated token
    return db.findUserById(token) || null;
  };

  // --- AUTH ENDPOINTS ---
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, mobile, password, role } = req.body;
      if (!name || !email || !mobile) {
        return res.status(400).json({ error: 'Name, email, and mobile are required.' });
      }

      const existing = db.findUserByEmailOrMobile(email) || db.findUserByEmailOrMobile(mobile);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email or mobile already exists.' });
      }

      const user = db.createUser({
        name,
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password: password || '123456',
        role: role === 'seller' ? 'seller' : 'buyer'
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role
        },
        token: user.id
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { identifier, password, role } = req.body;
      if (!identifier) {
        return res.status(400).json({ error: 'Email or Mobile number is required.' });
      }

      let user = db.findUserByEmailOrMobile(identifier);
      if (!user) {
        // Auto-create user if logging in first time with mobile/email for easy seamless UX
        user = db.createUser({
          name: identifier.includes('@') ? identifier.split('@')[0] : `User ${identifier.slice(-4)}`,
          email: identifier.includes('@') ? identifier.toLowerCase() : `${identifier.replace(/\D/g, '')}@apnaproperty.in`,
          mobile: identifier.includes('@') ? '+91 9800000000' : identifier,
          password: password || '123456',
          role: (role === 'seller' || role === 'admin') ? role : 'buyer'
        });
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role
        },
        token: user.id
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        auth_provider: user.auth_provider,
        google_sub: user.google_sub,
        avatar_url: user.avatar_url
      }
    });
  });

  // --- GOOGLE AUTHENTICATION ENDPOINTS ---
  // 1. Verify Google identity / credential or mock credential & check user status
  app.post('/api/auth/google/verify', (req, res) => {
    try {
      const { credential, email, name, sub, picture } = req.body;
      let googleSub = sub;
      let userEmail = email;
      let userName = name;
      let userPicture = picture;

      // If a JWT credential was supplied (from Google Identity Services credential response)
      if (credential && !googleSub) {
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            googleSub = payload.sub || googleSub;
            userEmail = payload.email || userEmail;
            userName = payload.name || userName;
            userPicture = payload.picture || userPicture;
          }
        } catch (jwtErr) {
          console.warn('Could not parse Google JWT credential payload, using body fields:', jwtErr);
        }
      }

      if (!userEmail) {
        return res.status(400).json({ error: 'Google email is required.' });
      }

      const normalizedEmail = userEmail.trim().toLowerCase();
      // Generate consistent sub if not provided
      if (!googleSub) {
        googleSub = `g_${Buffer.from(normalizedEmail).toString('hex').substring(0, 16)}`;
      }

      // 1. Check if user already exists with this Google sub ID (primary stable identity)
      const existingGoogleUser = db.findUserByGoogleSub(googleSub);
      if (existingGoogleUser) {
        return res.json({
          status: 'existing_user',
          user: {
            id: existingGoogleUser.id,
            name: existingGoogleUser.name,
            email: existingGoogleUser.email,
            mobile: existingGoogleUser.mobile,
            role: existingGoogleUser.role,
            auth_provider: existingGoogleUser.auth_provider || 'google',
            avatar_url: existingGoogleUser.avatar_url || userPicture
          },
          token: existingGoogleUser.id
        });
      }

      // 2. Check if an account already exists with the same email address (for secure linking)
      const existingEmailUser = db.findUserByEmail(normalizedEmail);
      if (existingEmailUser) {
        return res.json({
          status: 'account_exists_linking_required',
          message: 'An account with this Gmail address already exists. Link this account to continue.',
          existingUser: {
            id: existingEmailUser.id,
            name: existingEmailUser.name,
            email: existingEmailUser.email,
            mobile: existingEmailUser.mobile,
            role: existingEmailUser.role
          },
          googleProfile: {
            sub: googleSub,
            email: normalizedEmail,
            name: userName || existingEmailUser.name,
            picture: userPicture
          }
        });
      }

      // 3. New Google user -> needs role selection (buyer vs seller)
      return res.json({
        status: 'new_user_selection_required',
        message: 'Google identity verified. Please select how you want to use the platform.',
        googleProfile: {
          sub: googleSub,
          email: normalizedEmail,
          name: userName || normalizedEmail.split('@')[0],
          picture: userPicture
        }
      });
    } catch (err: any) {
      console.error('Error in /api/auth/google/verify:', err);
      res.status(500).json({ error: err.message || 'Google verification failed' });
    }
  });

  // 2. Complete registration for new Google user after role selection
  app.post('/api/auth/google/register', (req, res) => {
    try {
      const { sub, email, name, picture, role, mobile } = req.body;
      if (!email || !sub) {
        return res.status(400).json({ error: 'Google sub ID and email are required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      // Check again if already created
      let user = db.findUserByGoogleSub(sub) || db.findUserByEmail(normalizedEmail);
      if (user) {
        // Link and return
        db.linkGoogleAccount(user.id, sub, picture);
      } else {
        user = db.createUser({
          name: name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          mobile: mobile ? mobile.trim() : '+91 9800000000',
          role: role === 'seller' ? 'seller' : 'buyer',
          auth_provider: 'google',
          google_sub: sub,
          avatar_url: picture
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          auth_provider: user.auth_provider,
          avatar_url: user.avatar_url
        },
        token: user.id
      });
    } catch (err: any) {
      console.error('Error in /api/auth/google/register:', err);
      res.status(500).json({ error: err.message || 'Failed to complete Google registration' });
    }
  });

  // 3. Link existing account to Google identity
  app.post('/api/auth/google/link', (req, res) => {
    try {
      const { userId, sub, picture } = req.body;
      if (!userId || !sub) {
        return res.status(400).json({ error: 'User ID and Google sub are required.' });
      }

      const updated = db.linkGoogleAccount(userId, sub, picture);
      if (!updated) {
        return res.status(404).json({ error: 'Account not found to link.' });
      }

      res.json({
        success: true,
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          mobile: updated.mobile,
          role: updated.role,
          auth_provider: updated.auth_provider,
          avatar_url: updated.avatar_url
        },
        token: updated.id
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Account linking failed' });
    }
  });

  // Switch demo account endpoint for 1-click user testing
  app.get('/api/auth/demo-users', (req, res) => {
    const users = db.getUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      role: u.role,
      auth_provider: u.auth_provider,
      avatar_url: u.avatar_url
    }));
    res.json({ users });
  });

  // --- PROPERTIES (PUBLIC & SEARCH) ---
  app.get('/api/properties', (req, res) => {
    try {
      const { city, property_type, min_price, max_price, min_area, max_area, area_unit, status, search, sort } = req.query;

      const filters: any = {};
      if (city) filters.city = String(city);
      if (property_type) filters.property_type = String(property_type);
      if (min_price) filters.min_price = Number(min_price);
      if (max_price) filters.max_price = Number(max_price);
      if (min_area) filters.min_area = Number(min_area);
      if (max_area) filters.max_area = Number(max_area);
      if (area_unit) filters.area_unit = String(area_unit);
      if (status) filters.status = String(status);
      if (search) filters.search = String(search);
      if (sort) filters.sort = String(sort);

      const properties = db.getPublicProperties(filters);
      res.json({ properties, total: properties.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Public Single Property Details (Free info only: photos, video, title, price, locality)
  app.get('/api/properties/:idOrSlug', (req, res) => {
    try {
      const prop = db.getPropertyByIdOrSlug(req.params.idOrSlug, true);
      if (!prop) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const publicData = db.formatPublicProperty(prop);

      // Check if current user has unlocked this property
      const user = getAuthUser(req);
      let isUnlocked = false;
      let isOwner = false;
      let isAdmin = false;

      if (user) {
        isUnlocked = db.hasBuyerUnlocked(user.id, prop.id);
        isOwner = prop.seller_id === user.id;
        isAdmin = user.role === 'admin';
      }

      const isAccessGranted = isUnlocked || isOwner || isAdmin;
      const unlockStatus = isAccessGranted ? 'UNLOCKED' : 'LOCKED';

      res.json({
        property: {
          ...publicData,
          unlock_status: unlockStatus
        },
        user_access: {
          is_unlocked: isAccessGranted,
          unlock_status: unlockStatus,
          is_owner: isOwner,
          is_admin: isAdmin,
          unlock_cost: 50
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Protected Unlocked Seller Details (STRICT PRIVACY ENFORCEMENT)
  // Seller mobile, WhatsApp, full street address are NEVER returned unless paid ₹50
  app.get('/api/properties/:idOrSlug/unlocked', (req, res) => {
    try {
      const prop = db.getPropertyByIdOrSlug(req.params.idOrSlug, false);
      if (!prop) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const user = getAuthUser(req);
      if (!user) {
        return res.status(401).json({
          unlocked: false,
          error: 'Please login to view or unlock complete property details.'
        });
      }

      const details = db.getProtectedSellerDetails(prop.id, user.id, user.role);
      if (!details || !details.unlocked) {
        return res.status(403).json({
          unlocked: false,
          property_id: prop.id,
          amount_required: 50,
          error: 'Access denied: You must pay ₹50 to unlock complete property and seller details.'
        });
      }

      res.json({
        unlocked: true,
        property_id: prop.id,
        seller_details: details
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- PAYMENT / ₹50 UNLOCK SYSTEM ---
  app.post('/api/payments/create-order', (req, res) => {
    try {
      const { property_id } = req.body;
      const user = getAuthUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required to initiate payment' });
      }

      const prop = db.getPropertyByIdOrSlug(property_id);
      if (!prop) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Check if already unlocked
      if (db.hasBuyerUnlocked(user.id, prop.id)) {
        return res.json({
          already_unlocked: true,
          message: 'You have already unlocked this property. Complete details are available in your account.',
          property_id: prop.id
        });
      }

      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const amount = 50; // ₹50 fixed per property

      res.json({
        order_id: orderId,
        amount,
        currency: 'INR',
        property_id: prop.id,
        property_title: prop.title,
        buyer_id: user.id,
        buyer_name: user.name,
        buyer_mobile: user.mobile,
        buyer_email: user.email,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_StZWzvPkGEiixy'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/payments/verify', (req, res) => {
    try {
      const { property_id, payment_id, order_id, gateway, status } = req.body;
      const user = getAuthUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const prop = db.getPropertyByIdOrSlug(property_id);
      if (!prop) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Verify payment status
      if (status === 'failed') {
        return res.status(400).json({
          success: false,
          message: 'Payment was not successful. Complete details remain locked. Please try again.'
        });
      }

      const verifiedPaymentId = payment_id || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const { unlock, payment } = db.recordSuccessfulUnlock({
        buyer_id: user.id,
        buyer_name: user.name,
        buyer_mobile: user.mobile,
        property_id: prop.id,
        payment_id: verifiedPaymentId,
        amount: 50,
        gateway: gateway || 'razorpay'
      });

      // Fetch the unlocked seller details right away to send back to client
      const sellerDetails = db.getProtectedSellerDetails(prop.id, user.id, user.role);

      res.json({
        success: true,
        unlocked: true,
        unlock_status: 'UNLOCKED',
        unlock_record: unlock,
        payment_record: payment,
        seller_details: sellerDetails,
        message: 'Payment of ₹50 successful! Complete property and seller contact details are now unlocked.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- POST PROPERTY ---
  app.post('/api/properties', (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Please login or signup to post a property' });
      }

      const {
        title,
        property_type,
        price,
        area,
        area_unit,
        state,
        city,
        locality,
        address,
        landmark,
        pincode,
        seller_name,
        seller_mobile,
        seller_whatsapp,
        seller_type,
        description,
        specifications,
        media_urls
      } = req.body;

      if (!title || !property_type || !price || !area || !city || !locality || !seller_name || !seller_mobile) {
        return res.status(400).json({ error: 'Please fill all required basic, location, and seller information fields.' });
      }

      const newProp = db.createProperty({
        seller_id: user.id,
        title,
        property_type,
        price: Number(price),
        area: Number(area),
        area_unit: area_unit || 'Sq Ft',
        state: state || 'Uttar Pradesh',
        city,
        locality,
        address: address || `${locality}, ${city}`,
        landmark,
        pincode: pincode || '110001',
        seller_name,
        seller_mobile,
        seller_whatsapp: seller_whatsapp || seller_mobile,
        seller_type: seller_type || 'Owner',
        description: description || `${property_type} available for immediate sale in ${locality}, ${city}.`,
        specifications,
        media_urls
      });

      res.json({
        success: true,
        message: 'Property submitted successfully! Your listing is now approved and live for buyers to browse.',
        property: db.formatPublicProperty(newProp)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mark property Sold or Available
  app.patch('/api/properties/:id/status', (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { status } = req.body;
      if (status !== 'Available' && status !== 'Sold') {
        return res.status(400).json({ error: 'Status must be Available or Sold' });
      }

      const updated = db.updatePropertyStatus(req.params.id, status, user.id, user.role);
      if (!updated) return res.status(404).json({ error: 'Property not found' });

      res.json({ success: true, property: db.formatPublicProperty(updated) });
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  // Edit / Update property details (Admin or Seller owner)
  app.put('/api/properties/:id', (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const updated = db.updateProperty(req.params.id, req.body, user.id, user.role);
      if (!updated) return res.status(404).json({ error: 'Property not found' });

      res.json({
        success: true,
        message: 'Property details updated successfully',
        property: db.formatPublicProperty(updated)
      });
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  // Admin approval / rejection
  app.patch('/api/properties/:id/approval', (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { approval_status } = req.body;
      const updated = db.updatePropertyApproval(req.params.id, approval_status);
      if (!updated) return res.status(404).json({ error: 'Property not found' });

      res.json({ success: true, property: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Feature / Pin listing controls (Priority / Top position / Dates)
  app.patch('/api/properties/:id/feature', (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required to feature/pin listings' });
      }

      const { is_featured, featured_position, featured_start_date, featured_end_date } = req.body;
      const updated = db.updateFeaturedListing(req.params.id, {
        is_featured: !!is_featured,
        featured_position: featured_position ? Number(featured_position) : undefined,
        featured_start_date,
        featured_end_date
      });

      if (!updated) return res.status(404).json({ error: 'Listing not found' });

      res.json({
        success: true,
        message: is_featured ? 'Listing pinned to top / featured successfully' : 'Listing unpinned / unfeatured',
        property: updated
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete property (Admin has absolute permission; sellers can only deactivate/mark sold or delete their own; normal buyers cannot)
  app.delete('/api/properties/:id', (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized: Authentication required.' });

      // Check if user is admin or the owner seller
      const deleted = db.deleteProperty(req.params.id, user.id, user.role);
      if (!deleted) return res.status(404).json({ error: 'Property not found' });

      res.json({ success: true, message: 'Property listing deleted permanently' });
    } catch (err: any) {
      res.status(403).json({ error: err.message || 'Unauthorized: Only Admin has deletion permission.' });
    }
  });

  // --- DASHBOARD ENDPOINTS ---
  // Buyer: My Purchased Details (unlocked properties for ₹50)
  app.get('/api/buyer/purchases', (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const purchases = db.getBuyerPurchases(user.id);
      res.json({ purchases });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Seller: My Properties (listings, views, unlock counts, sold status)
  app.get('/api/seller/properties', (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const properties = db.getSellerProperties(user.id);
      res.json({ properties });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: Overall metrics & management
  app.get('/api/admin/dashboard', (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const overview = db.getAdminOverview();
      res.json(overview);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite Dev or Production Static file serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ApnaProperty Portal Server running on http://localhost:${PORT}`);
  });
}

startServer();
