
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Assessment from "./pages/Assessment";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Book from "./pages/Book";
import Pricing from "./pages/Pricing";
import { Toaster } from "./components/ui/toaster";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardHome from "./components/dashboard/DashboardHome";
import DashboardSettings from "./components/dashboard/DashboardSettings";
import AdminPanel from "./components/dashboard/admin/AdminPanel";
import AssessmentHistory from "./components/dashboard/AssessmentHistory";
import ViewResult from "./components/dashboard/ViewResult";
import { PurchaseNotification } from "./components/notifications/PurchaseNotification";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { AffiliateDetails } from "./components/dashboard/admin/affiliates/AffiliateDetails";

function App() {
  return (
    <>
      <PurchaseNotification />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/assessment/:id?" element={<Assessment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/book" element={<Book />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="settings" element={<DashboardSettings />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="admin/affiliates/:id" element={<AffiliateDetails />} />
          <Route path="history" element={<AssessmentHistory />} />
          <Route path="result/:id" element={<ViewResult />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
