import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { UtensilsCrossed } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const demoCredentials = [
    { username: 'nickfury', password: 'admin123', role: 'Admin', country: 'America' },
    { username: 'captainmarvel', password: 'manager123', role: 'Manager', country: 'India' },
    { username: 'captainamerica', password: 'manager123', role: 'Manager', country: 'America' },
    { username: 'thanos', password: 'member123', role: 'Member', country: 'India' },
    { username: 'thor', password: 'member123', role: 'Member', country: 'India' },
    { username: 'travis', password: 'member123', role: 'Member', country: 'America' },
  ];

  const quickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
        <Card className="w-full" data-testid="login-card">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <UtensilsCrossed className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Slooze Food Ordering</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm" data-testid="error-message">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  data-testid="username-input"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="password-input"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading} data-testid="login-button">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">Demo Accounts</CardTitle>
            <CardDescription>
              Click to auto-fill credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  onClick={() => quickLogin(cred)}
                  className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid={`demo-account-${cred.username}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{cred.username}</p>
                      <p className="text-sm text-gray-500">{cred.role} - {cred.country}</p>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {cred.password}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
