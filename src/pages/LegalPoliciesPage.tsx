import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  FileText,
  Lock,
  RotateCcw,
  Truck,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Footer } from '../components/Footer';

export type LegalPolicyType =
  | 'contact-us'
  | 'terms-and-conditions'
  | 'privacy-policy'
  | 'refund-policy'
  | 'shipping-policy';

interface LegalPoliciesPageProps {
  policyType: LegalPolicyType;
}

const POLICY_NAV_ITEMS: {
  id: LegalPolicyType;
  path: string;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'contact-us',
    path: '/contact-us',
    label: 'Contact Us',
    shortLabel: 'Contact Us',
    icon: Phone,
  },
  {
    id: 'terms-and-conditions',
    path: '/terms-and-conditions',
    label: 'Terms & Conditions',
    shortLabel: 'Terms',
    icon: FileText,
  },
  {
    id: 'privacy-policy',
    path: '/privacy-policy',
    label: 'Privacy Policy',
    shortLabel: 'Privacy',
    icon: Lock,
  },
  {
    id: 'refund-policy',
    path: '/refund-policy',
    label: 'Refund & Cancellation Policy',
    shortLabel: 'Refund Policy',
    icon: RotateCcw,
  },
  {
    id: 'shipping-policy',
    path: '/shipping-policy',
    label: 'Shipping & Delivery Policy',
    shortLabel: 'Shipping Policy',
    icon: Truck,
  },
];

const OFFICIAL_PRODUCT_CATEGORIES = [
  'Perfumes & Deodorants',
  'Ladies Purses & Handbags',
  'Boutique Items & Fashion Accessories',
  'Cosmetic Products',
  'Beauty Products',
  'Skin Care',
  'Hair Care',
  'Hair Accessories',
  'Anti-Tarnish Jewellery',
];

