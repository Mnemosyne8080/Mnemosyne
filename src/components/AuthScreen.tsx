import React, { useEffect, useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAppStore } from '../store';

type AuthMode = 'login' | 'signup' | 'magic';

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const { user, setUser } = useAppStore();

  useEffect(() => {
    // Check for existing session on mount
    fetch('/api/auth/session', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [setUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      if (data.needsConfirmation) {
        setError('Check your email to confirm your account');
      } else if (data.user) {
        setUser(data.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send magic link');
      setMagicSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="h-screen w-full bg-[var(--color-base)] flex flex-col items-center justify-center font-sans p-6">
        <Loader2 className="w-8 h-8 text-[var(--color-text-muted)] animate-spin" />
      </div>
    );
  }

  if (magicSent) {
    return (
      <div className="h-screen w-full bg-[var(--color-base)] flex flex-col items-center justify-center font-sans p-6 noise-bg">
        <div className="panel-brutal-static max-w-md w-full p-10 text-center space-y-6 animate-slide-up">
          <div className="w-16 h-16 border-2 border-[var(--color-success)] flex items-center justify-center mx-auto rotate-3">
            <Check className="w-7 h-7 text-[var(--color-success)]" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-[0.12em]">Check your email</h2>
          <p className="font-mono text-sm text-[var(--color-text-secondary)] leading-relaxed">
            We sent a magic link to <strong className="text-[var(--color-text-primary)]">{email}</strong>.
            Click the link to sign in.
          </p>
          <button
            onClick={() => { setMagicSent(false); setMode('login'); }}
            className="btn-brutal-dark mt-4"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[var(--color-base)] flex flex-col items-center justify-center font-sans p-6 noise-bg">
      {/* Decorative grid background */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="panel-brutal-static max-w-md w-full p-10 space-y-6 animate-slide-up">
        {/* Logo / Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-border)] text-[var(--color-base)] -rotate-3 mb-2">
            <span className="text-2xl font-black tracking-tighter">Mn</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-[var(--color-text-primary)]">
            Mnemosyne
          </h1>
          <div className="w-12 h-1 bg-[var(--color-border)] mx-auto" />
        </div>

        {/* Mode tabs */}
        <div className="flex border-2 border-[var(--color-border)]">
          {(['login', 'signup', 'magic'] as AuthMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className={`flex-1 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                mode === m
                  ? 'bg-[var(--color-border)] text-[var(--color-base)]'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)]'
              }`}
            >
              {m === 'magic' ? 'Magic Link' : m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="border-2 border-[var(--color-error)] bg-[var(--color-error)]/5 p-3 font-mono text-xs text-[var(--color-error)]">
            {error}
          </div>
        )}

        {/* Forms */}
        {mode === 'magic' ? (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-brutal w-full pl-10"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-brutal-dark w-full flex items-center justify-center gap-3 py-3.5 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Send Magic Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-brutal w-full pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-brutal w-full pl-10"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-brutal-dark w-full flex items-center justify-center gap-3 py-3.5 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer note */}
        <div className="pt-4 border-t border-[var(--color-border-light)]">
          <p className="font-mono text-[11px] text-[var(--color-text-muted)] text-center leading-relaxed">
            {mode === 'login' ? 'Sign in to save your conversations and plans' : mode === 'signup' ? 'Create an account to get started' : 'No password needed — just your email'}
          </p>
        </div>
      </div>

      {/* Bottom decorative element */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30">
        <div className="w-8 h-[2px] bg-[var(--color-border)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          v0.2
        </span>
        <div className="w-8 h-[2px] bg-[var(--color-border)]" />
      </div>
    </div>
  );
}
