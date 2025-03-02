
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layout/AdminLayout';
import { CouponManagement } from './sections/CouponManagement';
import { supabase } from '@/integrations/supabase/client';

export const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={
        <AdminLayout title="Admin Dashboard">
          <div className="grid gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Welcome to the Admin Dashboard</h2>
              <p className="text-muted-foreground">
                Use the sidebar navigation to manage your site. Select a section to get started.
              </p>
            </div>
          </div>
        </AdminLayout>
      } />
      
      <Route path="/coupons" element={
        <AdminLayout title="Coupon Management">
          <CouponManagement />
        </AdminLayout>
      } />
      
      <Route path="/affiliates" element={
        <AdminLayout title="Affiliate Program">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Affiliate Program</h2>
            <p className="text-muted-foreground">This section is under development.</p>
          </div>
        </AdminLayout>
      } />
      
      <Route path="/analytics" element={
        <AdminLayout title="Analytics">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-muted-foreground">This section is under development.</p>
          </div>
        </AdminLayout>
      } />
      
      <Route path="/users" element={
        <AdminLayout title="User Management">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-muted-foreground">This section is under development.</p>
          </div>
        </AdminLayout>
      } />
      
      <Route path="/assessments" element={
        <AdminLayout title="Assessments">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Assessments</h2>
            <p className="text-muted-foreground">This section is under development.</p>
          </div>
        </AdminLayout>
      } />
      
      <Route path="/payments" element={
        <AdminLayout title="Payments">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Payments</h2>
            <p className="text-muted-foreground">This section is under development.</p>
          </div>
        </AdminLayout>
      } />
      
      <Route path="/system" element={
        <AdminLayout title="System Settings">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            <p className="text-muted-foreground">This section is under development.</p>
          </div>
        </AdminLayout>
      } />
    </Routes>
  );
};
