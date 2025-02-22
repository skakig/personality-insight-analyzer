
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AuthInput } from "../AuthInput";
import { AlertCircle } from "lucide-react";

interface SignInUpFormProps {
  email: string;
  password: string;
  loading: boolean;
  isSignUp: boolean;
  errors: {email?: string; password?: string};
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onShowResetForm: () => void;
  onToggleSignUp: () => void;
}

export const SignInUpForm = ({
  email,
  password,
  loading,
  isSignUp,
  errors,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onShowResetForm,
  onToggleSignUp
}: SignInUpFormProps) => {
  return (
    <Card className="p-6">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          <AuthInput
            type="email"
            value={email}
            onChange={onEmailChange}
            placeholder="Email address"
            error={errors.email}
          />
          <AuthInput
            type="password"
            value={password}
            onChange={onPasswordChange}
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
              onClick={onShowResetForm}
            >
              Forgot password?
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm px-0"
              onClick={onToggleSignUp}
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
