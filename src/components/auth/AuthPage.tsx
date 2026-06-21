import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function AuthPage({ onBypass }: { onBypass?: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 selection:bg-black selection:text-white">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>MNEMOSYNE_ // AUTH</CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 border-2 border-black bg-red-100 text-black font-mono text-sm">
              [!] ERROR: {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="font-mono text-sm font-bold uppercase tracking-wider">Email Designation</label>
            <Input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="operator@system.io"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-sm font-bold uppercase tracking-wider">Access Token</label>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'PROCESSING...' : isLogin ? 'INITIATE CONNECTION' : 'REQUEST CLEARANCE'}
          </Button>

          <div className="pt-4 border-t-2 border-black mt-6 text-center space-y-4 flex flex-col">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="font-mono text-sm underline hover:bg-black hover:text-white transition-colors"
            >
              {isLogin ? 'CREATE NEW IDENTITY' : 'EXISTING OPERATOR LOGIN'}
            </button>
            {onBypass && (
               <button 
                type="button" 
                onClick={onBypass}
                className="font-mono text-xs text-gray-500 hover:text-black transition-colors"
                >
                [ BYPASS FOR OFFLINE DEMO ]
               </button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
