
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const SiteHeader = () => {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg text-gray-900">
          The Moral Hierarchy
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-gray-700 hover:text-gray-900">
            Home
          </Link>
          <Link to="/book" className="text-gray-700 hover:text-gray-900">
            Book
          </Link>
          <Link to="/pricing" className="text-gray-700 hover:text-gray-900">
            Pricing
          </Link>
          <Button asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
