
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { useLocation } from "react-router-dom";

const Auth = () => {
  const location = useLocation();
  
  // Determine the mode based on the path
  let mode = "signin";
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
          <AuthForm onSuccess={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default Auth;
