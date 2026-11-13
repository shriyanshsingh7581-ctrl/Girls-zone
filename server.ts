import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_ThTjqAzOXvwuwl';

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

  // Prepare Razorpay Checkout Payload in Paise (INR) using Public Key ID only
  app.post('/api/razorpay/create-order', async (req, res) => {
    try {
      const rawAmount = Number(req.body?.amount) || 0;
      const amountInPaise = Math.max(100, Math.round(rawAmount * 100));
      const currency = typeof req.body?.currency === 'string' ? req.body.currency : 'INR';
      const receipt =
        typeof req.body?.receipt === 'string' && req.body.receipt.trim()
          ? req.body.receipt.trim().slice(0, 40)
          : `gz_rcpt_${Date.now()}`;

      res.json({
        success: true,
        keyId: RAZORPAY_KEY_ID,
        orderId: '',
        amount: amountInPaise,
        currency,
        receipt,
        directCheckout: true,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to initialize Razorpay checkout.',
      });
    }
  });

  // Confirm Razorpay Payment ID returned by Checkout
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
