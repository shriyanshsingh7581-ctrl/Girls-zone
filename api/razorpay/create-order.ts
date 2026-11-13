const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_ThTjqAzOXvwuwl';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const rawAmount = Number(body.amount) || 0;
    const amountInPaise = Math.max(100, Math.round(rawAmount * 100));
    const currency = typeof body.currency === 'string' ? body.currency : 'INR';
    const receipt =
      typeof body.receipt === 'string' && body.receipt.trim()
        ? body.receipt.trim().slice(0, 40)
        : `gz_rcpt_${Date.now()}`;

    res.status(200).json({
      success: true,
      keyId: RAZORPAY_KEY_ID,
      orderId: '',
      amount: amountInPaise,
      currency,
      receipt,
      directCheckout: true,
    });
  } catch {
    res.status(200).json({
      success: true,
      keyId: RAZORPAY_KEY_ID,
      orderId: '',
      amount: 100,
      currency: 'INR',
      directCheckout: true,
    });
  }
}
