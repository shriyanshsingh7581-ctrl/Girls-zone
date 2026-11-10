const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_ThTjqAzOXvwuwl';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'dZCjCHYpHUWgWNb03OX3ONke';

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
    const notes = body.notes && typeof body.notes === 'object' ? body.notes : {};

    const basicAuth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

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
    });

    const data: any = await response.json();
    if (response.ok && data && data.id) {
      res.status(200).json({
        success: true,
        keyId: RAZORPAY_KEY_ID,
        orderId: data.id,
        amount: data.amount,
        currency: data.currency || 'INR',
        receipt: data.receipt || receipt,
      });
      return;
    }

    res.status(200).json({
      success: true,
      keyId: RAZORPAY_KEY_ID,
      orderId: '',
      amount: amountInPaise,
      currency,
      receipt,
      fallbackDirectCheckout: true,
    });
  } catch {
    res.status(200).json({
      success: true,
      keyId: RAZORPAY_KEY_ID,
      orderId: '',
      amount: 100,
      currency: 'INR',
      fallbackDirectCheckout: true,
    });
  }
}
