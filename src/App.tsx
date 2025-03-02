
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation
} from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { PricingSection } from './components/results/PricingSection';
import { AdminDashboard } from './components/dashboard/admin/AdminDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results/:quizResultId" element={<Navigate to="/dashboard" />} />
        <Route path="/pricing/:quizResultId" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default App;
