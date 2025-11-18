import React, { useState, useEffect } from 'react';
import { orderAPI } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Package, CheckCircle, XCircle, Clock } from 'lucide-react';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const { hasRole } = useAuth();

  const canManageOrders = hasRole(['ADMIN', 'MANAGER']);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (orderId) => {
    setActionLoading({ ...actionLoading, [orderId]: 'checkout' });
    try {
      await orderAPI.checkout(orderId);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to checkout order');
    } finally {
      setActionLoading({ ...actionLoading, [orderId]: null });
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    setActionLoading({ ...actionLoading, [orderId]: 'cancel' });
    try {
      await orderAPI.cancel(orderId);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel order');
    } finally {
      setActionLoading({ ...actionLoading, [orderId]: null });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      COMPLETED: 'default',
      CANCELLED: 'destructive',
      PENDING: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="orders-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">View and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-orders">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500">Start ordering from your favorite restaurants!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} data-testid={`order-${order.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <CardTitle className="text-xl">Order #{order.id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        {new Date(order.order_date).toLocaleString()} • {order.user_name}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(order.status)}
                    <Badge variant="outline">{order.country}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.menu_item_name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            {order.country === 'INDIA' ? '₹' : '$'}
                            {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-lg font-bold">Total Amount</span>
                    <span className="text-xl font-bold" data-testid={`order-total-${order.id}`}>
                      {order.country === 'INDIA' ? '₹' : '$'}
                      {order.total_amount.toFixed(2)}
                    </span>
                  </div>

                  {canManageOrders && order.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleCheckout(order.id)}
                        disabled={actionLoading[order.id] === 'checkout'}
                        className="flex-1"
                        data-testid={`checkout-button-${order.id}`}
                      >
                        {actionLoading[order.id] === 'checkout' ? 'Processing...' : 'Checkout & Pay'}
                      </Button>
                      <Button
                        onClick={() => handleCancel(order.id)}
                        disabled={actionLoading[order.id] === 'cancel'}
                        variant="destructive"
                        className="flex-1"
                        data-testid={`cancel-button-${order.id}`}
                      >
                        {actionLoading[order.id] === 'cancel' ? 'Cancelling...' : 'Cancel Order'}
                      </Button>
                    </div>
                  )}

                  {!canManageOrders && order.status === 'PENDING' && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-md text-sm">
                      ⚠️ Only Admin or Manager can checkout orders
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
