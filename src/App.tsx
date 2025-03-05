
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
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { PurchaseNotification } from "./components/notifications/PurchaseNotification";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log("Starting auth initialization...");
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Initial session retrieved:", initialSession ? "Session exists" : "No session");
        setSession(initialSession);
        setAuthInitialized(true);
        console.log("Auth initialization complete");
      } catch (error: any) {
        console.error("Error initializing auth:", error);
        toast({
          title: "Error",
          description: "Failed to initialize authentication. Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", {
        event: _event,
        userEmail: session?.user?.email,
        timestamp: new Date().toISOString()
      });
      setSession(session);
      setAuthInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || !authInitialized) {
    console.log("App loading state:", { loading, authInitialized });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navigation session={session} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index session={session} />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/assessment/:id?" element={<Assessment />} />
            <Route path="/assessment-history" element={<AssessmentHistory />} />
            <Route path="/dashboard" element={<Dashboard session={session} />} />
            <Route path="/book" element={<BookLanding />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/gift-success" element={<GiftSuccess />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund" element={<Refund />} />
          </Routes>
        </main>
        <PurchaseNotification />
      </div>
    </Router>
  );
}

export default App;
