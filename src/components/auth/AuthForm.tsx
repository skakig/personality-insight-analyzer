
import { AuthFormProps } from "@/types/auth";
import { ResetPasswordForm } from "./forms/ResetPasswordForm";
import { SignInUpForm } from "./forms/SignInUpForm";
import { useAuthForm } from "./hooks/useAuthForm";

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
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
    setErrors
  } = useAuthForm();

  if (showResetForm) {
    return (
      <ResetPasswordForm
        email={email}
        onEmailChange={setEmail}
        onBackToSignIn={() => setShowResetForm(false)}
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
