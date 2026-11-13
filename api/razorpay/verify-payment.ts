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
