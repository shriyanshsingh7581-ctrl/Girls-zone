import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Check,
  Package,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DeliveryAddress } from '../types';
import { isValidTenDigitPhone } from '../utils/commerce';

interface CustomerAuthModalProps {
  onOpenMyOrders: () => void;
}

const DEFAULT_ADDRESS: DeliveryAddress = {
  houseFlatNo: '',
  buildingStreet: '',
  areaLocality: '',
  landmark: '',
  city: 'Ambernath',
  state: 'Maharashtra',
  pincode: '421501',
};

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ onOpenMyOrders }) => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentCustomer,
    registerCustomer,
    loginCustomer,
    loginWithGoogle,
    loginWithoutPassword,
    logoutCustomer,
    updateCustomerProfile,
    orders,
  } = useStore();

  const [mode, setMode] = useState<'passwordless' | 'login' | 'signup'>('passwordless');

  // Passwordless Quick Login fields
  const [quickPhone, setQuickPhone] = useState('');
  const [quickName, setQuickName] = useState('');

  // Standard Login fields
  const [identifier, setIdentifier] = useState(''); // Email OR 10-Digit Phone Number
  const [password, setPassword] = useState('');

  // Sign up / Profile fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState<DeliveryAddress>(DEFAULT_ADDRESS);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (currentCustomer) {
      setFullName(currentCustomer.fullName);
      setPhone(currentCustomer.phone);
      setEmail(currentCustomer.email);
      setAddress(currentCustomer.address || DEFAULT_ADDRESS);
    }
  }, [currentCustomer]);

  if (!isAuthModalOpen) return null;

  const customerOrders = currentCustomer
    ? orders.filter(
        (o) =>
          o.customerId === currentCustomer.uid ||
          (currentCustomer.phone && o.customerPhone === currentCustomer.phone) ||
          (currentCustomer.email &&
            o.customerEmail &&
            o.customerEmail.toLowerCase() === currentCustomer.email.toLowerCase())
      )
    : [];

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    try {
      setBusy(true);
      await loginWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('popup-closed-by-user')) {
        setError('Google sign-in popup was closed. You can try again or use Instant Login below.');
      } else {
        setError(msg || 'Google sign-in could not complete. Try Instant Phone Login below.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordlessLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!isValidTenDigitPhone(quickPhone)) {
      setError('Please enter a valid 10-Digit Mobile Number.');
      return;
    }
    try {
      setBusy(true);
      await loginWithoutPassword({
        phone: quickPhone,
        fullName: quickName.trim() || undefined,
      });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Quick login failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!identifier.trim() || !password) {
      setError('Please enter your Email ID or 10-Digit Phone Number and Password.');
      return;
    }
    try {
      setBusy(true);
      await loginCustomer(identifier, password);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!fullName.trim()) {
      setError('Please enter your Full Name.');
      return;
    }
    if (!isValidTenDigitPhone(phone)) {
      setError('Please enter a valid 10-Digit Mobile Number.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid Email ID.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (
      !address.houseFlatNo.trim() ||
      !address.buildingStreet.trim() ||
      !address.areaLocality.trim() ||
      !address.city.trim() ||
      !address.pincode.trim()
    ) {
      setError('Please complete all required delivery address fields.');
      return;
    }

    try {
      setBusy(true);
      await registerCustomer({
        fullName,
        phone,
        email,
        password,
        address,
      });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      setBusy(true);
      await updateCustomerProfile({ fullName, phone, address });
      setSuccessMsg('Saved address & profile updated successfully!');
    } catch (err: any) {
      setError(err?.message || 'Could not update profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Customer Account"
      className="fixed inset-0 z-50 bg-[#1E1116]/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        className="bg-[#FFFDFB] w-full md:max-w-lg rounded-t-3xl md:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-[#1E1116]/10 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#1E1116]/10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#C89D7C]" />
            <h2 className="text-xl font-serif-luxury font-semibold text-[#1E1116]">
              {currentCustomer
                ? `Welcome, ${currentCustomer.fullName}`
                : mode === 'passwordless'
                ? 'Instant Login (No ID / Password Needed)'
                : mode === 'login'
                ? 'Customer Sign In'
                : 'Create Girlz Zone Account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            aria-label="Close account modal"
            className="w-8 h-8 rounded-full hover:bg-[#1E1116]/10 flex items-center justify-center text-[#1E1116] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {currentCustomer ? (
          <div className="pt-4 space-y-5">
            <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30 flex items-center justify-between">
              <div className="text-xs space-y-1">
                {currentCustomer.phone && (
                  <p className="font-semibold text-[#1E1116] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C89D7C]" />
                    <span className="font-mono-num">+91 {currentCustomer.phone}</span>
                  </p>
                )}
                <p className="text-[#1E1116]/70 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C89D7C]" />
                  <span>{currentCustomer.email}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await logoutCustomer();
                  setIsAuthModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(false);
                onOpenMyOrders();
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#1E1116] text-[#FFFDFB] hover:bg-[#C89D7C] hover:text-[#1E1116] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C89D7C]" />
                <span>View My Orders & Live Delivery Status</span>
              </span>
              <span className="font-mono-num bg-[#FFFDFB]/15 px-2 py-0.5 rounded">
                {customerOrders.length} Orders
              </span>
            </button>

            <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-[#1E1116]/10">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1E1116]">
                Saved Delivery Address (Auto-Fills at Checkout)
              </h3>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">{error}</div>
              )}
              {successMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-Digit Mobile"
                  className="px-3 py-2 text-xs font-mono-num bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={address.houseFlatNo}
                  onChange={(e) => setAddress({ ...address, houseFlatNo: e.target.value })}
                  placeholder="House / Flat No."
                  className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                />
                <input
                  type="text"
                  required
                  value={address.buildingStreet}
                  onChange={(e) => setAddress({ ...address, buildingStreet: e.target.value })}
                  placeholder="Building / Street"
                  className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={address.areaLocality}
                  onChange={(e) => setAddress({ ...address, areaLocality: e.target.value })}
                  placeholder="Area / Locality"
                  className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                />
                <input
                  type="text"
                  value={address.landmark}
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  placeholder="Landmark"
                  className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City"
                  className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                />
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="State"
                  className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                />
                <input
                  type="text"
                  required
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="px-3 py-2 text-xs font-mono-num bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 px-4 rounded-xl bg-[#C89D7C] hover:bg-[#b88b69] text-[#1E1116] text-xs font-semibold transition-colors cursor-pointer"
              >
                {busy ? 'Saving...' : 'Save Address & Profile'}
              </button>
            </form>
          </div>
        ) : (
          <div className="pt-4 space-y-4">
            {/* 1-CLICK GOOGLE / GMAIL SIGN IN BUTTON */}
            <button
              type="button"
              data-testid="google-login-btn"
              disabled={busy}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#FDF6F6] text-[#1E1116] border-2 border-[#1E1116]/15 hover:border-[#C89D7C] text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>Continue with Google / Gmail</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#1E1116]/10 w-full" />
              <span className="bg-[#FFFDFB] px-3 text-[10px] font-semibold uppercase tracking-widest text-[#1E1116]/45 shrink-0">
                Or Choose Login Method
              </span>
              <div className="border-t border-[#1E1116]/10 w-full" />
            </div>

            {/* 3-Mode Switcher: Instant Login (No Password) | ID & Password | New Sign Up */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#FDF6F6] rounded-xl border border-[#1E1116]/10">
              <button
                type="button"
                data-testid="tab-passwordless-login"
                onClick={() => {
                  setMode('passwordless');
                  setError('');
                }}
                className={`py-2 px-1.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  mode === 'passwordless'
                    ? 'bg-[#1E1116] text-[#FFFDFB]'
                    : 'text-[#1E1116]/70 hover:text-[#1E1116]'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />
                <span className="truncate">No Password</span>
              </button>
              <button
                type="button"
                data-testid="tab-password-login"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`py-2 px-1.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  mode === 'login'
                    ? 'bg-[#1E1116] text-[#FFFDFB]'
                    : 'text-[#1E1116]/70 hover:text-[#1E1116]'
                }`}
              >
                <KeyRound className="w-3 h-3 shrink-0" />
                <span className="truncate">ID & Password</span>
              </button>
              <button
                type="button"
                data-testid="tab-signup"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className={`py-2 px-1.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#1E1116] text-[#FFFDFB]'
                    : 'text-[#1E1116]/70 hover:text-[#1E1116]'
                }`}
              >
                New Sign Up
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            {mode === 'passwordless' ? (
              /* INSTANT LOGIN WITHOUT ID OR PASSWORD */
              <form onSubmit={handlePasswordlessLogin} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30 text-xs text-[#1E1116]/80">
                  <strong>Instant Login Without ID / Password:</strong> Enter your 10-Digit Mobile Number to sign in immediately and view your orders or auto-fill checkout.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1116] mb-1">
                    10-Digit Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    data-testid="quick-login-phone-input"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 text-xs font-mono-num bg-[#FDF6F6] border border-[#1E1116]/15 rounded-xl focus:outline-none focus:border-[#C89D7C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1116] mb-1">
                    Your Name (Optional if returning customer)
                  </label>
                  <input
                    type="text"
                    data-testid="quick-login-name-input"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-xl focus:outline-none focus:border-[#C89D7C]"
                  />
                </div>

                <button
                  type="submit"
                  data-testid="quick-login-submit-btn"
                  disabled={busy}
                  className="w-full py-3 px-4 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  {busy ? 'Logging In...' : 'Instant Login Without Password'}
                </button>
              </form>
            ) : mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1116] mb-1">
                    Email ID OR 10-Digit Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter Email ID or 10-Digit Phone Number"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-xl focus:outline-none focus:border-[#C89D7C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1116] mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-xl focus:outline-none focus:border-[#C89D7C]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 px-4 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  {busy ? 'Signing In...' : 'Sign In with Password'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1116] mb-1">
                      1. Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1116] mb-1">
                      2. 10-Digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2 text-xs font-mono-num bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1116] mb-1">
                      3. Email ID *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1116] mb-1">
                      4. Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1E1116]">
                    <MapPin className="w-3.5 h-3.5 text-[#C89D7C]" />
                    <span>5. Complete Delivery Address *</span>
                  </label>
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
                      placeholder="Landmark"
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

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 px-4 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  {busy ? 'Creating Account...' : 'Create Account & Save Address'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
