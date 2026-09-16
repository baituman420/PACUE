import React from 'react';
import { 
  Inbox, Clock, AlertCircle, Calendar, Film, ArrowRight, 
  CheckCircle2, Sparkles, Layers 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QueueScreen: React.FC = () => {
  const { jobs, pickJob, setCurrentView, setActiveJobId } = useApp();

  const availableJobs = jobs.filter(j => j.status === 'Disponible');
  const inProgressJobs = jobs.filter(j => j.status === 'En producción');

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-broadcast-border">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 sm:w-6 sm:h-6 text-broadcast-accent" />
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
              Cola de Trabajos Audiovisuales
            </h1>
          </div>
          <p className="text-xs text-broadcast-textMuted mt-1">
            Material pendiente de reserva por técnicos de accesibilidad y subtitulado
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded bg-broadcast-surface border border-broadcast-border font-mono text-broadcast-textPrimary text-[11px] sm:text-xs">
            Disponibles: <strong className="text-broadcast-accent">{availableJobs.length}</strong>
          </span>
          {inProgressJobs.length > 0 && (
            <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded bg-amber-950/40 border border-amber-800/50 font-mono text-amber-400 text-[11px] sm:text-xs">
              En curso: <strong>{inProgressJobs.length}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Active Work In Progress alert if any */}
      {inProgressJobs.length > 0 && (
        <div className="mb-6 p-3.5 rounded bg-broadcast-surface border border-broadcast-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-broadcast-accent" />
            <div>
              <div className="text-[11px] text-broadcast-textMuted uppercase tracking-wider font-medium">
                Trabajo en producción
              </div>
              <div className="text-sm font-semibold text-broadcast-textPrimary">
                {inProgressJobs[0].clientName} — {inProgressJobs[0].title}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveJobId(inProgressJobs[0].id);
              setCurrentView('trabajo');
            }}
            className="px-4 py-2 rounded bg-[#B79D72] hover:bg-[#C8BDAA] text-[#1B1916] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
          >
            <span>Continuar Edición</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Available Jobs Grid */}
      <h2 className="text-sm font-mono text-broadcast-textMuted uppercase tracking-wider mb-4">
        Trabajos disponibles para reserva
      </h2>

      {availableJobs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-broadcast-border rounded-lg bg-broadcast-darkest/50">
          <CheckCircle2 className="w-10 h-10 text-broadcast-success mx-auto mb-2" />
          <p className="text-sm text-white font-medium">No hay trabajos pendientes en la cola</p>
          <p className="text-xs text-broadcast-textMuted mt-1">Todos los pedidos han sido reservados o completados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {availableJobs.map(job => {
            const isHighPriority = job.priority === 'Alta';

            return (
              <div
                key={job.id}
                className="bg-broadcast-panel border border-broadcast-border hover:border-broadcast-borderLight rounded-lg p-5 flex flex-col justify-between shadow-xl transition-all relative overflow-hidden group"
              >
                {/* Priority Corner Badge */}
                {isHighPriority && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-[#B96852] text-[#1B1916] font-mono text-[10px] font-bold uppercase tracking-wider rounded-bl">
                    Prioridad Alta
                  </div>
                )}

                <div>
                  {/* Client & Service Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-broadcast-accent font-mono">
                      {job.clientName}
                    </span>
                    {!isHighPriority && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-broadcast-surface text-broadcast-textMuted">
                        {job.priority}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-3 group-hover:text-broadcast-accent transition-colors leading-tight">
                    {job.title}
                  </h3>

                  {/* Specs Matrix */}
                  <div className="space-y-2 py-3 border-t border-b border-broadcast-border/60 text-xs font-mono">
                    <div className="flex items-center justify-between text-broadcast-textMuted">
                      <span>Duración:</span>
                      <span className="text-white font-semibold">{job.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-broadcast-textMuted">
                      <span>Servicio:</span>
                      <span className="text-broadcast-textSecondary">{job.serviceType}</span>
                    </div>
                    <div className="flex items-center justify-between text-broadcast-textMuted">
                      <span>Entrega límite:</span>
                      <span className="text-broadcast-amber font-semibold">{job.deadline}</span>
                    </div>
                    <div className="flex items-center justify-between text-broadcast-textMuted">
                      <span>Formato salida:</span>
                      <span className="text-white font-bold">{job.expectedFormat}</span>
                    </div>
                    <div className="flex items-center justify-between text-broadcast-textMuted">
                      <span>Framerate:</span>
                      <span className="text-white">{job.fps} fps</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-5 pt-1">
                  <button
                    onClick={() => pickJob(job.id)}
                    className="w-full py-2.5 px-4 rounded bg-[#B79D72] hover:bg-[#C8BDAA] text-[#1B1916] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
                  >
                    <span>COGER TRABAJO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
