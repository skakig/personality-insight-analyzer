
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

const SetupAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast({
          title: "Invalid Setup Link",
          description: "Please use the link provided in your welcome email.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('temp_access_tokens')
          .select('*')
          .eq('token', token)
          .single();

        if (error || !data || data.used || new Date(data.expires_at) < new Date()) {
          toast({
            title: "Invalid or Expired Link",
            description: "Please request a new setup link from support.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error('Error validating token:', error);
        navigate("/");
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleSetupAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get user email from temp token
      const { data: tokenData, error: tokenError } = await supabase
        .from('temp_access_tokens')
        .select('email')
        .eq('token', token)
        .single();

      if (tokenError || !tokenData) {
        throw new Error('Invalid setup token');
      }

      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Mark token as used
      await supabase
        .from('temp_access_tokens')
        .update({ used: true })
        .eq('token', token);

      toast({
        title: "Account Secured!",
        description: "Your account has been successfully set up.",
      });

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Error setting up account:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to set up account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Secure Your Account</h1>
          <p className="text-gray-500">
            Create a password to secure your account and access your subscription.
          </p>
        </div>

        <form onSubmit={handleSetupAccount} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              New Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Setting Up..." : "Secure Account"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SetupAccount;
