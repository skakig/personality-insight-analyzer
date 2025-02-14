
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { AuthInput } from "./AuthInput";
import { signIn, signUp, resetPassword } from "@/utils/auth";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: "Email is required for password reset" });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });
      setShowResetForm(false);
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          navigate("/dashboard");
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

  if (showResetForm) {
    return (
      <Card className="p-6">
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Reset Password</h2>
          <p className="text-sm text-gray-600 text-center">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
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
          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Instructions"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setShowResetForm(false)}
            >
              Back to Sign In
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form className="space-y-6" onSubmit={handleAuth}>
        <div className="space-y-4">
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

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>

          <div className="flex justify-between text-sm">
            <Button
              type="button"
              variant="link"
              className="text-sm px-0"
              onClick={() => setShowResetForm(true)}
            >
              Forgot password?
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm px-0"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
