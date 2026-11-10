import crypto from 'node:crypto';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'dZCjCHYpHUWgWNb03OX3ONke';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ verified: false, error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const razorpay_order_id = String(body.razorpay_order_id || '').trim();
    const razorpay_payment_id = String(body.razorpay_payment_id || '').trim();
    const razorpay_signature = String(body.razorpay_signature || '').trim();

    if (!razorpay_payment_id) {
      res.status(400).json({ verified: false, error: 'Missing Razorpay payment ID.' });
      return;
    }

    if (razorpay_order_id && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        res.status(400).json({ verified: false, error: 'Invalid Razorpay signature.' });
        return;
      }
    }

    res.status(200).json({
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
    });
  } catch (err: any) {
    res.status(500).json({
      verified: false,
      error: err?.message || 'Verification failed.',
    });
  }
}
