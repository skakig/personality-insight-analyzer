
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { AuthInput } from "./AuthInput";
import { signIn, signUp } from "@/utils/auth";

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting authentication:', { 
        mode: isSignUp ? 'signup' : 'signin',
        email,
        timestamp: new Date().toISOString()
      });

      if (isSignUp) {
        await signUp({ email, password });
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
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please check your credentials and try again.",
        variant: "destructive",
      });
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
        />
        <AuthInput
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Password"
          minLength={6}
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
          onClick={() => setIsSignUp(!isSignUp)}
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
