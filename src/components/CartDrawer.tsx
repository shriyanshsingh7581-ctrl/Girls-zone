import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  ShoppingBag,
  Tag,
  CheckCircle2,
  MessageCircle,
  Truck,
  Store,
  CreditCard,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DeliveryAddress, DeliveryMode, Order, PaymentMode } from '../types';
import {
  buildOrderInvoiceWhatsAppUrl,
  calculateOrderTotals,
  formatDeliveryAddress,
  isValidTenDigitPhone,
  normalizePhone,
} from '../utils/commerce';
import { initiateRazorpayPayment } from '../lib/razorpay';
import { handleImageFallback, resolveImageUrl } from '../utils/images';

interface CartDrawerProps {
  onViewOrderTracking: (orderNumber: string) => void;
}

const EMPTY_ADDRESS: DeliveryAddress = {
  houseFlatNo: '',
  buildingStreet: '',
  areaLocality: '',
  landmark: '',
  city: 'Ambernath',
  state: 'Maharashtra',
  pincode: '421501',
};

export const CartDrawer: React.FC<CartDrawerProps> = ({ onViewOrderTracking }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    coupons,
    storeConfig,
    currentCustomer,
    setIsAuthModalOpen,
    loginWithGoogle,
    selectedPromoCode,
    setSelectedPromoCode,
    placeOrder,
  } = useStore();

  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(
    null
  );

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('Home Delivery');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    storeConfig.razorpayEnabled === false
      ? 'Cash on Delivery'
      : 'Razorpay Online (UPI / Cards / NetBanking)'
  );
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Pre-fill customer profile when logged in
  useEffect(() => {
    if (currentCustomer) {
      setCustomerName(currentCustomer.fullName || '');
      setCustomerPhone(currentCustomer.phone || '');
      setCustomerEmail(currentCustomer.email || '');
      if (currentCustomer.address) {
        setAddress({ ...EMPTY_ADDRESS, ...currentCustomer.address });
      }
    }
  }, [currentCustomer]);

  // Auto-apply selectedPromoCode when selected from Storefront banner
  useEffect(() => {
    if (selectedPromoCode) {
      setCouponInput(selectedPromoCode);
      const found = coupons.find(
        (c) => c.code.toUpperCase() === selectedPromoCode.toUpperCase() && c.active
      );
      if (found) {
        setAppliedCouponCode(found.code);
        setCouponFeedback({
          type: 'ok',
          msg: `Promo code ${found.code} applied!`,
        });
      }
      setSelectedPromoCode('');
    }
  }, [selectedPromoCode, coupons, setSelectedPromoCode]);

  if (!isCartOpen) return null;

  const activeCoupons = coupons.filter((c) => c.active);

  const matchedCoupon = appliedCouponCode
    ? coupons.find((c) => c.code.toUpperCase() === appliedCouponCode.toUpperCase() && c.active) ||
      null
    : null;

  const totals = calculateOrderTotals({
    items: cart,
    coupon: matchedCoupon,
    deliveryMode,
    baseDeliveryCharge: storeConfig.deliveryCharge,
    freeDeliveryThreshold: storeConfig.freeDeliveryThreshold,
  });

  const applySpecificCoupon = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    setCouponInput(code);
    if (!code) return;
    const found = coupons.find((c) => c.code.toUpperCase() === code && c.active);
    if (!found) {
      setAppliedCouponCode('');
      setCouponFeedback({ type: 'err', msg: 'Invalid or expired promo code.' });
      return;
    }
    if (totals.subtotal < found.minOrderAmount) {
      setAppliedCouponCode('');
      setCouponFeedback({
        type: 'err',
        msg: `Add ₹${found.minOrderAmount - totals.subtotal} more to use ${found.code} (Min order: ₹${found.minOrderAmount}).`,
      });
      return;
    }
    setAppliedCouponCode(found.code);
    setCouponFeedback({
      type: 'ok',
      msg: `Promo code ${found.code} applied! You saved ₹${
        found.type === 'PERCENT'
          ? Math.round((totals.subtotal * found.value) / 100)
          : Math.min(totals.subtotal, found.value)
      }!`,
    });
  };

  const handleApplyCoupon = () => {
    applySpecificCoupon(couponInput);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!isValidTenDigitPhone(customerPhone)) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (deliveryMode === 'Home Delivery') {
      if (
        !address.houseFlatNo.trim() ||
        !address.buildingStreet.trim() ||
        !address.areaLocality.trim() ||
        !address.city.trim() ||
        !address.pincode.trim()
      ) {
        setFormError('Please fill in your complete delivery address including House/Flat No, Street, Area, City, and Pincode.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const cleanPhone = normalizePhone(customerPhone);

      let paymentStatus: 'PAID' | 'PENDING' = 'PENDING';
      let razorpayPaymentId = '';
      let razorpayOrderId = '';
      let razorpaySignature = '';

      if (paymentMode === 'Razorpay Online (UPI / Cards / NetBanking)') {
        const paymentResult = await initiateRazorpayPayment({
          amountInRupees: totals.totalAmount,
          storeName: storeConfig.storeName || 'Girlz Zone',
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: customerEmail.trim(),
          addressSummary:
            deliveryMode === 'Store Pickup - Girlz Zone Ambernath'
              ? 'Store Pickup at Girlz Zone Ambernath'
              : formatDeliveryAddress(address),
          themeColor: storeConfig.themeAccentPrimary || '#C89D7C',
        });

        paymentStatus = 'PAID';
        razorpayPaymentId = paymentResult.paymentId;
        razorpayOrderId = paymentResult.orderId;
        razorpaySignature = paymentResult.signature;
      }

      const createdOrder = await placeOrder({
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim(),
        deliveryAddress: address,
        deliveryMode,
        paymentMode,
        paymentStatus,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        couponCode: totals.couponApplied ? appliedCouponCode : '',
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        deliveryCharge: totals.deliveryCharge,
        totalAmount: totals.totalAmount,
      });
      setPlacedOrder(createdOrder);
      setStep('confirmed');
    } catch (err: any) {
      setFormError(err?.message || 'Unable to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (step === 'confirmed') {
      setStep('cart');
      setPlacedOrder(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag and Checkout"
      className="fixed inset-0 z-50 bg-[#1E1116]/60 backdrop-blur-sm flex justify-end"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md bg-[#FFFDFB] h-full flex flex-col shadow-2xl border-l border-[#1E1116]/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drawer Header */}
        <div className="px-5 py-4 border-b border-[#1E1116]/10 flex items-center justify-between bg-[#FDF6F6]/60">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#C89D7C]" />
            <h2 className="text-lg font-serif-luxury font-semibold text-[#1E1116]">
              {step === 'cart'
                ? 'Your Shopping Bag'
                : step === 'checkout'
                ? 'Express Checkout'
                : 'Order Confirmed'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close bag drawer"
            className="w-8 h-8 rounded-full hover:bg-[#1E1116]/10 flex items-center justify-center text-[#1E1116] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'confirmed' && placedOrder ? (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#C89D7C] uppercase">
                  Thank You For Your Order
                </p>
                <h3 className="text-2xl font-serif-luxury font-semibold text-[#1E1116] mt-1">
                  Order #{placedOrder.orderNumber} Placed!
                </h3>
                <p className="text-xs text-[#1E1116]/70 mt-1">
                  {storeConfig.orderConfirmationMessage ||
                    'Your order has been registered in real time. You can send the formatted invoice to Girlz Zone on WhatsApp or track your live delivery status below.'}
                </p>
              </div>

              <div className="bg-[#FDF6F6] border border-[#C89D7C]/30 rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#1E1116]/60">Order ID</span>
                  <span className="font-mono-num font-bold text-[#1E1116]">
                    {placedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1E1116]/60">Customer</span>
                  <span className="font-semibold text-[#1E1116]">{placedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1E1116]/60">Delivery Mode</span>
                  <span className="font-semibold text-[#1E1116]">{placedOrder.deliveryMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1E1116]/60">Payment Mode</span>
                  <span className="font-semibold text-[#1E1116]">{placedOrder.paymentMode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#1E1116]/60">Payment Status</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      placedOrder.paymentStatus === 'PAID'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {placedOrder.paymentStatus === 'PAID'
                      ? 'PAID ONLINE ✓'
                      : 'PAY ON DELIVERY'}
                  </span>
                </div>
                {placedOrder.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-[#1E1116]/60">Razorpay Payment ID</span>
                    <span className="font-mono-num font-bold text-emerald-700">
                      {placedOrder.razorpayPaymentId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#1E1116]/10">
                  <span className="font-semibold text-[#1E1116]">Total Amount</span>
                  <span className="font-mono-num font-bold text-sm text-[#1E1116]">
                    ₹{placedOrder.totalAmount}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <a
                  href={buildOrderInvoiceWhatsAppUrl(
                    placedOrder,
                    storeConfig.whatsappNumber,
                    storeConfig.whatsappOrderInvoiceHeader,
                    storeConfig.whatsappOrderInvoiceFooter
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Order Invoice on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const orderNum = placedOrder.orderNumber;
                    handleClose();
                    onViewOrderTracking(orderNum);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Open Live Flipkart-Style Order Tracker</span>
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#FDF6F6] text-[#C89D7C] mx-auto flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif-luxury font-semibold text-[#1E1116]">
                Your Shopping Bag is Empty
              </h3>
              <p className="text-xs text-[#1E1116]/60 max-w-xs mx-auto">
                Explore our luxury cosmetics, skin care, hair accessories, and anti-tarnish jewellery collections.
              </p>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-5">
              {/* Itemized Cart List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}_${item.selectedVariant || ''}`}
                    className="flex gap-3 p-3 rounded-xl bg-[#FDF6F6]/70 border border-[#1E1116]/8"
                  >
                    <img
                      src={resolveImageUrl(item.image, item.category)}
                      alt={item.name}
                      onError={(e) => handleImageFallback(e, item.category)}
                      referrerPolicy="no-referrer"
                      className="w-16 h-20 rounded-lg object-cover bg-[#FFFDFB] shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#1E1116] truncate">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId, item.selectedVariant)}
                            aria-label={`Remove ${item.name}`}
                            className="text-[#1E1116]/40 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-[#1E1116]/55">
                          {item.category}
                          {item.selectedVariant ? ` · ${item.selectedVariant}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="inline-flex items-center border border-[#1E1116]/15 rounded-lg bg-[#FFFDFB]">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.selectedVariant,
                                item.quantity - 1
                              )
                            }
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="w-7 h-7 flex items-center justify-center text-xs font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-mono-num font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.selectedVariant,
                                item.quantity + 1
                              )
                            }
                            aria-label={`Increase quantity of ${item.name}`}
                            className="w-7 h-7 flex items-center justify-center text-xs font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right font-mono-num">
                          <span className="text-xs sm:text-sm font-bold text-[#1E1116]">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Coupon Input & 1-Tap Available Coupons */}
              <div className="p-3.5 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1E1116]">
                    <Tag className="w-3.5 h-3.5 text-[#C89D7C]" />
                    <span>Have a Promo Code?</span>
                  </label>
                  {appliedCouponCode && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCouponCode('');
                        setCouponInput('');
                        setCouponFeedback(null);
                      }}
                      className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                    >
                      Remove ({appliedCouponCode})
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    data-testid="cart-coupon-input"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter promo code (e.g. WELCOME10)"
                    className="flex-1 px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg uppercase font-mono-num focus:outline-none focus:border-[#C89D7C]"
                  />
                  <button
                    type="button"
                    data-testid="cart-apply-coupon-btn"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold rounded-lg hover:bg-[#C89D7C] hover:text-[#1E1116] transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {couponFeedback && (
                  <p
                    data-testid="cart-coupon-feedback"
                    className={`text-[11px] font-semibold ${
                      couponFeedback.type === 'ok' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {couponFeedback.msg}
                  </p>
                )}

                {activeCoupons.length > 0 && (
                  <div className="pt-1.5 border-t border-[#1E1116]/10 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#C89D7C]">
                      Available Store Offers (Tap to Apply):
                    </p>
                    <div className="space-y-1.5">
                      {activeCoupons.map((cpn) => {
                        const isApplied =
                          appliedCouponCode.toUpperCase() === cpn.code.toUpperCase();
                        return (
                          <div
                            key={cpn.id}
                            className="p-2 rounded-lg bg-[#FFFDFB] border border-[#C89D7C]/35 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono-num text-xs font-bold text-[#1E1116] bg-[#FDF6F6] px-2 py-0.5 rounded border border-[#C89D7C]/40">
                                  {cpn.code}
                                </span>
                                <span className="text-[11px] font-bold text-emerald-700">
                                  {cpn.type === 'PERCENT'
                                    ? `${cpn.value}% OFF`
                                    : `Flat ₹${cpn.value} OFF`}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#1E1116]/65 truncate mt-0.5">
                                {cpn.description ||
                                  (cpn.minOrderAmount > 0
                                    ? `Valid on orders above ₹${cpn.minOrderAmount}`
                                    : 'No minimum order required')}
                              </p>
                            </div>
                            <button
                              type="button"
                              data-testid={`apply-coupon-chip-${cpn.code}`}
                              onClick={() => applySpecificCoupon(cpn.code)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 cursor-pointer ${
                                isApplied
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-[#1E1116] text-[#FFFDFB] hover:bg-[#C89D7C] hover:text-[#1E1116]'
                              }`}
                            >
                              {isApplied ? 'Applied ✓' : 'Apply'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bill Summary */}
              <div className="p-4 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/10 space-y-2 text-xs">
                <h4 className="font-semibold text-[#1E1116] pb-1 border-b border-[#1E1116]/8">
                  Order Bill Summary
                </h4>
                <div className="flex justify-between text-[#1E1116]/75">
                  <span>Bag Subtotal</span>
                  <span className="font-mono-num">₹{totals.subtotal}</span>
                </div>
                {totals.productSavings > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>MRP Savings</span>
                    <span className="font-mono-num">-₹{totals.productSavings}</span>
                  </div>
                )}
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Promo Discount ({appliedCouponCode})</span>
                    <span className="font-mono-num">-₹{totals.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#1E1116]/75">
                  <span>
                    Delivery ({deliveryMode === 'Store Pickup - Girlz Zone Ambernath' ? 'Store Pickup' : 'Home Delivery'})
                  </span>
                  <span className="font-mono-num">
                    {totals.deliveryCharge === 0 ? 'FREE' : `₹${totals.deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#1E1116]/10 text-sm font-bold text-[#1E1116]">
                  <span>Total Payable</span>
                  <span className="font-mono-num">₹{totals.totalAmount}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: Checkout Form */
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              {!currentCustomer && (
                <div className="p-3 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#1E1116]">
                      Sign in for 1-Tap Auto-Fill Checkout:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="font-semibold text-[#C89D7C] underline cursor-pointer"
                    >
                      Phone / No-Password Login
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await loginWithGoogle();
                      } catch {
                        setIsAuthModalOpen(true);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-white border border-[#1E1116]/15 hover:border-[#C89D7C] text-[#1E1116] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue with Google / Gmail</span>
                  </button>
                </div>
              )}

              {/* Promo Code Box also available on Checkout Step */}
              <div className="p-3 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/25 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1E1116] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#C89D7C]" />
                    <span>Promo Code Discount</span>
                  </span>
                  {totals.discountAmount > 0 && (
                    <span className="text-emerald-700 font-bold font-mono-num">
                      -₹{totals.discountAmount} Saved ({appliedCouponCode})
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Promo Code"
                    className="flex-1 px-3 py-1.5 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg uppercase font-mono-num"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-1.5 bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponFeedback && (
                  <p
                    className={`text-[11px] font-medium ${
                      couponFeedback.type === 'ok' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {couponFeedback.msg}
                  </p>
                )}
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#1E1116] uppercase tracking-wider">
                  1. Customer Contact Details
                </h4>
                <div>
                  <label className="block text-xs font-medium text-[#1E1116]/80 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg focus:outline-none focus:border-[#C89D7C]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-[#1E1116]/80 mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 text-xs font-mono-num bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg focus:outline-none focus:border-[#C89D7C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1E1116]/80 mb-1">
                      Email ID
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg focus:outline-none focus:border-[#C89D7C]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Mode */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-[#1E1116] uppercase tracking-wider">
                  2. Delivery Mode
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('Home Delivery')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                      deliveryMode === 'Home Delivery'
                        ? 'border-[#C89D7C] bg-[#FDF6F6]'
                        : 'border-[#1E1116]/15 bg-[#FFFDFB]'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-[#C89D7C] shrink-0" />
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-[#1E1116]">Home Delivery</p>
                      <p className="text-[11px] text-[#1E1116]/60">
                        Doorstep delivery with live Flipkart-style tracking
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMode('Store Pickup - Girlz Zone Ambernath')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                      deliveryMode === 'Store Pickup - Girlz Zone Ambernath'
                        ? 'border-[#C89D7C] bg-[#FDF6F6]'
                        : 'border-[#1E1116]/15 bg-[#FFFDFB]'
                    }`}
                  >
                    <Store className="w-4 h-4 text-[#C89D7C] shrink-0" />
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-[#1E1116]">
                        Store Pickup - Girlz Zone Ambernath
                      </p>
                      <p className="text-[11px] text-[#1E1116]/60">
                        Shop no.3, Opp. Concept Arena, Near Smart Bazaar, Palegaon (FREE)
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Complete Delivery Address */}
              {deliveryMode === 'Home Delivery' && (
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-semibold text-[#1E1116] uppercase tracking-wider">
                    3. Complete Delivery Address
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={address.houseFlatNo}
                      onChange={(e) => setAddress({ ...address, houseFlatNo: e.target.value })}
                      placeholder="House / Flat No. *"
                      className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      value={address.buildingStreet}
                      onChange={(e) => setAddress({ ...address, buildingStreet: e.target.value })}
                      placeholder="Building / Street *"
                      className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={address.areaLocality}
                      onChange={(e) => setAddress({ ...address, areaLocality: e.target.value })}
                      placeholder="Area / Locality *"
                      className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                    <input
                      type="text"
                      value={address.landmark}
                      onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      placeholder="Nearby Landmark"
                      className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="City *"
                      className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="State *"
                      className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      placeholder="Pincode *"
                      className="px-3 py-2 text-xs font-mono-num bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Payment Mode */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-[#1E1116] uppercase tracking-wider">
                  4. Payment Method
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {storeConfig.razorpayEnabled !== false && (
                    <button
                      type="button"
                      data-testid="payment-option-razorpay"
                      onClick={() =>
                        setPaymentMode('Razorpay Online (UPI / Cards / NetBanking)')
                      }
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                        paymentMode === 'Razorpay Online (UPI / Cards / NetBanking)'
                          ? 'border-[#C89D7C] bg-[#FDF6F6] ring-1 ring-[#C89D7C]/50'
                          : 'border-[#1E1116]/15 bg-[#FFFDFB]'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-[#1E1116]">
                            Pay Online via Razorpay
                          </p>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider">
                            Instant & Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-[#1E1116]/65 mt-0.5">
                          UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking & Wallets
                        </p>
                      </div>
                    </button>
                  )}

                  {storeConfig.codEnabled !== false && (
                    <button
                      type="button"
                      data-testid="payment-option-cod"
                      onClick={() => setPaymentMode('Cash on Delivery')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                        paymentMode === 'Cash on Delivery'
                          ? 'border-[#C89D7C] bg-[#FDF6F6]'
                          : 'border-[#1E1116]/15 bg-[#FFFDFB]'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 text-[#C89D7C] shrink-0" />
                      <div className="text-xs">
                        <p className="font-semibold text-[#1E1116]">Cash on Delivery (COD)</p>
                        <p className="text-[11px] text-[#1E1116]/60">
                          Pay by cash or UPI when your order arrives
                        </p>
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    data-testid="payment-option-whatsapp"
                    onClick={() => setPaymentMode('UPI / Online via WhatsApp')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors cursor-pointer ${
                      paymentMode === 'UPI / Online via WhatsApp'
                        ? 'border-[#C89D7C] bg-[#FDF6F6]'
                        : 'border-[#1E1116]/15 bg-[#FFFDFB]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#C89D7C] shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-[#1E1116]">UPI / Online via WhatsApp</p>
                      <p className="text-[11px] text-[#1E1116]/60">
                        Instant UPI QR or GPay/PhonePe link via official Girlz Zone WhatsApp
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sticky Footer CTA */}
        {cart.length > 0 && step !== 'confirmed' && (
          <div className="p-4 border-t border-[#1E1116]/10 bg-[#FFFDFB] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#1E1116]/70">Final Payable Amount</span>
              <span className="text-base font-mono-num font-bold text-[#1E1116]">
                ₹{totals.totalAmount}
              </span>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3 px-5 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 rounded-xl border border-[#1E1116]/20 text-xs font-semibold text-[#1E1116] hover:bg-[#FDF6F6] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  data-testid="checkout-submit-btn"
                  disabled={submitting}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>
                    {submitting
                      ? paymentMode === 'Razorpay Online (UPI / Cards / NetBanking)'
                        ? 'Opening Razorpay Gateway...'
                        : 'Placing Order...'
                      : paymentMode === 'Razorpay Online (UPI / Cards / NetBanking)'
                      ? `Pay Now via Razorpay · ₹${totals.totalAmount}`
                      : `Place Order · ₹${totals.totalAmount}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
