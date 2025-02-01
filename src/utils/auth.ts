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
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};