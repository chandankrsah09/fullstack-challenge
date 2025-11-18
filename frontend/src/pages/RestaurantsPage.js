import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantAPI } from '../api/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { MapPin, Star, ChefHat } from 'lucide-react';

export const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      setRestaurants(response.data);
    } catch (err) {
      setError('Failed to load restaurants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
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
    <div className="space-y-6" data-testid="restaurants-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
        <p className="text-gray-500 mt-1">Browse and order from our partner restaurants</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Card 
            key={restaurant.id} 
            className="hover:shadow-xl transition-all cursor-pointer overflow-hidden"
            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            data-testid={`restaurant-card-${restaurant.id}`}
          >
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
              <img
                src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                alt={restaurant.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{restaurant.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3" />
                    {restaurant.location}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ChefHat className="h-3 w-3" />
                  {restaurant.cuisine_type}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {restaurant.rating}
                </Badge>
                <Badge variant="default">{restaurant.country}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" data-testid={`view-menu-button-${restaurant.id}`}>
                View Menu
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No restaurants available in your region</p>
        </div>
      )}
    </div>
  );
};
