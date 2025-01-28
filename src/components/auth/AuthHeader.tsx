import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AuthHeader = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};