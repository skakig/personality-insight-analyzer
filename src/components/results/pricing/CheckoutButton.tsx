
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

interface CheckoutButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const CheckoutButton = ({ onClick, loading }: CheckoutButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-5 w-5" />
          Get Your Full Report Now
        </>
      )}
    </Button>
  );
}
