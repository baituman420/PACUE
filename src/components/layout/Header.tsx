import React from 'react';
import { RotateCcw, User, Layers, Radio, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { user, activeJob, resetAllDemoData } = useApp();

  return (
    <header className="h-12 bg-broadcast-darkest border-b border-broadcast-border px-4 flex items-center justify-between select-none z-30">
      {/* Brand Wordmark & Descriptor */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Logo mark */}
          <div className="w-6 h-6 rounded bg-broadcast-accent text-black font-mono font-black text-sm flex items-center justify-center shadow-[0_0_10px_rgba(0,229,255,0.4)]">
            P
          </div>
          <span className="font-mono font-black tracking-widest text-base text-white">
            PACUE
          </span>
        </div>

        <span className="text-broadcast-border text-sm">|</span>

        <span className="text-[11px] font-mono tracking-wider text-broadcast-textMuted uppercase hidden sm:inline">
          Subtitle Production Workspace
        </span>

        {/* Discrete Mundo Escena Demo tag */}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-broadcast-surface border border-broadcast-border text-broadcast-textMuted hidden md:inline">
          Demo configurada para Mundo Escena
        </span>
      </div>

      {/* Right controls: Active status + User profile + Reset */}
      <div className="flex items-center gap-4">
        {/* Production Live Status */}
        {activeJob && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-500/30 text-xs hidden lg:flex">
            <Radio className="w-3.5 h-3.5 text-broadcast-accent animate-pulse" />
            <span className="font-mono text-cyan-300 font-semibold">{activeJob.clientName}</span>
            <span className="text-broadcast-textMuted font-mono">[{activeJob.duration}]</span>
          </div>
        )}

        {/* User profile */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-7 h-7 rounded-full bg-broadcast-surface border border-broadcast-border flex items-center justify-center font-mono font-bold text-broadcast-accent text-xs">
            {user.initials}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="font-bold text-white text-xs">{user.name}</div>
            <div className="text-[10px] text-broadcast-textMuted">{user.role}</div>
          </div>
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={() => {
            if (window.confirm('¿Deseas reiniciar todos los datos a la demo inicial?')) {
              resetAllDemoData();
            }
          }}
          title="Reiniciar datos de la demo inicial"
          className="p-1.5 rounded bg-broadcast-surface hover:bg-broadcast-border border border-broadcast-border text-broadcast-textMuted hover:text-white transition-colors text-xs flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[10px] font-mono">Reiniciar demo</span>
        </button>
      </div>
    </header>
  );
};
