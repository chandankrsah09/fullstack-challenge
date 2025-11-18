import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RestaurantsPage } from './pages/RestaurantsPage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';
import { PaymentMethodsPage } from './pages/PaymentMethodsPage';
import { UsersPage } from './pages/UsersPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/restaurants"
              element={
                <ProtectedRoute>
                  <RestaurantsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/restaurants/:id"
              element={
                <ProtectedRoute>
                  <MenuPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/payment-methods"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <PaymentMethodsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to dashboard or login */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
