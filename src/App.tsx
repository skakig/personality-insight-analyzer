
import React from 'react';
import {
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { PricingSection } from './components/results/PricingSection';
import { AdminDashboard } from './components/dashboard/admin/AdminDashboard';
import { useAuth } from './hooks/useAuth';

const App = () => {
  const { session } = useAuth();
  
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard session={session} />} />
      <Route path="/results/:quizResultId" element={<Navigate to="/dashboard" />} />
      <Route path="/pricing/:quizResultId" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default App;
