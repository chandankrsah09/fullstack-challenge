import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { UtensilsCrossed, LogOut, ShoppingCart, Home, Package, CreditCard, Users } from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/restaurants', label: 'Restaurants', icon: UtensilsCrossed },
    { path: '/cart', label: 'Cart', icon: ShoppingCart, badge: getItemCount() },
    { path: '/orders', label: 'Orders', icon: Package },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push(
      { path: '/payment-methods', label: 'Payments', icon: CreditCard },
      { path: '/users', label: 'Users', icon: Users }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50" data-testid="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <UtensilsCrossed className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Slooze</span>
              </div>
              
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? 'default' : 'ghost'}
                      onClick={() => navigate(item.path)}
                      className="relative"
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                      {item.badge > 0 && (
                        <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.role} • {user?.country}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} data-testid="logout-button">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 Slooze Food Ordering. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
