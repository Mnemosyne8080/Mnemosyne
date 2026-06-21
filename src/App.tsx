import React, { useState } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { PlanPanel } from './components/PlanPanel';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showPlanMobile, setShowPlanMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="h-screen w-full bg-gray-100 flex overflow-hidden font-sans">
      <div className={`w-full md:w-[60%] shrink-0 h-full transition-transform ${showPlanMobile ? '-translate-x-full absolute' : 'translate-x-[0] relative md:static md:translate-x-0'}`}>
        <ChatPanel openSettings={() => setShowSettings(true)} />
      </div>
      
      <div className={`w-full md:w-[40%] h-full shrink-0 transition-transform ${showPlanMobile ? 'translate-x-0 relative' : 'translate-x-full absolute md:static md:translate-x-0'}`}>
        <PlanPanel />
      </div>

      {/* Mobile Plan Toggle Button */}
      <button 
        className="md:hidden fixed bottom-24 right-4 btn-brutal-dark rounded-full w-14 h-14 flex items-center justify-center p-0 z-40"
        onClick={() => setShowPlanMobile(!showPlanMobile)}
      >
        <span className="text-[10px] leading-tight text-center">
          {showPlanMobile ? 'BACK' : 'PLAN'}
        </span>
      </button>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

