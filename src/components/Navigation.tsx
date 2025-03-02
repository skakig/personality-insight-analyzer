
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { session } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path ? "text-blue-600 font-medium" : "text-gray-700 hover:text-blue-600";
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="font-semibold text-lg">The Moral Hierarchy</Link>
          </div>
          
          {/* Desktop Menu - explicitly ensuring it's visible */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className={`${isActive("/")} transition`}>Home</Link>
            <Link to="/book" className={`${isActive("/book")} transition`}>Book</Link>
            <Link to="/pricing" className={`${isActive("/pricing")} transition`}>Pricing</Link>
            {session ? (
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="p-2">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t py-2">
          <div className="container mx-auto px-4 space-y-2">
            <Link 
              to="/" 
              className={`block py-2 ${isActive("/")}`}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/book" 
              className={`block py-2 ${isActive("/book")}`}
              onClick={() => setMenuOpen(false)}
            >
              Book
            </Link>
            <Link 
              to="/pricing" 
              className={`block py-2 ${isActive("/pricing")}`}
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </Link>
            {session ? (
              <Link 
                to="/dashboard"
                className="block py-2"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                to="/login"
                className="block py-2"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
