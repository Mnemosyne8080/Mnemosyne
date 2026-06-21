import React, { useState } from 'react';
import { Github, Key } from 'lucide-react';
import { useAppStore } from '../store';

export function AuthScreen({ onLogin }: { onLogin: () => void }) {
  // Just a mock login that passes through for the prototype.
  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center font-sans p-6">
      <div className="panel-brutal max-w-md w-full p-8 text-center space-y-8">
        <h1 className="text-4xl font-black uppercase tracking-widest border-b-8 border-black pb-4 mb-4">
          Mnemosyne
        </h1>
        <p className="font-mono text-sm leading-relaxed text-gray-700">
           The AI agent system that turns vague ideas into execution plans.
        </p>

        <div className="space-y-4 pt-4">
          <button onClick={onLogin} className="btn-brutal w-full flex items-center justify-center gap-3 py-3">
             <Github className="w-5 h-5" />
             Continue with Github
          </button>
          
          <button onClick={onLogin} className="btn-brutal w-full flex items-center justify-center gap-3 py-3">
             <svg className="w-5 h-5" viewBox="0 0 24 24">
               <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,15.05 17.26,16.27 15.65,17.23V19.04H19.23C21.36,17.06 22.5,14.15 22.5,11.1C22.5,10.66 22.42,10.24 22.35,9.8L21.35,11.1Z" />
               <path fill="currentColor" d="M12.18,22.5C15.09,22.5 17.58,21.5 19.34,19.82L15.76,18.04C14.78,18.72 13.59,19.16 12.18,19.16C9.4,19.16 7.04,17.25 6.18,14.67H2.52V16.5C4.28,20.08 7.95,22.5 12.18,22.5Z" />
               <path fill="currentColor" d="M6.18,14.67C5.96,13.97 5.83,13.24 5.83,12.5C5.83,11.76 5.96,11.03 6.18,10.33V8.5H2.52C1.78,9.97 1.35,11.69 1.35,13.5C1.35,15.31 1.78,17.03 2.52,18.5L6.18,14.67Z" />
               <path fill="currentColor" d="M12.18,6.84C13.88,6.84 15.39,7.43 16.59,8.44L19.41,5.62C17.58,3.92 15.09,2.5 12.18,2.5C7.95,2.5 4.28,4.92 2.52,8.5L6.18,10.33C7.04,7.75 9.4,5.84 12.18,5.84Z" />
             </svg>
             Continue with Google
          </button>
        </div>

        <div className="pt-8 opacity-50 font-mono text-xs">
          <p>This is a prototype workspace. Auth is simulated.</p>
        </div>
      </div>
    </div>
  );
}
