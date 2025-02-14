
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { AuthInput } from "./AuthInput";
import { signIn, signUp } from "@/utils/auth";
import { AlertCircle } from "lucide-react";

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
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
        console.log('Sign in response:', { 
          success: !!data?.session,
          error: error?.message,
          timestamp: new Date().toISOString()
        });
        
        if (error) throw error;
        if (data?.session) {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error('Authentication error details:', {
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
        stack: error.stack
      });
      
      // Handle specific error cases
      if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Email not verified",
          description: "Please check your email and verify your account before signing in.",
          variant: "destructive",
        });
      } else if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Authentication failed. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleAuth}>
      <div className="rounded-md shadow-sm space-y-4">
        <AuthInput
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            if (errors.email) setErrors({...errors, email: undefined});
          }}
          placeholder="Email address"
          error={errors.email}
        />
        <AuthInput
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            if (errors.password) setErrors({...errors, password: undefined});
          }}
          placeholder="Password"
          minLength={6}
          error={errors.password}
        />
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>Please fix the errors above</p>
        </div>
      )}

      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </Button>
      </div>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrors({});
          }}
          className="text-sm"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </Button>
      </div>
    </form>
  );
};
