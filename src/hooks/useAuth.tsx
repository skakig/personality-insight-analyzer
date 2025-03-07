
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { signIn, signUp } from "@/utils/auth";

export const useAuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password && !showResetForm) {
      newErrors.password = "Password is required";
    } else if (password.length < 6 && !showResetForm) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});

    try {
      console.log('Attempting authentication:', { 
        mode: isSignUp ? 'signup' : 'signin',
        email,
        timestamp: new Date().toISOString()
      });

      if (isSignUp) {
        await signUp({ email, password });
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { data, error } = await signIn({ email, password });
        if (error) throw error;
        if (data?.session) {
          // Check if there's a pending purchase
          const purchaseId = localStorage.getItem('purchaseResultId');
          if (purchaseId) {
            navigate(`/assessment/${purchaseId}`);
          } else {
            navigate("/dashboard");
          }
        }
      }
    } catch (error: any) {
      console.error('Authentication error details:', {
        message: error.message,
        timestamp: new Date().toISOString(),
      });
      
      let errorMessage = "Authentication failed. Please try again.";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
        setErrors({ password: "Invalid email or password combination" });
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email before signing in.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    isSignUp,
    showResetForm,
    errors,
    setShowResetForm,
    setIsSignUp,
    handleAuth,
    setErrors
  };
};
