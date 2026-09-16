import React, { useState } from 'react';
import { 
  Send, CheckCircle2, FolderCheck, User, Clock, HardDrive, 
  ArrowRight, Inbox, History, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DeliveryScreen: React.FC = () => {
  const { 
    activeJob, 
    deliverJob, 
    setCurrentView, 
    user, 
    clients,
    activeStage 
  } = useApp();

  const [isDelivered, setIsDelivered] = useState(activeJob?.status === 'Entregado');

  const defaultFileName = activeJob?.clientName === 'RTVE' 
    ? 'RTVE_INFO_20260916_ES.pac' 
    : 'AMZN_SERIE_EP04_ES.pac';

  const clientProfile = activeJob ? clients[activeJob.clientId] : null;
  const destinationFolder = clientProfile?.deliveryFolder || 'Drive / RTVE / Entregados';

  const handleDeliver = () => {
    deliverJob(defaultFileName, true);
    setIsDelivered(true);
  };

  const handleGoToNextJob = () => {
    setCurrentView('cola');
  };

  const handleGoToHistory = () => {
    setCurrentView('historial');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-broadcast-border">
        <div className="p-3 rounded-lg bg-cyan-950/40 border border-broadcast-accent/40 text-broadcast-accent">
          <Send className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">
            {isDelivered ? 'Entrega Completada' : 'Entrega Preparada'}
          </h2>
          <p className="text-xs text-broadcast-textMuted mt-1">
            Depósito del máster de subtítulos en la carpeta de destino del cliente
          </p>
        </div>
      </div>

      {!isDelivered ? (
        /* Delivery Ready Card */
        <div className="my-6 bg-broadcast-panel border border-broadcast-border rounded-lg p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-broadcast-border">
            <div className="flex items-center gap-3">
              <FolderCheck className="w-6 h-6 text-broadcast-accent" />
              <div>
                <span className="text-xs font-mono text-broadcast-textMuted uppercase">Archivo a depositar</span>
                <h3 className="text-base font-bold text-white font-mono">{defaultFileName}</h3>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-broadcast-surface border border-broadcast-border text-xs font-mono text-broadcast-accent font-bold">
              LISTO
            </span>
          </div>

          {/* Delivery Technical Specs */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded bg-broadcast-darkest border border-broadcast-border/60 space-y-1">
              <span className="text-broadcast-textMuted flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-broadcast-accent" /> Tamaño estimado:
              </span>
              <span className="text-white font-bold text-sm">48.6 KB</span>
            </div>

            <div className="p-3 rounded bg-broadcast-darkest border border-broadcast-border/60 space-y-1">
              <span className="text-broadcast-textMuted flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-broadcast-accent" /> Técnico responsable:
              </span>
              <span className="text-white font-bold text-sm">{user.name}</span>
            </div>

            <div className="p-3 rounded bg-broadcast-darkest border border-broadcast-border/60 space-y-1">
              <span className="text-broadcast-textMuted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-broadcast-accent" /> Duración de producción:
              </span>
              <span className="text-white font-bold text-sm">0h 48m</span>
            </div>

            <div className="p-3 rounded bg-broadcast-darkest border border-broadcast-border/60 space-y-1">
              <span className="text-broadcast-textMuted flex items-center gap-1.5">
                <FolderCheck className="w-3.5 h-3.5 text-broadcast-accent" /> Formato de máster:
              </span>
              <span className="text-white font-bold text-sm">PAC (simulado)</span>
            </div>
          </div>

          {/* Destination Path */}
          <div className="p-4 rounded bg-broadcast-darkest border border-broadcast-border">
            <span className="text-xs font-mono text-broadcast-textMuted block mb-1 uppercase tracking-wider">
              Destino configurado:
            </span>
            <div className="font-mono text-sm text-cyan-300 font-bold">
              {destinationFolder}
            </div>
          </div>

          {/* Action Deliver Button */}
          <button
            onClick={handleDeliver}
            className="w-full py-3.5 rounded bg-broadcast-accent hover:bg-broadcast-accentHover text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.99]"
          >
            <Send className="w-4 h-4" />
            <span>ENTREGAR</span>
          </button>
        </div>
      ) : (
        /* Delivery Completed Card */
        <div className="my-6 bg-broadcast-panel border border-broadcast-border rounded-lg p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Trabajo entregado correctamente
            </h3>
            <p className="text-sm text-broadcast-textMuted max-w-md mx-auto">
              El archivo <strong className="text-white font-mono">{defaultFileName}</strong> ha quedado registrado como finalizado y depositado en <span className="text-cyan-300 font-mono">{destinationFolder}</span>.
            </p>
          </div>

          <div className="pt-4 border-t border-broadcast-border flex items-center justify-center gap-4">
            <button
              onClick={handleGoToHistory}
              className="px-5 py-2.5 rounded bg-broadcast-surface hover:bg-broadcast-border border border-broadcast-border text-xs font-semibold text-broadcast-textPrimary hover:text-white flex items-center gap-2 transition-colors"
            >
              <History className="w-4 h-4" />
              <span>Ver en Historial</span>
            </button>

            <button
              onClick={handleGoToNextJob}
              className="px-6 py-2.5 rounded bg-broadcast-accent hover:bg-broadcast-accentHover text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Inbox className="w-4 h-4" />
              <span>COGER SIGUIENTE TRABAJO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
