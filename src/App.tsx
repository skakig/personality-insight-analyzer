
import { Routes, Route } from "react-router-dom";
import { Index as Landing } from "./pages/Index";
import { Assessment } from "./pages/Assessment";
import { Auth as Login } from "./pages/Auth";
import { Auth as Signup } from "./pages/Auth";
import { Auth as ForgotPassword } from "./pages/Auth";
import { BookLanding as Book } from "./pages/BookLanding";
import { Pricing } from "./pages/Pricing";
import { Toaster } from "./components/ui/toaster";
import { Dashboard } from "./pages/Dashboard";
import { Privacy as PrivacyPolicy } from "./pages/Privacy";
import { Terms as TermsOfService } from "./pages/Terms";
import { AffiliateDetails } from "./components/dashboard/admin/affiliates/AffiliateDetails";
import { PurchaseNotification } from "./components/notifications/PurchaseNotification";

function App() {
  return (
    <>
      <PurchaseNotification />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/assessment/:id?" element={<Assessment />} />
        <Route path="/login" element={<Login mode="signin" />} />
        <Route path="/signup" element={<Signup mode="signup" />} />
        <Route path="/forgot-password" element={<ForgotPassword mode="reset" />} />
        <Route path="/book" element={<Book />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        <Route path="/dashboard/*" element={<Dashboard />} />

        <Route path="*" element={<Landing />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
