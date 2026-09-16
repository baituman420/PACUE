import React from 'react';
import { 
  Check, ChevronRight, Film, Clock, Calendar, FileText, 
  Sparkles, Layers, ShieldCheck, Download, Send, ArrowLeft 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PipelineStage } from '../../types';
import { EditorScreen } from '../editor/EditorScreen';
import { QCFinalScreen } from '../qc/QCFinalScreen';
import { ExportScreen } from '../export/ExportScreen';
import { DeliveryScreen } from '../delivery/DeliveryScreen';

export const ActiveJobScreen: React.FC = () => {
  const { 
    activeJob, 
    activeStage, 
    setActiveStage, 
    setCurrentView,
    user 
  } = useApp();

  if (!activeJob) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <Film className="w-12 h-12 text-broadcast-textMuted mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">No hay ningún trabajo activo seleccionado</h2>
        <p className="text-xs text-broadcast-textMuted mb-4">
          Selecciona un trabajo disponible en la cola para comenzar a producir
        </p>
        <button
          onClick={() => setCurrentView('cola')}
          className="px-4 py-2 rounded bg-broadcast-accent hover:bg-broadcast-accentHover text-black text-xs font-bold uppercase tracking-wider"
        >
          Ir a la Cola
        </button>
      </div>
    );
  }

  const stages: Array<{ id: PipelineStage; label: string; number: number }> = [
    { id: 'preparar', label: 'Preparar', number: 1 },
    { id: 'procesar', label: 'Procesar', number: 2 },
    { id: 'editar', label: 'Editar', number: 3 },
    { id: 'revisar', label: 'Revisar', number: 4 },
    { id: 'qc', label: 'QC', number: 5 },
    { id: 'exportar', label: 'Exportar', number: 6 },
    { id: 'entregar', label: 'Entregar', number: 7 },
  ];

  const currentStageIndex = stages.findIndex(s => s.id === activeStage);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-broadcast-darkest">
      {/* Broadcast Technical Header */}
      <div className="bg-broadcast-panel border-b border-broadcast-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Client & Project Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('cola')}
            title="Volver a la cola"
            className="p-1 rounded bg-broadcast-surface hover:bg-broadcast-border text-broadcast-textMuted hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-broadcast-accent font-mono">
                {activeJob.clientName}
              </span>
              <span className="text-broadcast-textMuted">•</span>
              <h1 className="text-sm font-bold text-white tracking-wide">
                {activeJob.title}
              </h1>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-broadcast-textMuted mt-0.5">
              <span>Servicio: <strong className="text-cyan-300">{activeJob.serviceType}</strong></span>
              <span>•</span>
              <span>Duración: <strong className="text-white">{activeJob.duration}</strong></span>
              <span>•</span>
              <span>Framerate: <strong className="text-white">{activeJob.fps} fps</strong></span>
              <span>•</span>
              <span>Salida: <strong className="text-white">{activeJob.expectedFormat}</strong></span>
              <span>•</span>
              <span>Deadline: <strong className="text-amber-400">{activeJob.deadline}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Technician assignment badge */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-broadcast-darkest border border-broadcast-border flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-broadcast-success animate-pulse" />
            <span className="text-broadcast-textMuted">Técnico:</span>
            <span className="text-white font-semibold font-mono">{activeJob.assignedTo || user.name}</span>
          </div>
        </div>
      </div>

      {/* 7-Stage Pipeline Stepper Bar */}
      <div className="bg-broadcast-darkest border-b border-broadcast-border px-4 py-2 flex items-center justify-between text-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = stage.id === activeStage;

            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors text-xs font-mono ${
                    isCurrent
                      ? 'bg-broadcast-accent text-black font-bold shadow'
                      : isCompleted
                      ? 'text-broadcast-success hover:bg-broadcast-surface font-semibold'
                      : 'text-broadcast-textMuted hover:text-white hover:bg-broadcast-surface'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent 
                      ? 'bg-black text-broadcast-accent' 
                      : isCompleted 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50' 
                      : 'bg-broadcast-surface text-broadcast-textMuted'
                  }`}>
                    {isCompleted ? '✓' : stage.number}
                  </span>
                  <span>{stage.label}</span>
                </button>
                {idx < stages.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-broadcast-border flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Fast Action forward button */}
        <div className="flex items-center gap-2 pl-4">
          {activeStage === 'editar' && (
            <button
              onClick={() => setActiveStage('qc')}
              className="px-3 py-1 rounded bg-broadcast-surface hover:bg-broadcast-border border border-broadcast-border text-xs font-semibold text-broadcast-accent flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ejecutar QC</span>
            </button>
          )}
          {activeStage === 'qc' && (
            <button
              onClick={() => setActiveStage('exportar')}
              className="px-3 py-1 rounded bg-broadcast-accent hover:bg-broadcast-accentHover text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <span>Exportar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {activeStage === 'exportar' && (
            <button
              onClick={() => setActiveStage('entregar')}
              className="px-3 py-1 rounded bg-broadcast-accent hover:bg-broadcast-accentHover text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              <span>Entregar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area based on Stage */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {(activeStage === 'preparar' || activeStage === 'procesar' || activeStage === 'editar' || activeStage === 'revisar') && (
          <EditorScreen />
        )}
        {activeStage === 'qc' && <QCFinalScreen />}
        {activeStage === 'exportar' && <ExportScreen />}
        {activeStage === 'entregar' && <DeliveryScreen />}
      </div>
    </div>
  );
};
