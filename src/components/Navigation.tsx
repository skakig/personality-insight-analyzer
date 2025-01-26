import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const Navigation = ({ session }: { session?: any }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <h1 
          onClick={() => navigate("/")} 
          className="text-xl font-semibold text-gray-900 cursor-pointer hover:opacity-80 transition-opacity"
        >
          The Moral Hierarchy
        </h1>
        <NavigationMenu>
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
              >
                Home
              </Button>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/pricing")}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
              >
                Pricing
              </Button>
            </NavigationMenuItem>
            
            {session ? (
              <>
                <NavigationMenuItem>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/dashboard")}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
                  >
                    Dashboard
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
                  >
                    Sign Out
                  </Button>
                </NavigationMenuItem>
              </>
            ) : (
              <NavigationMenuItem>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/auth")}
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
                >
                  Sign In
                </Button>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};