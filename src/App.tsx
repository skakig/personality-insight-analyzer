
import React, { useEffect, useState } from 'react';
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
import { supabase } from './integrations/supabase/client';

const App = () => {
  const { session } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user is an admin
    const checkAdminStatus = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (data && !error) {
            console.log('[DEBUG] User is admin:', data);
            setIsAdmin(true);
          } else {
            console.log('[DEBUG] User is not admin or error occurred:', error);
            setIsAdmin(false);
          }
        } catch (err) {
          console.error('[ERROR] Error checking admin status:', err);
          setIsAdmin(false);
        }
      }
    };
    
    checkAdminStatus();
  }, [session]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex-grow">
        <Routes>
          <Route path="/dashboard" element={<Dashboard session={session} />} />
          <Route path="/results/:quizResultId" element={<Navigate to="/dashboard" />} />
          <Route path="/pricing/:quizResultId" element={<Navigate to="/dashboard" />} />
          <Route 
            path="/dashboard/admin/*" 
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" />} 
          />
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
