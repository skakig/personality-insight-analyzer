import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { Index } from "@/pages/Index";
import { Auth } from "@/pages/Auth";
import { Dashboard } from "@/pages/Dashboard";
import { AssessmentHistory } from "@/pages/AssessmentHistory";
import { BookLanding } from "@/pages/BookLanding";
import { Pricing } from "@/pages/Pricing";
import { Assessment } from "@/pages/Assessment"; // Add this import

export default function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assessment-history" element={<AssessmentHistory />} />
        <Route path="/assessment/:id" element={<Assessment />} />
        <Route path="/book" element={<BookLanding />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
      <Toaster />
    </Router>
  );
}