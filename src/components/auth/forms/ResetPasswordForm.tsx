import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AuthInput } from "../AuthInput";
import { AlertCircle } from "lucide-react";

interface ResetPasswordFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  onBackToSignIn: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  errors: {email?: string};
  setErrors: (errors: {email?: string}) => void;
}

export const ResetPasswordForm = ({ 
  email, 
  onEmailChange, 
  onBackToSignIn,
  onSubmit,
  loading,
  errors,
  setErrors
}: ResetPasswordFormProps) => {
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: "Email is required for password reset" });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    await onSubmit(e);
    setResetSent(true);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
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
            {errors.email && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <p>{errors.email}</p>
              </div>
            )}
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
