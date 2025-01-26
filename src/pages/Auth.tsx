import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/AuthForm";
import { Navigation } from "@/components/Navigation";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Button variant="link" onClick={() => navigate("/")} className="font-medium">
                continue as guest
              </Button>
            </p>
          </div>
          <AuthForm onSuccess={() => navigate("/")} />
        </div>
      </div>
    </div>
  );
};

export default Auth;