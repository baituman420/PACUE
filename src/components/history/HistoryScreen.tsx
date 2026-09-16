import React from 'react';
import { History, HardDrive, CheckCircle2, User, Clock, FileCheck, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HistoryScreen: React.FC = () => {
  const { history } = useApp();

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-broadcast-border">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-broadcast-accent" />
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
              Histórico de Entregas Audiovisuales
            </h1>
          </div>
          <p className="text-xs text-broadcast-textMuted mt-1">
            Registro y trazabilidad de todos los másteres de subtitulado completados
          </p>
        </div>

        <div className="text-xs font-mono text-broadcast-textMuted">
          Total entregados: <strong className="text-broadcast-accent">{history.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="bg-broadcast-panel border border-broadcast-border rounded-lg overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-broadcast-darkest border-b border-broadcast-border text-broadcast-textMuted uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Proyecto</th>
              <th className="p-3.5">Cliente</th>
              <th className="p-3.5">Técnico</th>
              <th className="p-3.5">Inicio</th>
              <th className="p-3.5">Final</th>
              <th className="p-3.5">Duración</th>
              <th className="p-3.5">Formato</th>
              <th className="p-3.5">Archivo / Destino</th>
              <th className="p-3.5 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-broadcast-border/60">
            {history.map(item => (
              <tr key={item.id} className="hover:bg-broadcast-surface/50 transition-colors">
                <td className="p-3.5 font-sans font-bold text-white">
                  {item.projectTitle}
                </td>
                <td className="p-3.5 text-broadcast-accent font-semibold">
                  {item.clientName}
                </td>
                <td className="p-3.5 text-broadcast-textPrimary">
                  {item.technician}
                </td>
                <td className="p-3.5 text-broadcast-textMuted">
                  {item.startedAt}
                </td>
                <td className="p-3.5 text-broadcast-textMuted">
                  {item.completedAt}
                </td>
                <td className="p-3.5 text-[#D8D1C5] font-semibold">
                  {item.durationFormatted}
                </td>
                <td className="p-3.5">
                  <span className="px-1.5 py-0.5 rounded bg-broadcast-surface text-white font-bold">
                    {item.format}
                  </span>
                </td>
                <td className="p-3.5">
                  <div className="text-white font-semibold">{item.fileName}</div>
                  <div className="text-[10px] text-broadcast-textMuted">{item.destinationFolder}</div>
                </td>
                <td className="p-3.5 text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#2B2722] text-[#D8D1C5] border border-[#3A352E]">
                    <CheckCircle2 className="w-3 h-3 text-[#D8D1C5]" />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
