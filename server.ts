import express from 'express';
import path from 'path';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase Admin SDK
admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

// Reference correct custom database instance
const adminDb = getFirestore(firebaseConfig.firestoreDatabaseId);

// Lazy initialize Stripe
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    if (key.startsWith('rzp_')) {
      throw new Error('Your STRIPE_SECRET_KEY is configured with a Razorpay API key (starts with "rzp_"). Please set a valid Stripe secret key (starts with "sk_") in your settings, or use UPI ID/App redirect simulation instead.');
    }
    stripeClient = new Stripe(key, {
      apiVersion: '2025-02-11' as any,
    });
  }
  return stripeClient;
}

// Lazy initialize Razorpay
let razorpayClient: Razorpay | null = null;
function getRazorpay(): any {
  if (!razorpayClient) {
    let keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    let keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Fallback if they configured their Razorpay Key ID in the STRIPE_SECRET_KEY slot
    if (!keyId && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('rzp_')) {
      keyId = process.env.STRIPE_SECRET_KEY;
    }

    if (!keyId) {
      throw new Error('RAZORPAY_KEY_ID or VITE_RAZORPAY_KEY_ID environment variable is required');
    }

    const RazorpayConstructor = (Razorpay as any).default || Razorpay;
    razorpayClient = new RazorpayConstructor({
      key_id: keyId,
      key_secret: keySecret || 'placeholder_secret',
    });
  }
  return razorpayClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook MUST be defined BEFORE general body parsers to access raw request body
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.warn('[Stripe Webhook] Signature or secret missing');
      return res.status(400).send('Webhook error: Signature or secret missing');
    }

    let event: Stripe.Event;

    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Stripe Webhook] Checkout session completed: ${session.id}`);
        await handleSuccessfulPayment(session.metadata);
      } else if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as Stripe.PaymentIntent;
        console.log(`[Stripe Webhook] Payment intent succeeded: ${intent.id}`);
        await handleSuccessfulPayment(intent.metadata);
      }
    } catch (dbErr: any) {
      console.error(`[Stripe Webhook] Database update failed:`, dbErr);
      return res.status(500).send(`Database Error: ${dbErr.message}`);
    }

    res.json({ received: true });
  });

  // Regular middlewares for standard JSON requests
  app.use(express.json());

  // API: Create Stripe Checkout Session (Option A)
  app.post('/api/payments/create-checkout-session', async (req, res) => {
    try {
      const { items, orderId, userId, userName, userEmail, mobile, address, notes, total, pointsToRedeem, pointsEarned } = req.body;
      
      const stripe = getStripe();
      
      // Build Stripe Line Items
      const lineItems = items.map((item: any) => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
            description: item.customization ? `Rotis: ${item.customization.rotiType}, Rice: ${item.customization.riceType}` : undefined,
          },
          unit_amount: Math.round(item.price * 100), // in Paisa for INR
        },
        quantity: item.quantity,
      }));

      // Apply Points discount as a line item if applicable
      const discount = pointsToRedeem ? pointsToRedeem / 10 : 0;
      if (discount > 0) {
        lineItems.push({
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Loyalty Points Discount Redeemed',
            },
            unit_amount: -Math.round(discount * 100),
          },
          quantity: 1,
        });
      }

      const appUrl = process.env.APP_URL || 'http://localhost:3000';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${appUrl}/?stripe_status=success&order_id=${orderId}`,
        cancel_url: `${appUrl}/?stripe_status=cancel&order_id=${orderId}`,
        metadata: {
          orderId,
          userId,
          userName,
          userEmail,
          mobile,
          address,
          notes: notes || '',
          total: String(total),
          pointsToRedeem: String(pointsToRedeem || 0),
          pointsEarned: String(pointsEarned || 0),
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error('[Stripe API] Error creating checkout session:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // API: Create Payment Intent (Option B)
  app.post('/api/payments/create-intent', async (req, res) => {
    try {
      const { amount, orderId, userId, userName, userEmail, mobile, address, notes, pointsToRedeem, pointsEarned } = req.body;
      const stripe = getStripe();
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Paisa for INR
        currency: 'inr',
        metadata: {
          orderId,
          userId,
          userName,
          userEmail,
          mobile,
          address,
          notes: notes || '',
          total: String(amount),
          pointsToRedeem: String(pointsToRedeem || 0),
          pointsEarned: String(pointsEarned || 0),
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err: any) {
      console.error('[Stripe API] Error creating PaymentIntent:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // API: Send email via Resend proxy safely to avoid CORS and protect API Key
  app.post('/api/emails/send', async (req, res) => {
    try {
      const { to, subject, html } = req.body;
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey || resendApiKey === 'placeholder') {
        return res.json({ success: true, mocked: true, message: 'Resend API key not configured, local simulation successful' });
      }

      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'The Tawa Box <orders@tawabox.com>',
          to: Array.isArray(to) ? to : [to],
          subject,
          html
        })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Resend API returned status ${resp.status}: ${errText}`);
      }

      const data = await resp.json();
      res.json({ success: true, data });
    } catch (err: any) {
      console.error('[Email API Error]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // API: Config check for frontend
  app.get('/api/payments/config', (req, res) => {
    const key = process.env.STRIPE_SECRET_KEY || '';
    const isMconfigured = key.startsWith('rzp_');
    res.json({
      stripeConfigured: !!key && !isMconfigured,
      isMisconfigured: isMconfigured,
      publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    });
  });

  // API: Create Razorpay Order
  app.post('/api/payments/razorpay/create-order', async (req, res) => {
    let amountVal = 0;
    try {
      const { amount, orderId } = req.body || {};
      amountVal = Number(amount) || 0;
      const razorpay = getRazorpay();
      
      const options = {
        amount: Math.round(amountVal * 100), // amount in paisa (smallest currency unit)
        currency: 'INR',
        receipt: `receipt_${orderId || Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      };

      const rzpOrder = await razorpay.orders.create(options);
      res.json({
        id: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId: (razorpay as any).key_id || process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || ''
      });
    } catch (err: any) {
      console.warn('[Razorpay API Warning] Error creating order, triggering high-fidelity sandbox simulation:', err.message);
      // Fallback in case of lack of credentials or actual API errors, return a simulated order id for seamless UI testing
      const mockOrderId = `order_sim_${Math.random().toString(36).substr(2, 9)}`;
      let keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
      if (!keyId && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('rzp_')) {
        keyId = process.env.STRIPE_SECRET_KEY;
      }
      res.json({
        id: mockOrderId,
        amount: Math.round(amountVal * 100) || 24900,
        currency: 'INR',
        keyId: keyId || 'rzp_test_placeholder',
        simulated: true,
        message: err.message || 'Simulation mode triggered'
      });
    }
  });

  // API: Razorpay configuration check
  app.get('/api/payments/razorpay/config', (req, res) => {
    let keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
    if (!keyId && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('rzp_')) {
      keyId = process.env.STRIPE_SECRET_KEY;
    }
    res.json({
      configured: !!keyId,
      keyId: keyId,
    });
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

async function handleSuccessfulPayment(metadata: any) {
  if (!metadata || !metadata.orderId) return;

  const { orderId, userId, userName, userEmail, mobile, address, notes, total, pointsToRedeem, pointsEarned } = metadata;

  // Persist order in Firestore
  const orderRef = adminDb.collection('orders').doc(orderId);
  
  await orderRef.set({
    id: orderId,
    userId: userId || 'guest',
    userName: userName || 'Customer',
    userEmail: userEmail || 'guest@tawabox.com',
    mobile: mobile || '',
    address: address || '',
    notes: notes || '',
    total: parseFloat(total || '0'),
    status: 'paid',
    paymentMethod: 'online_stripe',
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString()
  }, { merge: true });

  console.log(`[Database Sync] Order ${orderId} marked as PAID in Firestore!`);

  // Update loyalty points in Firestore if user is authenticated
  if (userId && userId !== 'guest') {
    const userRef = adminDb.collection('users').doc(userId);
    try {
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        const userData = userSnap.data() || {};
        const currentPoints = userData.points || 0;
        const redeem = parseInt(pointsToRedeem || '0', 10);
        const earned = parseInt(pointsEarned || '0', 10);
        await userRef.update({
          points: Math.max(0, currentPoints - redeem + earned)
        });
        console.log(`[Loyalty points] Updated points for user ${userId} in Firestore.`);
      }
    } catch (e) {
      console.error('[Database Sync] Error updating user points in Firestore:', e);
    }
  }
}

startServer();
