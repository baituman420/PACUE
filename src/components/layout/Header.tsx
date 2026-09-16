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
          {/* Logo mark - Quiet earthy badge */}
          <div className="w-5 h-5 rounded bg-broadcast-surfaceHover border border-broadcast-border text-broadcast-textPrimary font-sans font-bold text-xs flex items-center justify-center">
            P
          </div>
          <span className="font-sans font-bold tracking-wider text-sm text-broadcast-textPrimary">
            PACUE
          </span>
        </div>

        <span className="text-broadcast-border text-xs">|</span>

        <span className="text-xs text-broadcast-textMuted hidden sm:inline font-sans">
          Workspace de Subtitulado
        </span>

        {/* Discrete Mundo Escena tag */}
        <span className="text-[10px] px-2 py-0.5 rounded bg-broadcast-surface border border-broadcast-border text-broadcast-textMuted hidden md:inline font-sans">
          Mundo Escena
        </span>
      </div>

      {/* Right controls: Active status + User profile + Reset */}
      <div className="flex items-center gap-3">
        {/* Production Status */}
        {activeJob && (
          <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-broadcast-surface border border-broadcast-border text-xs hidden lg:flex font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-broadcast-accent" />
            <span className="text-broadcast-textSecondary font-medium">{activeJob.clientName}</span>
            <span className="text-broadcast-textMuted font-mono text-[10px]">[{activeJob.duration}]</span>
          </div>
        )}

        {/* User profile */}
        <div className="flex items-center gap-2 text-xs font-sans">
          <div className="w-6 h-6 rounded-full bg-broadcast-surface border border-broadcast-border flex items-center justify-center font-sans font-medium text-broadcast-textSecondary text-[11px]">
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
