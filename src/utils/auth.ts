
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

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth?reset=true`,
  });

  if (error) {
    console.error('Reset password error:', error);
    throw error;
  }

  return { success: true };
};
