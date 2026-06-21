import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthPage } from '../auth/AuthPage';
import { Sidebar } from './Sidebar';
import { ChatArea } from '../chat/ChatArea';
import { SettingsModal } from './SettingsModal';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export function MainApp() {
  const [session, setSession] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const setUserId = useWorkflowStore((s) => s.setUserId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserId(session?.user?.id ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      setUserId(null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center font-mono font-black text-2xl uppercase tracking-widest">
        BOOTING MNEMOSYNE_...
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen bg-white selection:bg-black selection:text-white overflow-hidden">
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      <div className="flex-1 flex flex-col h-screen relative">
        <ChatArea onOpenSettings={() => setIsSettingsOpen(true)} />
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
