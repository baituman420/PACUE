import React from 'react';
import { Building2, Settings, ShieldCheck, Folder, Wrench, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ClientsScreen: React.FC = () => {
  const { clients } = useApp();

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-broadcast-border">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-broadcast-accent" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Perfiles de Clientes y Entrega
            </h1>
          </div>
          <p className="text-xs text-broadcast-textMuted mt-1">
            Configuración técnica y normativas de subtitulado por cliente
          </p>
        </div>

        <div className="text-xs text-broadcast-textMuted font-mono">
          Perfiles activos: <strong className="text-broadcast-accent">{Object.keys(clients).length}</strong>
        </div>
      </div>

      {/* Demo notice alert */}
      <div className="mb-6 p-3.5 rounded bg-broadcast-panel border border-broadcast-border flex items-center gap-3 text-xs text-broadcast-textMuted">
        <Info className="w-4 h-4 text-broadcast-accent flex-shrink-0" />
        <span>
          <strong>Nota de demostración:</strong> Las especificaciones técnicas de RTVE y Amazon son modelos de prueba simulados para esta versión de PACUE y no representan contratos formales.
        </span>
      </div>

      {/* Grid of Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(clients).map(client => (
          <div
            key={client.id}
            className="bg-broadcast-panel border border-broadcast-border rounded-lg p-6 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-white tracking-wide">
                  {client.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-broadcast-surface text-broadcast-accent font-mono text-xs font-bold">
                  {client.code}
                </span>
              </div>

              {/* Technical Presets */}
              <div className="space-y-2.5 text-xs font-mono py-3 border-t border-b border-broadcast-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-broadcast-textMuted">Servicio habitual:</span>
                  <span className="text-[#D8D1C5] font-semibold">{client.serviceDefault}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-broadcast-textMuted">Formato de salida:</span>
                  <span className="text-white font-bold">{client.outputFormat}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-broadcast-textMuted">FPS habitual:</span>
                  <span className="text-white font-semibold">{client.defaultFps} fps</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-broadcast-textMuted">Herramientas compatibles:</span>
                  <span className="text-white">{client.tools.join(', ')}</span>
                </div>
              </div>

              {/* Delivery folder */}
              <div className="mt-3 p-2.5 rounded bg-broadcast-darkest border border-broadcast-border text-xs font-mono">
                <div className="text-broadcast-textMuted text-[10px] uppercase mb-1">Carpeta de entrega:</div>
                <div className="text-broadcast-accent font-semibold">{client.deliveryFolder}</div>
              </div>

              {/* QC Profile Rules */}
              <div className="mt-4">
                <div className="text-xs font-mono uppercase text-broadcast-accent mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Reglas QC Configurables ({client.qcProfile.name}):</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-broadcast-darkest p-2.5 rounded border border-broadcast-border/60">
                  <div className="text-broadcast-textMuted">
                    Límite CPS: <strong className="text-white">{client.qcProfile.maxCps}</strong>
                  </div>
                  <div className="text-broadcast-textMuted">
                    Duración mín: <strong className="text-white">{client.qcProfile.minDurationMs}ms</strong>
                  </div>
                  <div className="text-broadcast-textMuted">
                    Duración máx: <strong className="text-white">{client.qcProfile.maxDurationMs}ms</strong>
                  </div>
                  <div className="text-broadcast-textMuted">
                    Máx. car/línea: <strong className="text-white">{client.qcProfile.maxCharactersPerLine}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-broadcast-border text-[11px] text-broadcast-textMuted">
              {client.notes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
