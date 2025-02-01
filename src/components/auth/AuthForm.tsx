import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { AuthInput } from "./AuthInput";
import { signIn, signUp } from "@/utils/auth";
import { AuthFormProps } from "@/types/auth";

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
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
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        await signUp({ email, password });
        toast({
          title: "Success",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { data, error } = await signIn({ email, password });
        if (error) throw error;
        if (data.session) {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
      
      if (error.message?.toLowerCase().includes("email")) {
        setErrors(prev => ({ ...prev, email: error.message }));
      } else if (error.message?.toLowerCase().includes("password")) {
        setErrors(prev => ({ ...prev, password: error.message }));
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
          onChange={setEmail}
          placeholder="Email address"
          error={errors.email}
        />
        <AuthInput
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Password"
          minLength={6}
          error={errors.password}
        />
      </div>

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