import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { StorefrontPage } from './pages/StorefrontPage';
import { AdminPage } from './pages/AdminPage';
import { LegalPoliciesPage } from './pages/LegalPoliciesPage';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StorefrontPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/contact-us" element={<LegalPoliciesPage policyType="contact-us" />} />
          <Route path="/terms-and-conditions" element={<LegalPoliciesPage policyType="terms-and-conditions" />} />
          <Route path="/privacy-policy" element={<LegalPoliciesPage policyType="privacy-policy" />} />
          <Route path="/refund-policy" element={<LegalPoliciesPage policyType="refund-policy" />} />
          <Route path="/shipping-policy" element={<LegalPoliciesPage policyType="shipping-policy" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
