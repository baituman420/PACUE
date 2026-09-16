import React from 'react';
import { 
  Inbox, Film, History, Building2, Settings
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
    },
    {
      id: 'trabajo' as const,
      label: 'Mi trabajo',
      icon: Film,
      badge: activeJob ? 'Activo' : undefined,
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
    <aside className="w-52 bg-broadcast-panel border-r border-broadcast-border flex flex-col justify-between select-none">
      {/* Navigation List */}
      <div className="p-2.5 space-y-1">
        <div className="text-[10px] uppercase tracking-wider text-broadcast-textMuted px-2.5 py-2 font-sans">
          Navegación
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-r text-xs transition-colors font-sans relative ${
                isActive
                  ? 'bg-[#2B2722] text-[#D8D1C5] font-medium border-l-2 border-[#D8D1C5]'
                  : 'text-[#BEB6AA] hover:bg-[#24211D]/80 hover:text-[#D8D1C5] border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D8D1C5]' : 'text-[#8F887E]'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-sans ${
                  isActive
                    ? 'bg-[#24211D] text-[#D8D1C5] border border-[#3A352E]'
                    : 'text-[#8F887E] bg-[#1B1916]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Status - Quiet */}
      <div className="p-3 border-t border-broadcast-border text-[10px] text-[#8F887E] font-sans">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8F887E]" />
          <span className="text-[#BEB6AA]">PACUE v0.1</span>
        </div>
        <div className="text-broadcast-textMuted text-[9px]">
          Sincronización audio & subtítulo
        </div>
      </div>
    </aside>
  );
};
