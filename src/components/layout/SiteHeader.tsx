
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const SiteHeader = () => {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg text-primary">
          The Moral Hierarchy
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="link" asChild>
            <Link to="/about">About</Link>
          </Button>
          <Button variant="link" asChild>
            <Link to="/faq">FAQ</Link>
          </Button>
          <Button variant="link" asChild>
            <Link to="/contact">Contact</Link>
          </Button>
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
