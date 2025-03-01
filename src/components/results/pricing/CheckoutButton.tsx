
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const CheckoutButton = ({ onClick, loading }: CheckoutButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Checkout button clicked, triggering onClick handler');
    onClick();
  };

  return (
    <Button
      className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transform transition duration-300 ease-in-out hover:scale-105 my-4"
      onClick={handleClick}
      disabled={loading}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        "Get Your Full Report Now"
      )}
    </Button>
  );
};
