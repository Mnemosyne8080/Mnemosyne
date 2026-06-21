import React, { useState } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { PlanPanel } from './components/PlanPanel';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { MapPin, MessageSquare } from 'lucide-react';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showPlanMobile, setShowPlanMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="h-screen w-full bg-[var(--color-base)] flex overflow-hidden font-sans">
      {/* Chat Panel */}
      <div className={`w-full md:w-[58%] shrink-0 h-full transition-all duration-300 ease-in-out ${
        showPlanMobile
          ? '-translate-x-full absolute opacity-0 pointer-events-none'
          : 'translate-x-0 relative md:static md:translate-x-0 opacity-100'
      }`}>
        <ChatPanel openSettings={() => setShowSettings(true)} />
      </div>

      {/* Plan Panel */}
      <div className={`w-full md:w-[42%] h-full shrink-0 transition-all duration-300 ease-in-out ${
        showPlanMobile
          ? 'translate-x-0 relative opacity-100'
          : 'translate-x-full absolute md:static md:translate-x-0 opacity-100 md:opacity-100'
      }`}>
        <PlanPanel />
      </div>

      {/* Mobile Plan Toggle Button */}
      <button
        className="md:hidden fixed bottom-6 right-5 z-40 w-14 h-14 border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-[3px_3px_0px_0px_var(--color-border)] flex items-center justify-center p-0 transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_var(--color-border)]"
        onClick={() => setShowPlanMobile(!showPlanMobile)}
        aria-label={showPlanMobile ? 'Back to chat' : 'Show plan'}
      >
        {showPlanMobile ? (
          <MessageSquare className="w-5 h-5 text-[var(--color-text-primary)]" />
        ) : (
          <MapPin className="w-5 h-5 text-[var(--color-text-primary)]" />
        )}
      </button>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
