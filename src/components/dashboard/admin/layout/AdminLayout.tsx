
import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export const AdminLayout = ({ children, title = "Admin Dashboard" }: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
};
