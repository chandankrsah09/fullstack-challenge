import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI } from '../api/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

export const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canCheckout = hasRole(['ADMIN', 'MANAGER']);

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        payment_method_id: null
      };

      const response = await orderAPI.create(orderData);
      clearCart();
      navigate(`/orders`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-cart">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
        <Button onClick={() => navigate('/restaurants')} data-testid="browse-restaurants-button">
          Browse Restaurants
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="cart-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-500 mt-1">{cartItems.length} items in your cart</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md" data-testid="error-message">
          {error}
        </div>
      )}

      {!canCheckout && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md" data-testid="checkout-restriction-message">
          ⚠️ Note: Only Admin and Managers can place orders. As a Member, you can add items to cart but cannot checkout.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} data-testid={`cart-item-${item.id}`}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.restaurantName}</p>
                        <Badge variant="outline" className="mt-1">{item.category}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        data-testid={`remove-item-button-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          data-testid={`decrease-quantity-${item.id}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium" data-testid={`quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid={`increase-quantity-${item.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {item.restaurantCountry === 'INDIA' ? '₹' : '$'}
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.restaurantCountry === 'INDIA' ? '₹' : '$'}{item.price} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium" data-testid="cart-total">
                    {cartItems[0]?.restaurantCountry === 'INDIA' ? '₹' : '$'}
                    {getTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {cartItems[0]?.restaurantCountry === 'INDIA' ? '₹' : '$'}
                    {getTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCreateOrder}
                disabled={loading || !canCheckout}
                className="w-full"
                data-testid="create-order-button"
              >
                {loading ? 'Creating Order...' : 'Create Order'}
              </Button>

              {!canCheckout && (
                <p className="text-xs text-center text-gray-500">
                  You need Admin or Manager role to place orders
                </p>
              )}

              <Button
                onClick={() => navigate('/restaurants')}
                variant="outline"
                className="w-full"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
