
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface AuthCredentials {
  email: string;
  password: string;
}

export const signUp = async ({ email, password }: AuthCredentials) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth`
    }
  });
  
  if (error) {
    console.error('Signup error:', error);
    throw error;
  }
  
  toast({
    title: "Success!",
    description: "Please check your email to verify your account.",
  });
};

export const signIn = async ({ email, password }: AuthCredentials) => {
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (response.error) {
    console.error('Signin error:', response.error);
    throw response.error;
  }

  return response;
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Signout error:', error);
      throw error;
    }
    // Clear any local session data
    localStorage.removeItem('supabase.auth.token');
    
    // Force reload to ensure clean state
    window.location.href = '/';
  } catch (error: any) {
    console.error('Error during sign out:', error);
    // If we get a 403/session not found, we're already logged out
    if (error?.status === 403 && error?.message?.includes('session_not_found')) {
      window.location.href = '/';
      return;
    }
    throw error;
  }
};
