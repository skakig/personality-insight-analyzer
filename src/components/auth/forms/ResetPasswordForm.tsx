
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { AuthInput } from "../AuthInput";
import { resetPassword } from "@/utils/auth";

interface ResetPasswordFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  onBackToSignIn: () => void;
}

export const ResetPasswordForm = ({ 
  email, 
  onEmailChange, 
  onBackToSignIn 
}: ResetPasswordFormProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string}>({});
  const [resetSent, setResetSent] = useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: "Email is required for password reset" });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    try {
      const { success, error } = await resetPassword(email);
      
      if (error) {
        throw error;
      }
      
      setResetSent(true);
      
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password Reset Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handlePasswordReset} className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Reset Password</h2>
        
        {resetSent ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Password reset instructions have been sent to {email}. 
              Please check your email to continue.
            </p>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onBackToSignIn}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 text-center">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            <AuthInput
              type="email"
              value={email}
              onChange={(value) => {
                onEmailChange(value);
                if (errors.email) setErrors({});
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
                onClick={onBackToSignIn}
              >
                Back to Sign In
              </Button>
            </div>
          </>
        )}
      </form>
    </Card>
  );
};
