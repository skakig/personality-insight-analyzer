import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Assessment } from "./pages/Assessment";
import AssessmentHistory from "./pages/AssessmentHistory";
import Dashboard from "./pages/Dashboard";
import BookLanding from "./pages/BookLanding";
import Pricing from "./pages/Pricing";
import { GiftSuccess } from "./pages/GiftSuccess";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((error) => {
      console.error("Error getting session:", error);
      toast({
        title: "Error",
        description: "Failed to retrieve authentication session. Please try logging in again.",
        variant: "destructive",
      });
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.email);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Navigation session={session} />
      <Routes>
        <Route path="/" element={<Index session={session} />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/assessment/:id?" element={<Assessment />} />
        <Route path="/assessment-history" element={<AssessmentHistory />} />
        <Route path="/dashboard" element={<Dashboard session={session} />} />
        <Route path="/book" element={<BookLanding />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/gift-success" element={<GiftSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;