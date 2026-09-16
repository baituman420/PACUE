import React from 'react';
import { 
  Inbox, Film, History, Building2, Settings, ChevronRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    jobs, 
    activeJob 
  } = useApp();

  const availableCount = jobs.filter(j => j.status === 'Disponible').length;

  const navItems = [
    {
      id: 'cola' as const,
      label: 'Cola',
      icon: Inbox,
      badge: availableCount > 0 ? availableCount : undefined,
      badgeColor: 'bg-broadcast-accent text-black font-bold'
    },
    {
      id: 'trabajo' as const,
      label: 'Mi trabajo',
      icon: Film,
      badge: activeJob ? 'ACTIVO' : undefined,
      badgeColor: 'bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-[9px]'
    },
    {
      id: 'historial' as const,
      label: 'Historial',
      icon: History
    },
    {
      id: 'clientes' as const,
      label: 'Clientes',
      icon: Building2
    },
    {
      id: 'configuracion' as const,
      label: 'Configuración',
      icon: Settings
    }
  ];

  return (
    <aside className="w-56 bg-broadcast-panel border-r border-broadcast-border flex flex-col justify-between select-none">
      {/* Navigation List */}
      <div className="p-3 space-y-1">
        <div className="text-[10px] font-mono text-broadcast-textMuted uppercase tracking-wider px-3 py-2">
          Navegación
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-broadcast-accent text-black font-bold shadow-md'
                  : 'text-broadcast-textPrimary hover:bg-broadcast-surface hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-broadcast-textMuted'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-broadcast-border text-[11px] font-mono text-broadcast-textMuted">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-broadcast-success" />
          <span className="text-white font-medium">Motor PACUE v0.1</span>
        </div>
        <div className="text-[10px] text-broadcast-textMuted">
          Audio & Subtitle Sync Core
        </div>
      </div>
    </aside>
  );
};
