
import { AuthFormProps } from "@/types/auth";
import { ResetPasswordForm } from "./forms/ResetPasswordForm";
import { SignInUpForm } from "./forms/SignInUpForm";
import { useAuthForm } from "./hooks/useAuthForm";
import { useEffect } from "react";

export const AuthForm = ({ mode = "signin", onSuccess }: AuthFormProps) => {
  const {
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
    handleResetPassword,
    setErrors
  } = useAuthForm();

  // Set the initial mode based on prop
  useEffect(() => {
    if (mode === "signup") {
      setIsSignUp(true);
      setShowResetForm(false);
    } else if (mode === "reset") {
      setShowResetForm(true);
      setIsSignUp(false);
    } else {
      setIsSignUp(false);
      setShowResetForm(false);
    }
  }, [mode, setIsSignUp, setShowResetForm]);

  if (showResetForm) {
    return (
      <ResetPasswordForm
        email={email}
        onEmailChange={setEmail}
        onBackToSignIn={() => setShowResetForm(false)}
        onSubmit={handleResetPassword}
        loading={loading}
        errors={errors}
        setErrors={setErrors}
      />
    );
  }

  return (
    <SignInUpForm
      email={email}
      password={password}
      loading={loading}
      isSignUp={isSignUp}
      errors={errors}
      onEmailChange={(value) => {
        setEmail(value);
        if (errors.email) setErrors({...errors, email: undefined});
      }}
      onPasswordChange={(value) => {
        setPassword(value);
        if (errors.password) setErrors({...errors, password: undefined});
      }}
      onSubmit={handleAuth}
      onShowResetForm={() => setShowResetForm(true)}
      onToggleSignUp={() => {
        setIsSignUp(!isSignUp);
        setErrors({});
      }}
    />
  );
};
