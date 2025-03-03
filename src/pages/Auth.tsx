
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);
  
  // Determine the mode based on the path
  let mode: "signin" | "signup" | "reset" = "signin";
  if (location.pathname === "/signup") {
    mode = "signup";
  } else if (location.pathname === "/forgot-password") {
    mode = "reset";
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <AuthHeader />
          <AuthForm mode={mode} onSuccess={() => navigate("/dashboard")} />
        </div>
      </div>
    </div>
  );
};

export default Auth;
