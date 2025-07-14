import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './components/pages/LoginPage';
import AuthCallback from './components/pages/AuthCallback';
import ParametresPage from './components/pages/ParametresPage';
import TransactionsPage from './components/pages/TransactionsPage';
import BudgetPage from './components/pages/BudgetPage';
import EpargnesPage from './components/pages/EpargnesPage';
import CreditsPage from './components/pages/CreditsPage';
import PrevisionnelPage from './components/pages/PrevisionnelPage';
import MemoPage from './components/pages/MemoPage';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {isAuthenticated ? (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/parametres" replace />} />
            <Route path="parametres" element={<ParametresPage />} />
            <Route path="memo" element={<MemoPage />} />
            <Route path="previsionnel" element={<PrevisionnelPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="budget" element={<BudgetPage />} />
            <Route path="epargnes" element={<EpargnesPage />} />
            <Route path="credits" element={<CreditsPage />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;