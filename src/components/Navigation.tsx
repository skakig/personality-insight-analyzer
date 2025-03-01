
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

export const Navigation = ({ session }: { session?: any }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      console.log('Attempting to sign out...');
      
      // First check if we have a valid session before attempting to sign out
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Signout error:', error);
          toast({
            title: "Sign out failed",
            description: "There was an issue signing you out. Please try again.",
            variant: "destructive",
          });
        } else {
          console.log('Sign out successful');
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        }
      } else {
        console.log('No active session found, redirecting without signout');
        // Clear any local session data
        localStorage.removeItem('supabase.auth.token');
      }
      
      // Always navigate home regardless of sign out success/failure
      navigate("/");
    } catch (error) {
      console.error('Signout error:', error);
      toast({
        title: "Sign out failed",
        description: "There was an issue signing you out. Please try again.",
        variant: "destructive",
      });
      // Even if there's an error, navigate home as the session might be invalid
      navigate("/");
    }
  };

  // Check if we have both a session and a valid user
  const isAuthenticated = Boolean(session?.user?.id);

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
            
            {isAuthenticated ? (
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
