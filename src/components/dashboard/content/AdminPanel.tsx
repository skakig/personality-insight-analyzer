
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AdminPanelProps {
  isAdmin: boolean;
}

export const AdminPanel = ({ isAdmin }: AdminPanelProps) => {
  const navigate = useNavigate();
  
  if (!isAdmin) return null;
  
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-medium mb-4">Admin Tools</h3>
      <p className="text-sm text-gray-600 mb-4">
        Access administrative tools and settings.
      </p>
      <Button
        onClick={() => navigate('/admin')}
        className="w-full"
        variant="outline"
      >
        Go to Admin Panel
      </Button>
    </div>
  );
};
