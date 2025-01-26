import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Pricing from "@/pages/Pricing";
import BookLanding from "@/pages/BookLanding";
import AssessmentHistory from "@/pages/AssessmentHistory";
import "./App.css";

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/book" element={<BookLanding />} />
        <Route path="/assessment-history" element={<AssessmentHistory />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;