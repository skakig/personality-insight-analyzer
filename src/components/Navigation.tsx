import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 
          onClick={() => navigate("/")} 
          className="text-xl font-bold text-primary cursor-pointer"
        >
          The Moral Hierarchy
        </h1>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
              >
                Home
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};