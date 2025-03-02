
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./button";

export function Navbar() {
  const { session } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Book", href: "/book" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 text-xl font-bold">
            The Moral Hierarchy
          </Link>
        </div>
        
        {/* Navigation links - visible on all screen sizes */}
        <div className="flex gap-x-4 sm:gap-x-6 lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-semibold leading-6 ${
                location.pathname === item.href ? "text-primary" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        {/* Login/Dashboard button */}
        <div className="flex justify-end">
          {session ? (
            <Button asChild variant="outline">
              <Link to="/dashboard">
                Dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login">
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
