import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Pricing from "@/pages/Pricing";
import BookLanding from "@/pages/BookLanding";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Navigation session={session} />
      <Routes>
        <Route path="/" element={<Index session={session} />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard session={session} />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/book" element={<BookLanding />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;