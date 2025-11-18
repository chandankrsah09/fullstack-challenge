import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI } from '../api/api';
import { useCart } from '../contexts/CartContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Plus, ShoppingCart } from 'lucide-react';

export const MenuPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedItems, setAddedItems] = useState(new Set());

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, [id]);

  const fetchRestaurantAndMenu = async () => {
    try {
      const [restaurantRes, menuRes] = await Promise.all([
        restaurantAPI.getById(id),
        restaurantAPI.getMenu(id)
      ]);
      setRestaurant(restaurantRes.data);
      setMenuItems(menuRes.data);
    } catch (err) {
      setError('Failed to load menu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item, restaurant);
    setAddedItems(new Set([...addedItems, item.id]));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 2000);
  };

  const groupByCategory = (items) => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate('/restaurants')} className="mt-4">
          Back to Restaurants
        </Button>
      </div>
    );
  }

  const groupedMenu = groupByCategory(menuItems);

  return (
    <div className="space-y-6" data-testid="menu-page">
      <Button
        variant="ghost"
        onClick={() => navigate('/restaurants')}
        className="flex items-center gap-2"
        data-testid="back-button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Restaurants
      </Button>

      {restaurant && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{restaurant.name}</CardTitle>
                <CardDescription className="text-base">{restaurant.location}</CardDescription>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary">{restaurant.cuisine_type}</Badge>
                  <Badge variant="default">{restaurant.country}</Badge>
                  <Badge variant="outline">⭐ {restaurant.rating}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {Object.keys(groupedMenu).map((category) => (
        <div key={category}>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedMenu[category].map((item) => (
              <Card key={item.id} data-testid={`menu-item-${item.id}`}>
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge variant="default" className="ml-2">
                      {restaurant.country === 'INDIA' ? '₹' : '$'}{item.price}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="w-full"
                    variant={addedItems.has(item.id) ? "secondary" : "default"}
                    disabled={!item.is_available}
                    data-testid={`add-to-cart-button-${item.id}`}
                  >
                    {addedItems.has(item.id) ? (
                      <span className="flex items-center gap-2">
                        ✓ Added to Cart
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add to Cart
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {menuItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No menu items available</p>
        </div>
      )}

      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          onClick={() => navigate('/cart')}
          className="rounded-full shadow-lg"
          data-testid="view-cart-button"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          View Cart
        </Button>
      </div>
    </div>
  );
};
