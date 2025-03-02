import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Assessment } from "./pages/Assessment";
import Auth from "./pages/Auth";
import BookLanding from "./pages/BookLanding";
import Pricing from "./pages/Pricing";
import { Toaster } from "./components/ui/toaster";
import Dashboard from "./pages/Dashboard";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { AffiliateDetails } from "./components/dashboard/admin/affiliates/AffiliateDetails";
import { PurchaseNotification } from "./components/notifications/PurchaseNotification";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "./components/layout/Layout";
import AffiliateSignup from './pages/AffiliateSignup';

function App() {
  const { session } = useAuth();

  return (
    <>
      <PurchaseNotification />
      <Layout>
        <Routes>
          <Route path="/" element={<Index session={session} />} />
          <Route path="/assessment/:id?" element={<Assessment />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/forgot-password" element={<Auth />} />
          <Route path="/book" element={<BookLanding />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/terms-of-service" element={<Terms />} />
          <Route path="/affiliate-signup" element={<AffiliateSignup />} />
          <Route path="/dashboard/*" element={<Dashboard session={session} />} />

          <Route path="*" element={<Index session={session} />} />
        </Routes>
      </Layout>
      <Toaster />
    </>
  );
}

export default App;
