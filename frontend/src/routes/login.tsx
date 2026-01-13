import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Heart, User } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'caregiver' | 'recipient' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }

    const success = login(username, password);
    if (success) {
      toast.success('Login successful!');
      navigate({ to: '/' });
    } else {
      toast.error('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl mb-2">Welcome to CareConnect</h1>
          <p className="text-gray-600">Choose your role to continue</p>
        </div>

        {!selectedRole ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Caregiver Login */}
              <Card 
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-blue-400"
                onClick={() => setSelectedRole('caregiver')}
              >
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Caregiver</CardTitle>
                  <CardDescription>
                    Access full dashboard to manage recipients, tasks, and monitor journal entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      View all recipient profiles
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      Manage tasks and calendar
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      Read and comment on journals
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Recipient Login */}
              <Card 
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-purple-400"
                onClick={() => setSelectedRole('recipient')}
              >
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
                    <Heart className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">Recipient</CardTitle>
                  <CardDescription>
                    Simplified interface to write journal entries and express your feelings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                      Write daily journal entries
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                      Log your mood easily
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                      Record voice messages
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center">
              <Link to="/signup">
                <Button variant="link">
                  Don't have an account? Sign up here
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>
                {selectedRole === 'caregiver' ? 'Caregiver Login' : 'Recipient Login'}
              </CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedRole(null)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleLogin} className="flex-1">
                  Login
                </Button>
              </div>
              
              <div className="text-center">
                <Link to="/signup">
                  <Button variant="link">
                    Don't have an account? Sign up here
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}