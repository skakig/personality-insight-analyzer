import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Account from './Account'
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import AuthWrapper from './AuthWrapper';
import { PricingSection } from './components/results/PricingSection';
import { AdminDashboard } from './components/dashboard/admin/AdminDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthWrapper />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
       <Route
          path="/results/:quizResultId"
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing/:quizResultId"
          element={
            <ProtectedRoute>
              <PricingSection />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
        <Route path="/" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

export default App;
