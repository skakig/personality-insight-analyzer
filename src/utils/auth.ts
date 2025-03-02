
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface AuthCredentials {
  email: string;
  password: string;
}

const getRedirectURL = () => {
  // Check if we're in development or production
  const isDevelopment = window.location.hostname === 'localhost';
  const baseURL = isDevelopment 
    ? 'http://localhost:8080'
    : 'https://themoralhierarchy.com';
    
  return `${baseURL}/auth`;
};

export const signUp = async ({ email, password }: AuthCredentials) => {
  console.log('Signup attempt:', { 
    email,
    timestamp: new Date().toISOString(),
    redirectTo: getRedirectURL()
  });

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getRedirectURL()
    }
  });
  
  if (error) {
    console.error('Signup error:', {
      message: error.message,
      status: error.status,
      stack: error.stack
    });
    throw error;
  }
  
  toast({
    title: "Success!",
    description: "Please check your email to verify your account.",
  });
};

export const signIn = async ({ email, password }: AuthCredentials) => {
  console.log('Signin attempt:', { 
    email,
    timestamp: new Date().toISOString()
  });

  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (response.error) {
    console.error('Signin error:', {
      message: response.error.message,
      status: response.error.status,
      stack: response.error.stack
    });
    throw response.error;
  }

  return response;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getRedirectURL(),
  });

  if (error) {
    console.error('Reset password error:', error);
    return { success: false, error };
  }

  return { success: true, error: null };
};
