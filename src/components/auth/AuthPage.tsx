import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Eye, EyeOff } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usernameToEmail = (uname: string) => `${uname.toLowerCase().replace(/[^a-z0-9]/g, '')}@mnemosyne.app`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const derivedEmail = usernameToEmail(username);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: derivedEmail, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: derivedEmail, password });
        if (error) throw error;
        setIsLogin(true);
        setUsername('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 selection:bg-black selection:text-white">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>MNEMOSYNE // WELCOME</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 border-2 border-black bg-red-100 text-black font-mono text-sm">
              [!] {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="font-mono text-sm font-bold uppercase tracking-wider">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="your_username"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-sm font-bold uppercase tracking-wider">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
          </Button>

          <div className="pt-4 border-t-2 border-black mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-mono text-sm underline hover:bg-black hover:text-white transition-colors"
            >
              {isLogin ? 'Create an account' : 'Already have an account? Log in'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
