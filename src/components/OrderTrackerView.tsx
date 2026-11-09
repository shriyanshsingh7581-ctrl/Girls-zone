import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Check,
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FLIPKART_ORDER_STAGES, Order } from '../types';
import {
  buildOrderInvoiceWhatsAppUrl,
  formatDeliveryAddress,
  normalizePhone,
} from '../utils/commerce';
import { handleImageFallback, resolveImageUrl } from '../utils/images';

interface OrderTrackerViewProps {
  initialSearchOrderId?: string;
}

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({ initialSearchOrderId }) => {
  const { orders, currentCustomer, storeConfig } = useStore();

  const [lookupInput, setLookupInput] = useState(initialSearchOrderId || '');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (initialSearchOrderId) {
      setLookupInput(initialSearchOrderId);
    }
  }, [initialSearchOrderId]);

  const trimmedQuery = lookupInput.trim();
  const cleanPhoneQuery = normalizePhone(trimmedQuery);

  // Pure customer-facing order lookup: matches by Order ID / Phone query, or shows the logged-in customer's own orders
  const matchingOrders: Order[] = orders.filter((ord) => {
    if (trimmedQuery) {
      const matchId =
        ord.orderNumber.toLowerCase() === trimmedQuery.toLowerCase() ||
        ord.id.toLowerCase() === trimmedQuery.toLowerCase() ||
        ord.orderNumber.toLowerCase().includes(trimmedQuery.toLowerCase());
      const matchPhone =
        cleanPhoneQuery.length === 10 && normalizePhone(ord.customerPhone) === cleanPhoneQuery;
      return matchId || matchPhone;
    }
    if (currentCustomer) {
      return (
        ord.customerId === currentCustomer.uid ||
        (currentCustomer.phone &&
          normalizePhone(ord.customerPhone) === normalizePhone(currentCustomer.phone)) ||
        (currentCustomer.email &&
          ord.customerEmail &&
          ord.customerEmail.toLowerCase() === currentCustomer.email.toLowerCase())
      );
    }
    return false;
  });

  const activeOrder =
    matchingOrders.find((o) => o.id === selectedOrderId) || matchingOrders[0] || null;

  const getStageIndex = (status: Order['status']): number => {
    return FLIPKART_ORDER_STAGES.findIndex((s) => s.status === status);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-6">
      {/* Header & Customer Order Search Box (Strictly Customer-Only, Zero Admin Controls) */}
      <div className="bg-[#FDF6F6] border border-[#C89D7C]/30 rounded-2xl p-6 md:p-8 space-y-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest text-[#C89D7C] uppercase">
            Real-Time Delivery Status & Order Tracker
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-semibold text-[#1E1116] mt-1">
            Track Your Girlz Zone Delivery Status Live
          </h1>
          <p className="text-xs sm:text-sm text-[#1E1116]/70 mt-1">
            Enter your Order ID (e.g. GZ-10001) or your 10-Digit Mobile Number to check your live Flipkart-style delivery status.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#1E1116]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              data-testid="order-tracker-search-input"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="Enter Order ID (GZ-10001) or 10-Digit Phone Number"
              aria-label="Track by Order ID or Phone Number"
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#FFFDFB] border border-[#1E1116]/15 rounded-xl focus:outline-none focus:border-[#C89D7C]"
            />
          </div>
          {lookupInput && (
            <button
              type="button"
              onClick={() => setLookupInput('')}
              className="px-4 py-3 rounded-xl border border-[#1E1116]/15 text-xs font-semibold text-[#1E1116] hover:bg-[#FFFDFB] cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Matching Orders List & Flipkart Timeline */}
      {matchingOrders.length === 0 ? (
        <div className="bg-[#FFFDFB] border border-[#1E1116]/10 rounded-2xl p-10 text-center space-y-3">
          <Package className="w-10 h-10 text-[#C89D7C] mx-auto" />
          <h2 className="text-xl font-serif-luxury font-semibold text-[#1E1116]">
            {trimmedQuery
              ? `No Orders Found Matching "${trimmedQuery}"`
              : currentCustomer
              ? 'You Have No Orders Yet'
              : 'Enter Your Order ID or 10-Digit Mobile Number Above'}
          </h2>
          <p className="text-xs text-[#1E1116]/60 max-w-md mx-auto">
            As soon as you place an order at Girlz Zone, its live Flipkart-style delivery status and tracking timeline will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Customer Order Selector List */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1E1116]/70">
              Your Matching Orders ({matchingOrders.length})
            </h2>
            <div className="space-y-2.5">
              {matchingOrders.map((ord) => {
                const isSelected = activeOrder?.id === ord.id;
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FDF6F6] border-[#C89D7C] shadow-sm'
                        : 'bg-[#FFFDFB] border-[#1E1116]/10 hover:border-[#C89D7C]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono-num text-sm font-bold text-[#1E1116]">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          ord.status === 'Cancelled'
                            ? 'bg-red-50 text-red-700'
                            : ord.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-[#1E1116] text-[#FFFDFB]'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#1E1116] mt-1">
                      {ord.customerName} · +91 {ord.customerPhone}
                    </p>
                    <p className="text-xs text-[#1E1116]/75 mt-0.5">
                      {ord.items.length} {ord.items.length === 1 ? 'Item' : 'Items'} ·{' '}
                      <span className="font-mono-num font-semibold">₹{ord.totalAmount}</span>
                    </p>
                    <p className="text-[11px] text-[#1E1116]/50 font-mono-num mt-1">
                      Placed on {new Date(ord.createdAt).toLocaleString('en-IN')}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Flipkart-Style Visual Order Tracking Timeline */}
          {activeOrder && (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#FFFDFB] border border-[#1E1116]/10 rounded-2xl p-6 space-y-6">
                {/* Order Summary Top Row */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#1E1116]/10">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#1E1116]/60">
                      <span>Order ID</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num font-bold text-[#1E1116]">
                        {activeOrder.orderNumber}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif-luxury font-semibold text-[#1E1116] mt-1">
                      Delivery Status: {activeOrder.status}
                    </h3>
                    {activeOrder.expectedDeliveryDate && (
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        Expected Delivery: {activeOrder.expectedDeliveryDate}
                      </p>
                    )}
                  </div>

                  <div className="text-right font-mono-num">
                    <p className="text-xs text-[#1E1116]/60">Total Bill</p>
                    <p className="text-lg font-bold text-[#1E1116]">₹{activeOrder.totalAmount}</p>
                    {activeOrder.discountAmount > 0 && (
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Saved ₹{activeOrder.discountAmount}{' '}
                        {activeOrder.couponCode ? `(${activeOrder.couponCode})` : ''}
                      </p>
                    )}
                    <p className="text-[11px] text-[#1E1116]/60">{activeOrder.paymentMode}</p>
                  </div>
                </div>

                {/* Courier & AWB Card (If Shipped or Tracking Info Provided) */}
                {(activeOrder.courierName || activeOrder.trackingId || activeOrder.trackingNote) && (
                  <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/35 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-[#C89D7C] shrink-0" />
                      <div className="text-xs">
                        <p className="font-semibold text-[#1E1116]">
                          Courier Partner: {activeOrder.courierName || 'Girlz Zone Express Delivery'}
                        </p>
                        {activeOrder.trackingId && (
                          <p className="text-[#1E1116]/75 font-mono-num">
                            Tracking ID / AWB:{' '}
                            <strong className="text-[#1E1116]">{activeOrder.trackingId}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                    {activeOrder.trackingNote && (
                      <span className="text-xs text-[#1E1116]/75 italic">
                        "{activeOrder.trackingNote}"
                      </span>
                    )}
                  </div>
                )}

                {/* FLIPKART-STYLE VERTICAL ANIMATED STEPPER */}
                <div className="py-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1E1116]/70 mb-5">
                    Live Delivery Status Timeline
                  </h4>

                  {activeOrder.status === 'Cancelled' ? (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-red-800">Order Cancelled</p>
                        <p className="text-red-700">
                          {activeOrder.cancelReason ||
                            activeOrder.trackingNote ||
                            'This order was cancelled.'}
                        </p>
                        <p className="text-[11px] text-red-600/80 font-mono-num">
                          Updated: {new Date(activeOrder.updatedAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative pl-3 space-y-0">
                      {FLIPKART_ORDER_STAGES.map((stage, index) => {
                        const currentStageIdx = getStageIndex(activeOrder.status);
                        const isCompleted = index <= currentStageIdx;
                        const isCurrent = index === currentStageIdx;
                        const isLast = index === FLIPKART_ORDER_STAGES.length - 1;

                        const historyEntry = (activeOrder.trackingHistory || []).find(
                          (h) => h.status === stage.status
                        );

                        return (
                          <div
                            key={stage.status}
                            className="relative flex items-start gap-4 pb-7 last:pb-0"
                          >
                            {/* Connecting Vertical Line */}
                            {!isLast && (
                              <div
                                className={`absolute left-[13px] top-7 bottom-0 w-0.5 transition-colors duration-300 ${
                                  index < currentStageIdx ? 'bg-emerald-600' : 'bg-[#1E1116]/15'
                                }`}
                              />
                            )}

                            {/* Stepper Circle Indicator */}
                            <div
                              className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-[#FDF6F6] border-2 border-[#1E1116]/20 text-[#1E1116]/40'
                              } ${isCurrent ? 'ring-4 ring-emerald-600/20' : ''}`}
                            >
                              {isCompleted ? (
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                            </div>

                            {/* Step Details */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p
                                  className={`text-sm font-semibold ${
                                    isCompleted ? 'text-[#1E1116]' : 'text-[#1E1116]/45'
                                  }`}
                                >
                                  {stage.title}
                                </p>
                                {historyEntry && (
                                  <span className="text-[11px] font-mono-num text-[#1E1116]/60">
                                    {new Date(historyEntry.timestamp).toLocaleString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                )}
                              </div>

                              <p
                                className={`text-xs mt-0.5 ${
                                  isCompleted ? 'text-[#1E1116]/75' : 'text-[#1E1116]/40'
                                }`}
                              >
                                {historyEntry?.note || stage.defaultNote}
                              </p>

                              {stage.status === 'Shipped' &&
                                isCompleted &&
                                (historyEntry?.courierName || activeOrder.courierName) && (
                                  <p className="text-xs font-mono-num text-emerald-800 mt-1">
                                    Courier: {historyEntry?.courierName || activeOrder.courierName}{' '}
                                    {(historyEntry?.trackingId || activeOrder.trackingId) &&
                                      `· AWB: ${historyEntry?.trackingId || activeOrder.trackingId}`}
                                  </p>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Ordered Items & Delivery Address Card */}
                <div className="pt-5 border-t border-[#1E1116]/10 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1E1116]/70">
                      Ordered Items ({activeOrder.items.length})
                    </h4>
                    <div className="space-y-2">
                      {activeOrder.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FDF6F6]"
                        >
                          <img
                            src={resolveImageUrl(item.image, item.category)}
                            alt={item.name}
                            onError={(e) => handleImageFallback(e, item.category)}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover bg-[#FFFDFB] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#1E1116] truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-[#1E1116]/60">
                              Qty: {item.quantity}
                              {item.selectedVariant ? ` · ${item.selectedVariant}` : ''}
                            </p>
                          </div>
                          <span className="text-xs font-mono-num font-bold text-[#1E1116]">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-[#FDF6F6] space-y-1.5 text-xs">
                      <h4 className="font-semibold text-[#1E1116] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C89D7C]" />
                        <span>{activeOrder.deliveryMode}</span>
                      </h4>
                      <p className="font-medium text-[#1E1116]">{activeOrder.customerName}</p>
                      <p className="text-[#1E1116]/75 leading-relaxed">
                        {activeOrder.deliveryMode === 'Store Pickup - Girlz Zone Ambernath'
                          ? storeConfig.storeAddress
                          : formatDeliveryAddress(activeOrder.deliveryAddress)}
                      </p>
                      <p className="font-mono-num text-[#1E1116]/70">
                        Phone: +91 {activeOrder.customerPhone}
                      </p>
                    </div>

                    <a
                      href={buildOrderInvoiceWhatsAppUrl(activeOrder, storeConfig.whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl border border-[#C89D7C]/50 hover:bg-[#FDF6F6] text-[#1E1116] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#C89D7C]" />
                      <span>Need Help? Message Girlz Zone on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
