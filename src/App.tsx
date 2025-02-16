
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SiteHeader } from "@/components/layout/SiteHeader";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Refund from "@/pages/Refund";
import Dashboard from "@/pages/Dashboard";
import { createClient } from '@supabase/supabase-js';
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { CookieConsent } from "./components/CookieConsent";
import { Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

const App = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Router>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<Index session={session} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard session={session} />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
      <CookieConsent />
    </>
  );
};

function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = supabase.auth.getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-4">
          Login / Sign Up
        </h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google", "github"]}
          redirectTo={`${window.location.origin}/dashboard`}
        />
      </div>
    </div>
  );
}

export default App;
