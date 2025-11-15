import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password
      });

      const { user, organization, token } = response.data;
      login(user, organization, token);
      toast.success(`Welcome back, ${user.name}!`);
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        toast.error('Invalid email or password');
      } else if (error.response?.status === 403) {
        toast.error('Your account is inactive');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillSuperAdmin = () => {
    setEmail('admin@gmail.com');
    setPassword('12345');
  };

  return (
    <div className="login-container" data-testid="login-page">
      <div className="login-content">
        <div className="login-header">
          <h1 className="login-title">TaskFlow</h1>
          <p className="login-subtitle">Multi-Tenant Project Management</p>
        </div>

        <Card className="login-card">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  data-testid="login-email"
                />
              </div>

              <div className="form-group">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  data-testid="login-password"
                />
              </div>

              <Button
                type="submit"
                className="login-button"
                disabled={isLoading}
                data-testid="login-submit"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="demo-button"
                onClick={fillSuperAdmin}
                data-testid="fill-super-admin"
              >
                Fill Super Admin Credentials
              </Button>
            </form>

            <div className="login-info">
              <p className="text-sm text-gray-600">
                <strong>Super Admin:</strong> admin@gmail.com / 12345
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
