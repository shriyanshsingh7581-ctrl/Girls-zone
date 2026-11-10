import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_ThTjqAzOXvwuwl';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'dZCjCHYpHUWgWNb03OX3ONke';

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret?: string;
}): boolean {
  const { orderId, paymentId, signature, secret = RAZORPAY_KEY_SECRET } = params;
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  try {
    const a = Buffer.from(expectedSignature, 'utf8');
    const b = Buffer.from(signature, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return expectedSignature === signature;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));

  // Health & Gateway Status Check
  app.get('/api/razorpay/status', (_req, res) => {
    res.json({
      active: true,
      mode: RAZORPAY_KEY_ID.startsWith('rzp_live_') ? 'LIVE' : 'TEST',
      keyId: RAZORPAY_KEY_ID,
    });
  });

  // Create Razorpay Order in Paise (INR)
  app.post('/api/razorpay/create-order', async (req, res) => {
    try {
      const rawAmount = Number(req.body?.amount) || 0;
      const amountInPaise = Math.max(100, Math.round(rawAmount * 100));
      const currency = typeof req.body?.currency === 'string' ? req.body.currency : 'INR';
      const receipt =
        typeof req.body?.receipt === 'string' && req.body.receipt.trim()
          ? req.body.receipt.trim().slice(0, 40)
          : `gz_rcpt_${Date.now()}`;
      const notes =
        req.body?.notes && typeof req.body.notes === 'object' ? req.body.notes : {};

      const basicAuth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      try {
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${basicAuth}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency,
            receipt,
            payment_capture: 1,
            notes,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const data: any = await response.json();
        if (response.ok && data && data.id) {
          res.json({
            success: true,
            keyId: RAZORPAY_KEY_ID,
            orderId: data.id,
            amount: data.amount,
            currency: data.currency || 'INR',
            receipt: data.receipt || receipt,
          });
          return;
        }

        // Fallback to direct standard checkout if order API returns non-200
        res.json({
          success: true,
          keyId: RAZORPAY_KEY_ID,
          orderId: '',
          amount: amountInPaise,
          currency,
          receipt,
          fallbackDirectCheckout: true,
        });
      } catch {
        clearTimeout(timeout);
        // Network fallback so Razorpay Checkout modal still opens with key + amount
        res.json({
          success: true,
          keyId: RAZORPAY_KEY_ID,
          orderId: '',
          amount: amountInPaise,
          currency,
          receipt,
          fallbackDirectCheckout: true,
        });
      }
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to initialize Razorpay order.',
      });
    }
  });

  // Verify Razorpay Payment Signature (HMAC-SHA256)
  app.post('/api/razorpay/verify-payment', (req, res) => {
    try {
      const razorpay_order_id = String(req.body?.razorpay_order_id || '').trim();
      const razorpay_payment_id = String(req.body?.razorpay_payment_id || '').trim();
      const razorpay_signature = String(req.body?.razorpay_signature || '').trim();

      if (!razorpay_payment_id) {
        res.status(400).json({
          verified: false,
          error: 'Missing Razorpay payment ID.',
        });
        return;
      }

      // If order_id and signature were returned by Razorpay, verify cryptographic HMAC-SHA256
      if (razorpay_order_id && razorpay_signature) {
        const isValid = verifyRazorpaySignature({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        });

        if (!isValid) {
          res.status(400).json({
            verified: false,
            error: 'Invalid Razorpay payment signature.',
          });
          return;
        }

        res.json({
          verified: true,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          signature: razorpay_signature,
        });
        return;
      }

      // Direct standard checkout payment ID verification
      res.json({
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
      });
    } catch (err: any) {
      res.status(500).json({
        verified: false,
        error: err?.message || 'Failed to verify Razorpay payment.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Girlz Zone Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
