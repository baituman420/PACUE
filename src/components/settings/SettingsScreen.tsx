import React from 'react';
import { Settings, Cpu, HardDrive, Network, Terminal, Info, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsScreen: React.FC = () => {
  const { qcProfile, setQCProfile } = useApp();

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-broadcast-border">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-broadcast-accent" />
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
              Configuración y Arquitectura de Integraciones
            </h1>
          </div>
          <p className="text-xs text-broadcast-textMuted mt-1">
            Conexiones preparadas para la fase de expansión operativa
          </p>
        </div>
      </div>

      {/* Integration Stubs Matrix (Section 20 of prompt) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Google Drive */}
        <div className="bg-broadcast-panel border border-broadcast-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-5 h-5 text-broadcast-accent" />
              <h3 className="text-sm font-bold text-white">Google Drive Connector</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-broadcast-surface text-amber-400 font-mono text-[10px]">
              STUB PREPARADO
            </span>
          </div>
          <p className="text-xs text-broadcast-textMuted mb-3">
            Entrada de archivos máster, enlace de streaming a vídeo y depósito de entregas finales.
          </p>
          <div className="bg-broadcast-darkest p-2.5 rounded text-[11px] font-mono text-[#D8D1C5]">
            src/services/integrations/index.ts → GoogleDriveConnector
          </div>
        </div>

        {/* Sonix */}
        <div className="bg-broadcast-panel border border-broadcast-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Network className="w-5 h-5 text-broadcast-accent" />
              <h3 className="text-sm font-bold text-white">Sonix Transcription Intake</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-broadcast-surface text-amber-400 font-mono text-[10px]">
              STUB PREPARADO
            </span>
          </div>
          <p className="text-xs text-broadcast-textMuted mb-3">
            Envío de audio/vídeo, recepción de transcript JSON, alineación de palabras, speakers y timecodes.
          </p>
          <div className="bg-broadcast-darkest p-2.5 rounded text-[11px] font-mono text-[#D8D1C5]">
            src/services/srtService.ts → normalizeSonixJSON()
          </div>
        </div>

        {/* Subtitle Edit CLI */}
        <div className="bg-broadcast-panel border border-broadcast-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-5 h-5 text-broadcast-accent" />
              <h3 className="text-sm font-bold text-white">Subtitle Edit CLI Bridge</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-broadcast-surface text-amber-400 font-mono text-[10px]">
              STUB PREPARADO
            </span>
          </div>
          <p className="text-xs text-broadcast-textMuted mb-3">
            Motor de conversión binaria real de subtítulos profesionales: SRT → PAC, SRT → EBU-STL.
          </p>
          <div className="bg-broadcast-darkest p-2.5 rounded text-[11px] font-mono text-[#D8D1C5]">
            src/services/integrations/index.ts → SubtitleEditCliBridge
          </div>
        </div>

        {/* FFmpeg / ffprobe */}
        <div className="bg-broadcast-panel border border-broadcast-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-broadcast-accent" />
              <h3 className="text-sm font-bold text-white">FFmpeg & ffprobe Probe</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-broadcast-surface text-amber-400 font-mono text-[10px]">
              STUB PREPARADO
            </span>
          </div>
          <p className="text-xs text-broadcast-textMuted mb-3">
            Análisis de media: duración de vídeo a nivel de frame, framerate real, resolución y canales de audio.
          </p>
          <div className="bg-broadcast-darkest p-2.5 rounded text-[11px] font-mono text-[#D8D1C5]">
            src/services/integrations/index.ts → FFmpegProbeConnector
          </div>
        </div>
      </div>

      {/* QC Profile Tuning */}
      <div className="bg-broadcast-panel border border-broadcast-border rounded-lg p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-2">Perfil de Control de Calidad Activo</h3>
        <p className="text-xs text-broadcast-textMuted mb-4">
          Ajusta los umbrales del motor QC para validar la reactividad en tiempo real:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="block text-broadcast-textMuted mb-1">CPS Máximo:</label>
            <input
              type="number"
              value={qcProfile.maxCps}
              onChange={(e) => setQCProfile({ ...qcProfile, maxCps: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-broadcast-darkest rounded border border-broadcast-border text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-broadcast-textMuted mb-1">Duración Mínima (ms):</label>
            <input
              type="number"
              value={qcProfile.minDurationMs}
              onChange={(e) => setQCProfile({ ...qcProfile, minDurationMs: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-broadcast-darkest rounded border border-broadcast-border text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-broadcast-textMuted mb-1">Máx Caracteres / Línea:</label>
            <input
              type="number"
              value={qcProfile.maxCharactersPerLine}
              onChange={(e) => setQCProfile({ ...qcProfile, maxCharactersPerLine: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-broadcast-darkest rounded border border-broadcast-border text-white font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
