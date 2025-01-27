import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { Index } from "./pages/Index";
import { Auth } from "./pages/Auth";
import { Assessment } from "./pages/Assessment";
import { AssessmentHistory } from "./pages/AssessmentHistory";
import { Dashboard } from "./pages/Dashboard";
import { BookLanding } from "./pages/BookLanding";
import { Pricing } from "./pages/Pricing";
import { GiftSuccess } from "./pages/GiftSuccess";

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/assessment/:id?" element={<Assessment />} />
        <Route path="/assessment-history" element={<AssessmentHistory />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book" element={<BookLanding />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/gift-success" element={<GiftSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;