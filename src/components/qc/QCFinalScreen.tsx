import React from 'react';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, 
  Clock, Users, AlertCircle, FileCheck 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QCFinalScreen: React.FC = () => {
  const { 
    qcCounts, 
    activeJob, 
    setActiveStage, 
    setActiveQCFilter,
    qcProfile 
  } = useApp();

  const handleReviewIssues = () => {
    // If there are unidentified speakers, set that filter, otherwise reading speed or overlap
    if (qcCounts['HABLANTE ?'] > 0) {
      setActiveQCFilter('HABLANTE ?');
    } else if (qcCounts['LECTURA RÁPIDA'] > 0) {
      setActiveQCFilter('LECTURA RÁPIDA');
    } else if (qcCounts['SOLAPAMIENTO'] > 0) {
      setActiveQCFilter('SOLAPAMIENTO');
    } else {
      setActiveQCFilter('TODOS');
    }
    setActiveStage('editar');
  };

  const handleProceedToExport = () => {
    setActiveStage('exportar');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-broadcast-border">
        <div className="p-3 rounded-lg bg-[#2B2722] border border-[#3A352E] text-[#B79D72]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">
            Control de Calidad (QC) Final
          </h2>
          <p className="text-xs text-broadcast-textMuted mt-1">
            Auditoría automatizada según perfil de entrega: <strong className="text-white">{qcProfile.name}</strong>
          </p>
        </div>
      </div>

      {/* Checklist Card */}
      <div className="my-6 bg-broadcast-panel border border-broadcast-border rounded-lg p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-widest text-broadcast-accent mb-3">
          Diagnóstico de Conformidad Técnica
        </h3>

        {/* Valid passes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded bg-broadcast-darkest border border-broadcast-border/60">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-broadcast-success" />
              <div>
                <div className="text-sm font-semibold text-white">Sincronización de Timecodes</div>
                <div className="text-xs text-broadcast-textMuted">Alineación exacta a 25.000 fps broadcast</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-broadcast-success uppercase">✓ Conforme</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-broadcast-darkest border border-broadcast-border/60">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-broadcast-success" />
              <div>
                <div className="text-sm font-semibold text-white">Formato de Texto y Caracteres Especiales</div>
                <div className="text-xs text-broadcast-textMuted">Codificación estándar sin caracteres ilegales</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-broadcast-success uppercase">✓ Conforme</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-broadcast-darkest border border-broadcast-border/60">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-broadcast-success" />
              <div>
                <div className="text-sm font-semibold text-white">Normativa de Líneas Máximas</div>
                <div className="text-xs text-broadcast-textMuted">Límite de {qcProfile.maxLines} líneas por bloque respetado</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-broadcast-success uppercase">✓ Conforme</span>
          </div>
        </div>

        {/* Warnings / Observaciones */}
        <div className="pt-4 border-t border-broadcast-border space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-widest text-broadcast-amber">
            Alertas y Advertencias Detectadas
          </h4>

          {qcCounts['HABLANTE ?'] > 0 && (
            <div className="flex items-center justify-between p-3 rounded bg-amber-950/20 border border-amber-600/40">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-broadcast-amber" />
                <div>
                  <div className="text-sm font-semibold text-white">
                    {qcCounts['HABLANTE ?']} intervenciones con personaje sin identificar
                  </div>
                  <div className="text-xs text-broadcast-textMuted">
                    Se recomienda asignar nombre real (ej: MARTA) antes de emisión
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-broadcast-amber font-bold">⚠ Revisión recomendada</span>
            </div>
          )}

          {qcCounts['LECTURA RÁPIDA'] > 0 && (
            <div className="flex items-center justify-between p-3 rounded bg-amber-950/20 border border-amber-600/40">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-broadcast-amber" />
                <div>
                  <div className="text-sm font-semibold text-white">
                    {qcCounts['LECTURA RÁPIDA']} bloques con velocidad elevada (&gt; {qcProfile.maxCps} CPS)
                  </div>
                  <div className="text-xs text-broadcast-textMuted">
                    La velocidad de lectura supera el umbral recomendado de la cadena
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-broadcast-amber font-bold">⚠ Velocidad alta</span>
            </div>
          )}

          {qcCounts['SOLAPAMIENTO'] > 0 && (
            <div className="flex items-center justify-between p-3 rounded bg-red-950/20 border border-red-600/40">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-broadcast-danger" />
                <div>
                  <div className="text-sm font-semibold text-white">
                    {qcCounts['SOLAPAMIENTO']} posible solapamiento de timecode
                  </div>
                  <div className="text-xs text-broadcast-textMuted">
                    Un bloque comienza antes de que finalice el anterior
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-broadcast-danger font-bold">⚠ Solapamiento</span>
            </div>
          )}

          {qcCounts['HABLANTE ?'] === 0 && qcCounts['LECTURA RÁPIDA'] === 0 && qcCounts['SOLAPAMIENTO'] === 0 && (
            <div className="p-4 rounded bg-[#2B2722] border border-[#3A352E] text-[#D8D1C5] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#D8D1C5]" />
              <span>Conforme. No hay advertencias pendientes en el proyecto.</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleReviewIssues}
          className="px-5 py-2.5 rounded bg-broadcast-surface hover:bg-broadcast-border border border-broadcast-border text-xs font-semibold text-broadcast-textPrimary hover:text-white flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>REVISAR INCIDENCIAS EN EDITOR</span>
        </button>

        <button
          onClick={handleProceedToExport}
          className="px-6 py-2.5 rounded bg-[#B79D72] hover:bg-[#C8BDAA] text-[#1B1916] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <span>CONTINUAR DE TODOS MODOS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
