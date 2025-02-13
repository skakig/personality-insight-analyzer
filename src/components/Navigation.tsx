
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";

export const Navigation = ({ session }: { session?: any }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // If we get a session not found error, we're already logged out
      if (error?.message?.includes('session_not_found')) {
        navigate('/');
        return;
      }
      
      if (error) {
        console.error('Signout error:', error);
        toast({
          title: "Error signing out",
          description: "Please try again",
          variant: "destructive",
        });
        return;
      }

      navigate('/');
    } catch (error) {
      console.error('Signout error:', error);
      // Force navigation to home page if there's any error
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <h1 
          onClick={() => navigate("/")} 
          className={`font-semibold text-gray-900 cursor-pointer hover:opacity-80 transition-opacity ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}
        >
          {isMobile ? "TMH" : "The Moral Hierarchy"}
        </h1>
        <NavigationMenu>
          <NavigationMenuList className="gap-1 md:gap-2">
            <NavigationMenuItem>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="px-2 md:px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
              >
                Home
              </Button>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/book")}
                className="px-2 md:px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
              >
                Book
              </Button>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/pricing")}
                className="px-2 md:px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
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
                    className="px-2 md:px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
                  >
                    {isMobile ? "Dash" : "Dashboard"}
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="px-2 md:px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
                  >
                    {isMobile ? "Exit" : "Sign Out"}
                  </Button>
                </NavigationMenuItem>
              </>
            ) : (
              <NavigationMenuItem>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/auth")}
                  className="px-2 md:px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
                >
                  {isMobile ? "Sign In" : "Sign In"}
                </Button>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};
