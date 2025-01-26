import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Pricing from "@/pages/Pricing";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;