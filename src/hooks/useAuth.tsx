
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get session from local storage initially
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data.session) {
          console.log('[INFO] Auth state changed:', {
            event: "INITIAL_SESSION",
            userEmail: data.session?.user?.email,
            timestamp: new Date().toISOString()
          });
          
          setSession(data.session);
        }
      } catch (error) {
        console.error('[ERROR] Error getting auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('[INFO] Auth state changed:', {
        event,
        userEmail: newSession?.user?.email,
        timestamp: new Date().toISOString()
      });
      
      setSession(newSession);
      setLoading(false);
      
      // Store user ID in localStorage for purchase tracking if logged in
      if (newSession?.user) {
        localStorage.setItem('checkoutUserId', newSession.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
