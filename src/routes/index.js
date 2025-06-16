import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ShipmentProvider } from '../context/ShipmentContext';
import Layout from '../components/layout/Layout';
import HomePage from '../pages/HomePage';
import TrackingPage from '../pages/TrackingPage';
import CreateShipmentPage from '../pages/CreateShipmentPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <ShipmentProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="track" element={<Navigate to="/" replace />} />
          <Route path="tracking/:trackingNumber" element={<TrackingPage />} />
          <Route path="track/:trackingNumber" element={<Navigate to="/tracking/:trackingNumber" replace />} />
          <Route path="create" element={<CreateShipmentPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<div>Privacy Policy - Coming Soon</div>} />
          <Route path="terms" element={<div>Terms of Service - Coming Soon</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ShipmentProvider>
  );
};

export default AppRoutes;
