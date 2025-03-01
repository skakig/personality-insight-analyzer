
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const CheckoutButton = ({ onClick, loading }: CheckoutButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
      disabled={loading}
    >
      {loading ? 'Processing...' : 'Get Your Full Report Now'}
    </Button>
  );
};
