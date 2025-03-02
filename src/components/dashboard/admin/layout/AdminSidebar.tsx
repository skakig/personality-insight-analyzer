
import { Link, useLocation } from "react-router-dom";
import { 
  Gift, Users, BarChart, CreditCard, 
  Settings, Database, UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Coupon Management",
    href: "/dashboard/admin/coupons",
    icon: Gift
  },
  {
    title: "Affiliate Program",
    href: "/dashboard/admin/affiliates",
    icon: UserPlus
  },
  {
    title: "Analytics",
    href: "/dashboard/admin/analytics",
    icon: BarChart
  },
  {
    title: "User Management",
    href: "/dashboard/admin/users",
    icon: Users
  },
  {
    title: "Assessments",
    href: "/dashboard/admin/assessments",
    icon: Database
  },
  {
    title: "Payments",
    href: "/dashboard/admin/payments",
    icon: CreditCard
  },
  {
    title: "System",
    href: "/dashboard/admin/system",
    icon: Settings
  }
];

export const AdminSidebar = () => {
  const location = useLocation();
  
  return (
    <div className="w-64 min-h-screen border-r bg-white">
      <div className="p-4 border-b">
        <h2 className="font-bold text-xl">Admin Dashboard</h2>
      </div>
      
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
