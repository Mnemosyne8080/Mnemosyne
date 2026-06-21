import React, { useState } from 'react';
import { Github, Key, ArrowRight } from 'lucide-react';

export function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  return (
    <div className="h-screen w-full bg-[var(--color-base)] flex flex-col items-center justify-center font-sans p-6 noise-bg">
      {/* Decorative grid background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="panel-brutal-static max-w-md w-full p-10 text-center space-y-8 animate-slide-up">
        {/* Logo / Brand */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-border)] text-[var(--color-base)] -rotate-3 mb-2">
            <span className="text-2xl font-black tracking-tighter">Mn</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-[var(--color-text-primary)]">
            Mnemosyne
          </h1>
          <div className="w-12 h-1 bg-[var(--color-border)] mx-auto" />
        </div>

        {/* Description */}
        <p className="font-mono text-sm leading-relaxed text-[var(--color-text-secondary)] max-w-xs mx-auto">
          The AI agent system that turns vague ideas into structured execution plans.
        </p>

        {/* Auth buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onLogin}
            onMouseEnter={() => setHoveredBtn('github')}
            onMouseLeave={() => setHoveredBtn(null)}
            className="btn-brutal w-full flex items-center justify-center gap-3 py-3.5 group"
          >
            <Github className="w-5 h-5" />
            <span>Continue with Github</span>
            <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${hoveredBtn === 'github' ? 'translate-x-1' : ''}`} />
          </button>

          <button
            onClick={onLogin}
            onMouseEnter={() => setHoveredBtn('google')}
            onMouseLeave={() => setHoveredBtn(null)}
            className="btn-brutal w-full flex items-center justify-center gap-3 py-3.5 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,15.05 17.26,16.27 15.65,17.23V19.04H19.23C21.36,17.06 22.5,14.15 22.5,11.1C22.5,10.66 22.42,10.24 22.35,9.8L21.35,11.1Z" />
              <path fill="currentColor" d="M12.18,22.5C15.09,22.5 17.58,21.5 19.34,19.82L15.76,18.04C14.78,18.72 13.59,19.16 12.18,19.16C9.4,19.16 7.04,17.25 6.18,14.67H2.52V16.5C4.28,20.08 7.95,22.5 12.18,22.5Z" />
              <path fill="currentColor" d="M6.18,14.67C5.96,13.97 5.83,13.24 5.83,12.5C5.83,11.76 5.96,11.03 6.18,10.33V8.5H2.52C1.78,9.97 1.35,11.69 1.35,13.5C1.35,15.31 1.78,17.03 2.52,18.5L6.18,14.67Z" />
              <path fill="currentColor" d="M12.18,6.84C13.88,6.84 15.39,7.43 16.59,8.44L19.41,5.62C17.58,3.92 15.09,2.5 12.18,2.5C7.95,2.5 4.28,4.92 2.52,8.5L6.18,10.33C7.04,7.75 9.4,5.84 12.18,5.84Z" />
            </svg>
            <span>Continue with Google</span>
            <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${hoveredBtn === 'google' ? 'translate-x-1' : ''}`} />
          </button>
        </div>

        {/* Footer note */}
        <div className="pt-4 border-t border-[var(--color-border-light)]">
          <p className="font-mono text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            Prot workspace · Auth is simulated · No data is stored
          </p>
        </div>
      </div>

      {/* Bottom decorative element */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30">
        <div className="w-8 h-[2px] bg-[var(--color-border)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">v0.1</span>
        <div className="w-8 h-[2px] bg-[var(--color-border)]" />
      </div>
    </div>
  );
}
