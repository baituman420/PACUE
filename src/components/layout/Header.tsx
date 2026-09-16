import React from 'react';
import { RotateCcw, Radio } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { user, activeJob, resetAllDemoData } = useApp();

  return (
    <header className="h-11 bg-broadcast-darkest border-b border-broadcast-border px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Logo mark - Calm teal without electric glow */}
          <div className="w-5 h-5 rounded bg-teal-600/90 text-white font-sans font-bold text-xs flex items-center justify-center">
            P
          </div>
          <span className="font-sans font-bold tracking-wider text-sm text-broadcast-textPrimary">
            PACUE
          </span>
        </div>

        <span className="text-broadcast-border text-xs">|</span>

        <span className="text-xs text-broadcast-textMuted hidden sm:inline">
          Workspace de Subtitulado
        </span>

        {/* Discrete Mundo Escena tag */}
        <span className="text-[10px] px-2 py-0.5 rounded bg-broadcast-surface border border-broadcast-border text-broadcast-textMuted hidden md:inline">
          Mundo Escena
        </span>
      </div>

      {/* Right controls: Active status + User profile + Reset */}
      <div className="flex items-center gap-3">
        {/* Production Status */}
        {activeJob && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-broadcast-surface border border-broadcast-border text-xs hidden lg:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-broadcast-textPrimary font-medium">{activeJob.clientName}</span>
            <span className="text-broadcast-textMuted font-mono text-[11px]">[{activeJob.duration}]</span>
          </div>
        )}

        {/* User profile */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-full bg-broadcast-surface border border-broadcast-border flex items-center justify-center font-sans font-semibold text-teal-400 text-[11px]">
            {user.initials}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="font-medium text-broadcast-textPrimary text-xs">{user.name}</div>
          </div>
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={() => {
            if (window.confirm('¿Deseas reiniciar todos los datos a la demo inicial?')) {
              resetAllDemoData();
            }
          }}
          title="Reiniciar datos a la configuración inicial"
          className="p-1 rounded hover:bg-broadcast-surface text-broadcast-textMuted hover:text-white transition-colors text-xs flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[10px]">Reiniciar</span>
        </button>
      </div>
    </header>
  );
};