export const LegalPoliciesPage: React.FC<LegalPoliciesPageProps> = ({ policyType }) => {
  const { storeConfig } = useStore();
  const navigate = useNavigate();

  // Contact Us Interactive Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryOrderId, setInquiryOrderId] = useState('');
  const [inquiryTopic, setInquiryTopic] = useState('Order & Delivery Status');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Scroll to top automatically whenever user navigates to or switches a policy page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [policyType]);

  const brandName = storeConfig.storeName || 'Girlz Zone';
  const storeAddress =
    storeConfig.storeAddress ||
    'Shop no.3, Opp. Concept Arena, Near Smart Bazaar, Palegaon, Ambernath - 421501, Maharashtra, India';
  const waClean = (storeConfig.whatsappNumber || '918329783642').replace(/\D/g, '') || '918329783642';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${brandName} ${storeAddress}`
  )}`;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim() || !inquiryMessage.trim()) return;
    setInquirySubmitted(true);
  };

  return (
    <div
      style={{
        backgroundColor: storeConfig.themeBgPrimary || '#FFFDFB',
        color: storeConfig.themeTextPrimary || '#1E1116',
      }}
      className="min-h-screen flex flex-col justify-between"
    >
      {/* Top Luxury Compliance Header */}
      <header className="sticky top-0 z-40 bg-[#FFFDFB]/95 backdrop-blur-md border-b border-[#1E1116]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              onClick={() => window.scrollTo(0, 0)}
              data-testid="policy-back-to-store-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FDF6F6] hover:bg-[#C89D7C] text-[#1E1116] border border-[#C89D7C]/40 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Store</span>
            </Link>
            <Link
              to="/"
              onClick={() => window.scrollTo(0, 0)}
              className="text-xl sm:text-2xl font-serif-luxury font-bold tracking-tight text-[#1E1116]"
            >
              {brandName}
            </Link>
          </div>

          <a
            href={`https://wa.me/${waClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E1116] text-[#FFFDFB] hover:bg-[#C89D7C] hover:text-[#1E1116] text-xs font-semibold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Support:</span>
            <span className="font-mono-num">+91 8329783642</span>
          </a>
        </div>

        {/* Sub-Bar: 5 Direct Policy Navigation Tabs */}
        <div className="bg-[#FDF6F6] border-t border-[#1E1116]/8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {POLICY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = policyType === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => window.scrollTo(0, 0)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                    isActive
                      ? 'bg-[#1E1116] text-[#FFFDFB] shadow-xs'
                      : 'bg-[#FFFDFB] text-[#1E1116]/75 border border-[#1E1116]/12 hover:border-[#C89D7C] hover:text-[#1E1116]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#C89D7C]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Policy Document Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 flex-1">
        {/* Top Store Verification Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/35 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#C89D7C]">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Official Merchant Compliance & Customer Protection</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#1E1116]">
              {brandName} — Shop no.3, Opp. Concept Arena, Near Smart Bazaar, Palegaon, Ambernath - 421501, Maharashtra, India
            </p>
            <p className="text-xs text-[#1E1116]/70">
              Official Support & Grievance Helpline: <strong className="font-mono-num">+91 8329783642</strong> · Razorpay Verified Checkout
            </p>
          </div>
          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            className="px-4 py-2 rounded-xl bg-[#1E1116] text-[#FFFDFB] hover:bg-[#C89D7C] hover:text-[#1E1116] text-xs font-semibold transition-colors"
          >
            ← Back to Store
          </Link>
        </div>

        {/* ===================================================================
            1. CONTACT US PAGE (/contact-us)
           =================================================================== */}
        {policyType === 'contact-us' && (
          <article className="bg-[#FFFDFB] border border-[#1E1116]/12 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs">
            <div className="border-b border-[#1E1116]/10 pb-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#C89D7C]">
                Customer Care & Merchant Contact Details
              </p>
              <h1 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-[#1E1116]">
                Contact Us — {brandName}
              </h1>
              <p className="text-xs sm:text-sm text-[#1E1116]/70 leading-relaxed">
                Welcome to <strong>{brandName}</strong>. Whether you have a question about our Perfumes & Deodorants, Ladies Purses & Handbags, Boutique Items, Cosmetic Products, Beauty Products, Skin Care, Hair Care, Hair Accessories, or Anti-Tarnish Jewellery, or need assistance with an online order, our team at Ambernath is here to help.
              </p>
            </div>

            {/* Merchant Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#1E1116] text-[#D4AF37] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[#1E1116]">Registered Store Address</h2>
                <p className="text-xs text-[#1E1116]/80 leading-relaxed">
                  <strong>Girlz Zone</strong>
                  <br />
                  Shop no.3, Opp. Concept Arena, Near Smart Bazaar, Palegaon, Ambernath - 421501, Maharashtra, India
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#C89D7C] hover:underline pt-1"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#1E1116] text-[#D4AF37] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[#1E1116]">Phone & WhatsApp Support</h2>
                <p className="text-xs text-[#1E1116]/80 leading-relaxed">
                  Direct Call & Official WhatsApp Order Desk:
                </p>
                <p className="text-sm font-mono-num font-bold text-[#1E1116]">+91 8329783642</p>
                <p className="text-xs text-[#1E1116]/70 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#C89D7C]" />
                  <span>support@girlzzone.com</span>
                </p>
                <a
                  href={`https://wa.me/${waClean}?text=${encodeURIComponent(
                    'Hello Girlz Zone! I would like to connect with Customer Support.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline pt-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp Now</span>
                </a>
              </div>

              <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#1E1116] text-[#D4AF37] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[#1E1116]">Store Operating Hours</h2>
                <p className="text-xs text-[#1E1116]/80 leading-relaxed">
                  <strong>Monday – Sunday:</strong>
                  <br />
                  10:00 AM – 9:00 PM IST
                </p>
                <p className="text-[11px] text-[#1E1116]/65">
                  Online orders & Razorpay payments are accepted 24×7 on our website. Queries are answered within 2–4 business hours.
                </p>
              </div>
            </div>

            {/* Customer Grievance Redressal Officer (Mandatory for Indian E-Commerce & Razorpay Compliance) */}
            <div className="p-5 rounded-xl bg-[#FDF6F6]/70 border border-[#1E1116]/12 space-y-2 text-xs leading-relaxed">
              <h2 className="text-sm font-bold text-[#1E1116] uppercase tracking-wider">
                Customer Grievance Redressal Officer (Consumer Protection & IT Act Compliance)
              </h2>
              <p className="text-[#1E1116]/80">
                In accordance with the Information Technology Act, 2000, Digital Personal Data Protection (DPDP) Act, 2023, and Consumer Protection (E-Commerce) Rules, 2020, the contact details of the Grievance Officer for <strong>Girlz Zone</strong> are provided below:
              </p>
              <ul className="space-y-1 text-[#1E1116]/85 pt-1">
                <li>
                  <strong>Designation:</strong> Grievance & Customer Escalation Officer — Girlz Zone
                </li>
                <li>
                  <strong>Office Address:</strong> Shop no.3, Opp. Concept Arena, Near Smart Bazaar, Palegaon, Ambernath - 421501, Maharashtra, India
                </li>
                <li>
                  <strong>Contact Number / WhatsApp:</strong>{' '}
                  <span className="font-mono-num font-semibold">+91 8329783642</span>
                </li>
                <li>
                  <strong>Email:</strong> support@girlzzone.com
                </li>
                <li>
                  <strong>Resolution Timeline:</strong> All customer grievances are acknowledged within 24 hours and resolved within 5–7 business days.
                </li>
              </ul>
            </div>

            {/* Interactive Contact / Support Inquiry Form */}
            <div className="p-6 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/35 space-y-4">
              <div>
                <h2 className="text-lg font-serif-luxury font-bold text-[#1E1116]">
                  Send Us an Inquiry or Support Request
                </h2>
                <p className="text-xs text-[#1E1116]/70">
                  Fill out the form below for order assistance, bulk/bridal inquiries, return requests, or payment support.
                </p>
              </div>

              {inquirySubmitted ? (
                <div
                  data-testid="contact-inquiry-success"
                  className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 text-xs"
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>Thank You, {inquiryName}! Your Support Request Has Been Recorded.</span>
                  </div>
                  <p>
                    Our support desk at <strong>Girlz Zone, Ambernath (+91 8329783642)</strong> will reach out to you on <strong>+91 {inquiryPhone}</strong> shortly. For instant assistance, you can also send this inquiry directly on our official WhatsApp below:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={`https://wa.me/${waClean}?text=${encodeURIComponent(
                        `*CUSTOMER SUPPORT INQUIRY — GIRLZ ZONE*\nName: ${inquiryName}\nPhone: ${inquiryPhone}\nEmail: ${
                          inquiryEmail || 'N/A'
                        }\nOrder ID: ${inquiryOrderId || 'N/A'}\nTopic: ${inquiryTopic}\nMessage: ${inquiryMessage}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Instantly on WhatsApp (+91 8329783642)</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setInquirySubmitted(false);
                        setInquiryMessage('');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-emerald-700/30 text-emerald-800 font-semibold hover:bg-emerald-100 cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#1E1116] mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/15 focus:outline-none focus:border-[#C89D7C]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1E1116] mb-1">
                        10-Digit Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 rounded-xl font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 focus:outline-none focus:border-[#C89D7C]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-[#1E1116] mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/15 focus:outline-none focus:border-[#C89D7C]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1E1116] mb-1">
                        Order ID (If Applicable)
                      </label>
                      <input
                        type="text"
                        value={inquiryOrderId}
                        onChange={(e) => setInquiryOrderId(e.target.value)}
                        placeholder="e.g. GZ-10001"
                        className="w-full px-3.5 py-2.5 rounded-xl font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 focus:outline-none focus:border-[#C89D7C]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1E1116] mb-1">
                        Inquiry Topic
                      </label>
                      <select
                        value={inquiryTopic}
                        onChange={(e) => setInquiryTopic(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/15 focus:outline-none focus:border-[#C89D7C]"
                      >
                        <option value="Order & Delivery Status">Order & Delivery Status</option>
                        <option value="Razorpay Online Payment Query">Razorpay Online Payment Query</option>
                        <option value="Return / Replacement Request">Return / Replacement Request</option>
                        <option value="Product Availability (Perfumes, Purses, Cosmetics, Jewellery)">
                          Product Availability (Perfumes, Purses, Cosmetics, Jewellery)
                        </option>
                        <option value="Store Pickup at Ambernath">Store Pickup at Ambernath</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1E1116] mb-1">
                      Message / How Can We Help You? *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Write your message or question here..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/15 focus:outline-none focus:border-[#C89D7C]"
                    />
                  </div>

                  <button
                    type="submit"
                    data-testid="contact-submit-btn"
                    className="px-6 py-3 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] font-semibold transition-colors cursor-pointer"
                  >
                    Submit Support Inquiry
                  </button>
                </form>
              )}
            </div>
          </article>
        )}

        {/* ===================================================================
            2. TERMS & CONDITIONS PAGE (/terms-and-conditions)
           =================================================================== */}
        {policyType === 'terms-and-conditions' && (
          <article className="bg-[#FFFDFB] border border-[#1E1116]/12 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-xs sm:text-sm leading-relaxed text-[#1E1116]/85">
            <div className="border-b border-[#1E1116]/10 pb-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#C89D7C]">
                Legal Agreement & Terms of Service
              </p>
              <h1 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-[#1E1116]">
                Terms & Conditions
              </h1>
              <p className="text-xs text-[#1E1116]/60">
                Effective & Last Updated: November 2026 · Merchant: <strong>Girlz Zone, Ambernath</strong>
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                1. Introduction & Acceptance of Terms
              </h2>
              <p>
                This website is operated by <strong>Girlz Zone</strong>, having its registered retail boutique at <strong>Shop no.3, Opp. Concept Arena, Near Smart Bazaar, Palegaon, Ambernath - 421501, Maharashtra, India</strong> (Phone/WhatsApp: <span className="font-mono-num">+91 8329783642</span>). Throughout the site, the terms "we", "us", and "our" refer to <strong>Girlz Zone</strong>. By visiting our website or purchasing products from us, you engage in our "Service" and agree to be bound by the following Terms and Conditions ("Terms of Service"), governed by the laws of India including the Indian Contract Act, 1872 and the Consumer Protection (E-Commerce) Rules, 2020.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                2. Products & Categories Covered
              </h2>
              <p>
                <strong>Girlz Zone</strong> retails curated lifestyle, fashion, and personal care merchandise across the following product categories:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {OFFICIAL_PRODUCT_CATEGORIES.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 rounded-lg bg-[#FDF6F6] border border-[#C89D7C]/35 text-xs font-semibold text-[#1E1116]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <p className="pt-1">
                We make every effort to display as accurately as possible the colors, finishes, shade names, and dimensions of our perfumes, ladies purses & handbags, boutique items, cosmetics, skincare, hair care, hair accessories, and anti-tarnish jewellery. Slight variations in color may occur due to differences in mobile or laptop screen calibration.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                3. Customer Account Registration & Accuracy of Information
              </h2>
              <p>
                Customers may shop using a registered account (via Email/Phone + Password, Google Sign-In, or Mobile Quick Login) or provide delivery details at checkout. You agree to provide current, complete, and accurate purchase and delivery information—specifically your Full Name, active 10-Digit Indian Mobile Number, Email Address, and complete Delivery Address with valid Pincode—so that we can fulfill your order and provide live Flipkart-style order tracking updates.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                4. Pricing in INR (₹) & Taxes
              </h2>
              <p>
                All product prices listed on the <strong>Girlz Zone</strong> website are stated in <strong>Indian Rupees (INR / ₹)</strong> and are inclusive of applicable Indian taxes unless explicitly stated otherwise. Shipping charges (if applicable below our free-delivery order threshold) and promotional coupon discounts are transparently calculated and displayed in the Order Bill Summary prior to payment.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                5. Secure Online Payments via Razorpay & Cash on Delivery
              </h2>
              <p>
                We offer secure online prepaid checkout powered by <strong>Razorpay Payment Gateway</strong> supporting UPI (Google Pay, PhonePe, Paytm, BHIM), Credit Cards, Debit Cards, NetBanking, and Wallets, as well as Cash on Delivery (COD) and Store Pickup options. By initiating an online payment, you authorize Razorpay to process the transaction for the total order amount displayed at checkout. Every successful online payment generates a unique Razorpay Payment ID and cryptographic verification receipt recorded against your Girlz Zone Order ID.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                6. Product Usage, Hygiene & Allergy Disclaimer
              </h2>
              <p>
                For Cosmetic Products, Beauty Products, Skin Care, Hair Care, and Perfumes & Deodorants, customers are advised to review product descriptions and perform a patch test prior to full application. Girlz Zone sources authentic products from trusted suppliers, but individual skin sensitivities vary. Anti-Tarnish Jewellery should be stored in a dry pouch away from harsh chemicals to preserve its 18K gold-tone luster.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                7. Intellectual Property Rights
              </h2>
              <p>
                All content on this website, including the <strong>Girlz Zone</strong> brand name, logos, product photography, graphics, and software architecture, is the property of Girlz Zone and is protected under applicable Indian copyright and trademark laws.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                8. Governing Law & Jurisdiction
              </h2>
              <p>
                These Terms & Conditions and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to purchases on this website shall be subject to the exclusive jurisdiction of the competent courts in <strong>Ambernath / Thane, Maharashtra, India</strong>.
              </p>
            </section>
          </article>
        )}

        {/* ===================================================================
            3. PRIVACY POLICY PAGE (/privacy-policy)
           =================================================================== */}
        {policyType === 'privacy-policy' && (
          <article className="bg-[#FFFDFB] border border-[#1E1116]/12 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-xs sm:text-sm leading-relaxed text-[#1E1116]/85">
            <div className="border-b border-[#1E1116]/10 pb-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#C89D7C]">
                Data Protection & Customer Privacy Commitment
              </p>
              <h1 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-[#1E1116]">
                Privacy Policy
              </h1>
              <p className="text-xs text-[#1E1116]/60">
                Compliant with the Indian Information Technology Act, 2000 & Digital Personal Data Protection (DPDP) Act, 2023
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                1. Overview & Commitment to Privacy
              </h2>
              <p>
                <strong>Girlz Zone</strong> (located at <strong>Shop no.3, Opp. Concept Arena, Near Smart Bazaar, Palegaon, Ambernath - 421501, Maharashtra, India</strong>) respects your privacy and is committed to safeguarding the personal information you share with us when shopping for Perfumes & Deodorants, Ladies Purses & Handbags, Boutique Items, Cosmetics, Beauty Products, Skin Care, Hair Care, Hair Accessories, and Anti-Tarnish Jewellery.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                2. Personal Information We Collect
              </h2>
              <p>When you register an account or place an order on our website, we collect only the essential information required to fulfill and track your order:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Identity & Contact Data:</strong> Your Full Name, 10-Digit Mobile Number, and Email Address (including Google Sign-In profile email/name when you choose "Continue with Google").
                </li>
                <li>
                  <strong>Delivery Address Data:</strong> House/Flat No., Building/Street, Area/Locality, Landmark, City, State, and Pincode for accurate doorstep delivery.
                </li>
                <li>
                  <strong>Order & Transaction Metadata:</strong> Ordered items, order totals, promo codes used, live delivery tracking history, and Razorpay Payment Reference IDs (<span className="font-mono-num">pay_...</span> / <span className="font-mono-num">order_...</span>).
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                3. How We Use & Store Your Data (Google Firebase Security)
              </h2>
              <p>
                Your profile and order records are securely stored in <strong>Google Firebase</strong> cloud infrastructure using encrypted HTTPS/TLS connections. We use your information strictly to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Process, pack, and dispatch your orders from our Ambernath store.</li>
                <li>Provide real-time Flipkart-style order tracking on our website using your Order ID or 10-Digit Mobile Number.</li>
                <li>Send order invoices, dispatch alerts, AWB tracking numbers, and customer support responses via WhatsApp/SMS/Phone (+91 8329783642).</li>
                <li>Pre-fill your saved delivery address for faster checkout on future visits.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                4. Payment Security via Razorpay (Zero Card/UPI Storage on Our Servers)
              </h2>
              <p>
                All online payments on <strong>Girlz Zone</strong> are processed through <strong>Razorpay</strong>, a PCI-DSS Level 1 compliant payment gateway regulated in India. <strong>Girlz Zone never collects, views, or stores your Credit/Debit Card numbers, CVV, NetBanking passwords, or UPI PINs on our servers or database.</strong> All sensitive payment credentials are encrypted and handled directly by Razorpay's secure checkout infrastructure.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                5. Data Sharing with Trusted Delivery Partners
              </h2>
              <p>
                We never sell, rent, or trade your personal data to third-party marketers. Your Name, Delivery Address, and Mobile Number are shared solely with our logistics/courier partners (such as Delhivery, BlueDart, DTDC, XpressBees, or local Ambernath delivery executives) for the sole purpose of delivering your package to your doorstep.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                6. Cookies & Local Storage
              </h2>
              <p>
                We use essential browser storage (<span className="font-mono-num">localStorage</span> and session tokens) to keep your shopping bag items, wishlist selections, and customer login session active while you browse our store.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                7. Your Rights Under the DPDP Act & Contact for Privacy Requests
              </h2>
              <p>
                You have the right to access, update, or request deletion of your customer account data at any time. To exercise these rights, please contact our Grievance Officer at <strong>Girlz Zone, Shop no.3, Opp. Concept Arena, Near Smart Bazaar, Palegaon, Ambernath - 421501, Maharashtra</strong> or call/WhatsApp us at <strong className="font-mono-num">+91 8329783642</strong>.
              </p>
            </section>
          </article>
        )}

        {/* ===================================================================
            4. REFUND & CANCELLATION POLICY PAGE (/refund-policy)
           =================================================================== */}
        {policyType === 'refund-policy' && (
          <article className="bg-[#FFFDFB] border border-[#1E1116]/12 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-xs sm:text-sm leading-relaxed text-[#1E1116]/85">
            <div className="border-b border-[#1E1116]/10 pb-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#C89D7C]">
                Fair & Transparent Customer Returns, Replacements & Refunds
              </p>
              <h1 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-[#1E1116]">
                Refund & Cancellation Policy
              </h1>
              <p className="text-xs text-[#1E1116]/60">
                Applicable to all purchases made at <strong>Girlz Zone</strong> (Online Storefront & Ambernath Flagship Store)
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                1. Order Cancellation Policy
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Before Shipment:</strong> You may cancel your order at any time <strong>before the order status is marked as "Shipped"</strong> (or within <strong>12 hours</strong> of placing the order, whichever is earlier) by contacting our support desk via WhatsApp or phone at <strong className="font-mono-num">+91 8329783642</strong> with your Order ID (e.g. <span className="font-mono-num">GZ-10001</span>).
                </li>
                <li>
                  <strong>100% Refund on Pre-Shipment Cancellation:</strong> If you cancel a prepaid order before it is shipped, 100% of the paid amount will be refunded to your original payment method via Razorpay.
                </li>
                <li>
                  <strong>After Shipment:</strong> Once an order has been handed over to our courier partner and marked as <strong>"Shipped"</strong> or <strong>"Out for Delivery"</strong>, it cannot be cancelled midway.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                2. Return & Replacement Eligibility (5-Day Window)
              </h2>
              <p>
                We perform a strict quality check at our Ambernath store before packing every order. We offer a <strong>5-day return or replacement window</strong> from the date of delivery strictly under the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You received a physically <strong>damaged, broken, or leaked product</strong> in transit.</li>
                <li>You received a <strong>wrong item, wrong shade, or missing product</strong> compared to your order invoice.</li>
                <li>The product has a verifiable manufacturing defect or is past its expiry date upon delivery.</li>
              </ul>
            </section>

            <section className="p-4 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/40 space-y-2">
              <h2 className="text-sm sm:text-base font-serif-luxury font-bold text-[#1E1116] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C89D7C]" />
                <span>Mandatory 360° Parcel Unboxing Video Requirement</span>
              </h2>
              <p className="text-xs text-[#1E1116]/80">
                To protect our customers and verify transit damage with courier partners, <strong>a clear, continuous, unedited parcel unboxing video starting from showing the shipping label and opening the outer sealed package</strong> is mandatory for any damaged, leaked, defective, or missing item claim. Please share the unboxing video along with your Order ID on our official WhatsApp (<strong className="font-mono-num">+91 8329783642</strong>) within <strong>48 hours of delivery</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                3. Category-Specific Hygiene & Return Rules
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Cosmetic Products, Beauty Products, Skin Care, Hair Care & Perfumes / Deodorants:</strong> Due to strict personal hygiene and health safety standards, opened, swatched, tested, or unsealed cosmetics, skincare creams/serums, hair care products, and perfumes/deodorants are <strong>non-returnable</strong> unless they arrived damaged, leaked, or incorrect as verified in the unboxing video.
                </li>
                <li>
                  <strong>Ladies Purses & Handbags, Boutique Items, Hair Accessories & Anti-Tarnish Jewellery:</strong> Eligible for replacement or return within 5 days if defective or damaged upon arrival, provided the item is unused and has all original brand tags, protective pouches, boxes, and invoice intact.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                4. Refund Processing Timeline (5–7 Business Days via Razorpay)
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Once your return or cancellation claim is verified and approved by the <strong>Girlz Zone</strong> support team, the refund is initiated within <strong>24–48 business hours</strong>.
                </li>
                <li>
                  <strong>Prepaid Online Orders (Razorpay):</strong> Approved refunds are processed directly back to your <strong>original payment source via Razorpay</strong> (UPI, Google Pay, PhonePe, Paytm, Credit/Debit Card, or NetBanking bank account) and reflect in your account within <strong>5–7 business days</strong> as per standard banking timelines.
                </li>
                <li>
                  <strong>Cash on Delivery (COD) Orders:</strong> Approved refunds for COD orders are transferred via UPI or NEFT/IMPS bank transfer to the customer's verified bank/UPI account within <strong>5–7 business days</strong>.
                </li>
              </ul>
            </section>
          </article>
        )}

        {/* ===================================================================
            5. SHIPPING & DELIVERY POLICY PAGE (/shipping-policy)
           =================================================================== */}
        {policyType === 'shipping-policy' && (
          <article className="bg-[#FFFDFB] border border-[#1E1116]/12 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-xs sm:text-sm leading-relaxed text-[#1E1116]/85">
            <div className="border-b border-[#1E1116]/10 pb-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#C89D7C]">
                Fast Dispatch, Safe Packaging & Live Flipkart-Style Order Tracking
              </p>
              <h1 className="text-2xl sm:text-4xl font-serif-luxury font-bold text-[#1E1116]">
                Shipping & Delivery Policy
              </h1>
              <p className="text-xs text-[#1E1116]/60">
                Dispatched directly from <strong>Girlz Zone, Palegaon, Ambernath - 421501, Maharashtra, India</strong>
              </p>
            </div>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                1. Order Processing & Dispatch Timeline (24–48 Hours)
              </h2>
              <p>
                Every order placed on <strong>Girlz Zone</strong> for Perfumes & Deodorants, Ladies Purses & Handbags, Boutique Items, Cosmetic Products, Beauty Products, Skin Care, Hair Care, Hair Accessories, and Anti-Tarnish Jewellery goes through a multi-point quality and protective bubble-wrap packaging check at our Ambernath store.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Dispatch Time:</strong> Orders are packed and handed over to our courier partner within <strong>24 to 48 business hours</strong> of order confirmation.
                </li>
                <li>
                  Glass perfume bottles, liquid skincare serums, and delicate anti-tarnish jewellery are packed in shock-absorbent protective layers to ensure zero transit breakage.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                2. Estimated Delivery Timelines Across India
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C89D7C]">
                    Ambernath, Mumbai MMR & Maharashtra
                  </p>
                  <p className="text-base font-serif-luxury font-bold text-[#1E1116]">
                    2 – 4 Business Days
                  </p>
                  <p className="text-xs text-[#1E1116]/75">
                    Fast delivery across Ambernath, Badlapur, Ulhasnagar, Kalyan, Dombivli, Thane, Navi Mumbai, Mumbai, Pune, and all districts of Maharashtra.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C89D7C]">
                    Rest of India (Pan-India Shipping)
                  </p>
                  <p className="text-base font-serif-luxury font-bold text-[#1E1116]">
                    4 – 7 Business Days
                  </p>
                  <p className="text-xs text-[#1E1116]/75">
                    Delivered via trusted national logistics partners including Delhivery, BlueDart, DTDC, XpressBees, and India Post Speed Post.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                3. Shipping Charges & Free Delivery Threshold
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Free Home Delivery:</strong> Enjoy <strong>FREE Home Delivery</strong> on all orders of <strong>₹{storeConfig.freeDeliveryThreshold || 999} or above</strong>.
                </li>
                <li>
                  <strong>Standard Delivery Charge:</strong> For Home Delivery orders below ₹{storeConfig.freeDeliveryThreshold || 999}, a nominal flat shipping fee of <strong>₹{storeConfig.deliveryCharge || 50}</strong> is applied at checkout.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                4. Free Store Pickup Option (Ambernath Flagship Boutique)
              </h2>
              <p>
                Customers in and around Ambernath can select <strong>"Store Pickup - Girlz Zone Ambernath" (₹0 Shipping Fee)</strong> during checkout and collect their order directly from our retail store at:
                <br />
                <strong>Shop no.3, Opp. Concept Arena, Near Smart Bazaar, Palegaon, Ambernath - 421501, Maharashtra</strong> between <strong>10:00 AM and 9:00 PM IST</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-serif-luxury font-bold text-[#1E1116]">
                5. Live Flipkart-Style Order Tracking
              </h2>
              <p>
                Every order placed on our website can be tracked live in real time across 6 transparent stages: <strong>Order Placed → Order Confirmed → Packed → Shipped (with Courier Name & AWB Number) → Out for Delivery → Delivered</strong>. Simply click <strong>"Track Order"</strong> in the website header or footer and enter your Order ID or 10-Digit Mobile Number.
              </p>
            </section>
          </article>
        )}
      </main>

      {/* Storefront Footer with All 5 Legal & Policy Links */}
      <Footer
        onSelectCategory={() => {
          window.scrollTo(0, 0);
          navigate('/');
        }}
        onTrackOrderClick={() => {
          window.scrollTo(0, 0);
          navigate('/');
        }}
      />
    </div>
  );
};
