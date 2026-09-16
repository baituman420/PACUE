import React from 'react';
import { 
  ChevronRight, Film, ShieldCheck, Download, ArrowLeft 
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
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none font-sans">
        <Film className="w-10 h-10 text-broadcast-textMuted mb-3" />
        <h2 className="text-sm font-semibold text-broadcast-textPrimary mb-1">Sin trabajo activo</h2>
        <p className="text-xs text-broadcast-textMuted mb-4">
          Selecciona un trabajo en la cola para comenzar la edición
        </p>
        <button
          onClick={() => setCurrentView('cola')}
          className="px-3 py-1.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover border border-broadcast-border text-xs font-medium text-broadcast-textPrimary transition-colors"
        >
          Ir a la Cola
        </button>
      </div>
    );
  }

  const stages: Array<{ id: PipelineStage; label: string }> = [
    { id: 'preparar', label: 'Preparar' },
    { id: 'procesar', label: 'Procesar' },
    { id: 'editar', label: 'Editar' },
    { id: 'revisar', label: 'Revisar' },
    { id: 'qc', label: 'QC' },
    { id: 'exportar', label: 'Exportar' },
    { id: 'entregar', label: 'Entregar' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-broadcast-darkest select-none">
      {/* Consolidated Quiet Top Bar: Title + Context + Pipeline */}
      <div className="h-10 bg-broadcast-panel border-b border-broadcast-border px-3 flex items-center justify-between gap-3 text-xs font-sans">
        {/* Left: Back + Title + Subdued Technical Context */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <button
            onClick={() => setCurrentView('cola')}
            title="Volver a la cola de trabajos"
            className="p-1 rounded hover:bg-broadcast-surface text-broadcast-textMuted hover:text-broadcast-textPrimary transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="font-semibold text-broadcast-textPrimary truncate">
              {activeJob.title}
            </span>
            <span className="text-broadcast-textMuted text-[11px]">•</span>
            <span className="text-broadcast-textSecondary text-[11px]">
              {activeJob.clientName}
            </span>
            <span className="text-broadcast-textMuted text-[10px] hidden md:inline font-mono">
              [{activeJob.duration} • {activeJob.fps} fps • {activeJob.expectedFormat}]
            </span>
          </div>
        </div>

        {/* Right: Subdued Pipeline Stepper & Primary Action */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-0.5 bg-broadcast-darkest/70 p-0.5 rounded border border-broadcast-border">
            {stages.map((stage, idx) => {
              const isCurrent = stage.id === activeStage;

              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    isCurrent
                      ? 'bg-broadcast-surfaceHover text-broadcast-textPrimary font-medium shadow-sm'
                      : 'text-broadcast-textMuted hover:text-broadcast-textSecondary'
                  }`}
                >
                  {stage.label}
                </button>
              );
            })}
          </div>

          {/* Quick Step Action */}
          {activeStage === 'editar' && (
            <button
              onClick={() => setActiveStage('qc')}
              className="px-2.5 py-1 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover border border-broadcast-border text-xs font-medium text-broadcast-textPrimary hover:text-broadcast-accent flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-broadcast-accent" />
              <span>QC</span>
            </button>
          )}
          {activeStage === 'qc' && (
            <button
              onClick={() => setActiveStage('exportar')}
              className="px-2.5 py-1 rounded bg-broadcast-accent hover:bg-broadcast-accentHover text-white text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <span>Exportar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {activeStage === 'exportar' && (
            <button
              onClick={() => setActiveStage('entregar')}
              className="px-2.5 py-1 rounded bg-broadcast-accent hover:bg-broadcast-accentHover text-white text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <span>Entregar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Dynamic Viewport */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeStage === 'editar' && <EditorScreen />}
        {activeStage === 'qc' && <QCFinalScreen />}
        {activeStage === 'exportar' && <ExportScreen />}
        {activeStage === 'entregar' && <DeliveryScreen />}

        {/* Fallback for other stages */}
        {(activeStage === 'preparar' || activeStage === 'procesar' || activeStage === 'revisar') && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center font-sans text-xs">
            <h3 className="text-sm font-semibold text-broadcast-textPrimary mb-1 capitalize">
              Fase: {activeStage}
            </h3>
            <p className="text-broadcast-textMuted mb-3 max-w-sm">
              Esta fase conecta con los procesos automáticos de ingesta y transcripción. Puedes pasar directamente a la fase de edición.
            </p>
            <button
              onClick={() => setActiveStage('editar')}
              className="px-3 py-1.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover border border-broadcast-border text-broadcast-textPrimary font-medium transition-colors"
            >
              Continuar a Edición
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
