import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Common
import ScrollToTop from './components/common/ScrollToTop';

// Public Pages
import HomePage from './pages/public/HomePage';
import IncisioniPage from './pages/public/IncisioniPage';
import TortePage from './pages/public/TortePage';
import EventiPage from './pages/public/EventiPage';
import ChiSiamoPage from './pages/public/ChiSiamoPage';
import ComeFunzionaPage from './pages/public/ComeFunzionaPage';
import PortfolioDetailPage from './pages/public/PortfolioDetailPage';
import GalleryPage from './pages/public/GalleryPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsOfServicePage from './pages/public/TermsOfServicePage';
import VerifyEmailPage from './pages/public/VerifyEmailPage';

// Auth Pages
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import MyRequestsPage from './pages/user/MyRequestsPage';
import RequestDetailPage from './pages/user/RequestDetailPage';
import ProfilePage from './pages/user/ProfilePage';
import CreateRequestPage from './pages/user/CreateRequestPage';
import CreateReviewPage from './pages/user/CreateReviewPage'; // ✅ NUOVO

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminRequestDetailPage from './pages/admin/RequestDetailPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage'; // ✅ NUOVO

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-wood-dark">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-leaf-green mx-auto mb-4"></div>
      <p className="text-bark-light">Caricamento...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.ruolo !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* ============================================
          PUBLIC ROUTES
          ============================================ */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="incisioni" element={<IncisioniPage />} />
        <Route path="torte" element={<TortePage />} />
        <Route path="eventi" element={<EventiPage />} />
        <Route path="chi-siamo" element={<ChiSiamoPage />} />
        <Route path="come-funziona" element={<ComeFunzionaPage />} />
        <Route path="galleria" element={<GalleryPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="termini-servizio" element={<TermsOfServicePage />} />
        <Route path="portfolio/:id" element={<PortfolioDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email/:token" element={<VerifyEmailPage />} />
        
        {/* Richiesta pubblica (guest o logged) */}
        <Route path="richiesta" element={<CreateRequestPage />} />
      </Route>

      {/* ============================================
          USER ROUTES (Protected)
          ============================================ */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="requests" element={<MyRequestsPage />} />
        <Route path="requests/:id" element={<RequestDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
        
        {/* ✅ NUOVE ROUTES RECENSIONI */}
        <Route path="reviews/create" element={<CreateReviewPage />} />
      </Route>

      {/* ============================================
          ADMIN ROUTES (Protected - Admin Only)
          ============================================ */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        
        {/* Richieste */}
        <Route path="requests" element={<AdminRequestsPage />} />
        <Route path="requests/:id" element={<AdminRequestDetailPage />} />
        
        {/* Utenti */}
        <Route path="users" element={<AdminUsersPage />} />
        
        {/* ✅ NUOVE ROUTES RECENSIONI ADMIN */}
        <Route path="reviews" element={<AdminReviewsPage />} />
      </Route>

      {/* ============================================
          404 - Not Found
          ============================================ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '354246551290-48i5raeb05pt59d08u8rfdd3spm51ek9.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="App">
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#2C1810',
                  color: '#D4A574',
                  border: '1px solid #8B4513',
                },
                success: {
                  iconTheme: {
                    primary: '#6B8E23',
                    secondary: '#D4A574',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#DC2626',
                    secondary: '#D4A574',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;