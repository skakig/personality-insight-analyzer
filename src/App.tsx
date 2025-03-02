
import React from 'react';
import {
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import { PricingSection } from './components/results/PricingSection';
import { AdminDashboard } from './components/dashboard/admin/AdminDashboard';
import { useAuth } from './hooks/useAuth';
import { Footer } from './components/layout/Footer';
import Navigation from './components/Navigation';
import Pricing from './pages/Pricing';
import BookLanding from './pages/BookLanding';
import Auth from './pages/Auth';
import AffiliateSignup from './pages/AffiliateSignup';

const App = () => {
  const { session } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex-grow">
        <Routes>
          <Route path="/dashboard" element={<Dashboard session={session} />} />
          <Route path="/results/:quizResultId" element={<Navigate to="/dashboard" />} />
          <Route path="/pricing/:quizResultId" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
          <Route path="/affiliates" element={<Navigate to="/dashboard/admin/affiliates" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/book" element={<BookLanding />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/affiliate-signup" element={<AffiliateSignup />} />
          <Route path="/" element={<Index session={session} />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
