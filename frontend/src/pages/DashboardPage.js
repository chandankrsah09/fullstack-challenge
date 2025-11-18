import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { UtensilsCrossed, ShoppingCart, Package, CreditCard, Users } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getFeatures = () => {
    const baseFeatures = [
      {
        title: 'Browse Restaurants',
        description: 'View restaurants and menu items',
        icon: UtensilsCrossed,
        action: () => navigate('/restaurants'),
        color: 'from-orange-500 to-red-500',
        available: true
      },
      {
        title: 'My Cart',
        description: 'View and manage your shopping cart',
        icon: ShoppingCart,
        action: () => navigate('/cart'),
        color: 'from-blue-500 to-cyan-500',
        available: true
      },
      {
        title: 'My Orders',
        description: 'View your order history',
        icon: Package,
        action: () => navigate('/orders'),
        color: 'from-green-500 to-emerald-500',
        available: true
      }
    ];

    if (user.role === 'ADMIN') {
      baseFeatures.push(
        {
          title: 'Payment Methods',
          description: 'Manage payment methods',
          icon: CreditCard,
          action: () => navigate('/payment-methods'),
          color: 'from-purple-500 to-pink-500',
          available: true
        },
        {
          title: 'All Users',
          description: 'View all users in the system',
          icon: Users,
          action: () => navigate('/users'),
          color: 'from-indigo-500 to-blue-500',
          available: true
        }
      );
    }

    return baseFeatures;
  };

  const getAccessInfo = () => {
    const access = [
      { feature: 'View Restaurants & Menu', allowed: true },
      { feature: 'Create Order', allowed: true },
      { feature: 'Place Order (Checkout)', allowed: user.role === 'ADMIN' || user.role === 'MANAGER' },
      { feature: 'Cancel Order', allowed: user.role === 'ADMIN' || user.role === 'MANAGER' },
      { feature: 'Update Payment Method', allowed: user.role === 'ADMIN' }
    ];
    return access;
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.full_name}!</h1>
        <p className="text-gray-500 mt-1">Here's what you can do today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Role</CardDescription>
            <CardTitle className="text-2xl">
              <Badge variant="default" className="text-base">{user.role}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Country</CardDescription>
            <CardTitle className="text-2xl">
              <Badge variant="secondary" className="text-base">{user.country}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Username</CardDescription>
            <CardTitle className="text-2xl text-gray-700">@{user.username}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFeatures().map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={feature.action}
                data-testid={`quick-action-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardHeader>
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Go to {feature.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Access Permissions</CardTitle>
          <CardDescription>Based on your role: {user.role}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getAccessInfo().map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{item.feature}</span>
                <Badge variant={item.allowed ? "default" : "destructive"}>
                  {item.allowed ? 'Allowed' : 'Restricted'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
