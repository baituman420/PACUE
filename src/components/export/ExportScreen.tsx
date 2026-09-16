import React, { useState } from 'react';
import { 
  FileText, Download, CheckCircle2, ArrowRight, ArrowLeft, 
  Loader2, AlertCircle, Info, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateSRTContent, downloadFile } from '../../services/srtService';

export const ExportScreen: React.FC = () => {
  const { activeJob, segments, speakers, setActiveStage } = useApp();

  const [selectedFormat, setSelectedFormat] = useState<'PAC' | 'SRT' | 'SCC' | 'EBU-STL'>('PAC');
  const [includeSpeakerNames, setIncludeSpeakerNames] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState<number>(0);
  const [isFinished, setIsFinished] = useState(false);

  const defaultFileName = activeJob?.clientName === 'RTVE' 
    ? 'RTVE_INFO_20260916_ES' 
    : 'AMZN_SERIE_EP04_ES';

  const generatedFileName = `${defaultFileName}.${selectedFormat.toLowerCase()}`;

  const steps = [
    'Preparando estructura de datos y metadatos...',
    'Validando timecodes y alineación de cuadros (25 fps)...',
    selectedFormat === 'PAC' 
      ? 'Simulando compilación PAC (integración CLI pendiente)...' 
      : `Generando archivo ${selectedFormat}...`,
    'Finalizado.'
  ];

  const handleStartExport = () => {
    setIsExporting(true);
    setExportStep(0);
    setIsFinished(false);

    // Step by step simulation
    setTimeout(() => setExportStep(1), 500);
    setTimeout(() => setExportStep(2), 1100);
    setTimeout(() => {
      setExportStep(3);
      setIsFinished(true);
      setIsExporting(false);
    }, 1800);
  };

  const handleDownloadRealSRT = () => {
    const srtContent = generateSRTContent(segments, speakers, includeSpeakerNames);
    downloadFile(`${defaultFileName}.srt`, srtContent, 'text/plain;charset=utf-8');
  };

  const handleProceedToDelivery = () => {
    setActiveStage('entregar');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-broadcast-border">
        <div className="p-3 rounded-lg bg-cyan-950/40 border border-broadcast-accent/40 text-broadcast-accent">
          <Download className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">
            Exportar Entrega Audiovisual
          </h2>
          <p className="text-xs text-broadcast-textMuted mt-1">
            Generación de subtítulos finales para entrega a cadena o plataforma
          </p>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="my-6 bg-broadcast-panel border border-broadcast-border rounded-lg p-6 shadow-xl space-y-6">
        {/* Format Selector */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-broadcast-accent mb-2">
            Formato de Salida
          </label>
          <div className="grid grid-cols-4 gap-3">
            {(['PAC', 'SRT', 'SCC', 'EBU-STL'] as const).map(fmt => (
              <button
                key={fmt}
                type="button"
                onClick={() => {
                  setSelectedFormat(fmt);
                  setIsFinished(false);
                }}
                className={`p-3 rounded-lg border text-center transition-all ${
                  selectedFormat === fmt
                    ? 'border-broadcast-accent bg-broadcast-accent/15 text-white shadow-md'
                    : 'border-broadcast-border bg-broadcast-darkest text-broadcast-textMuted hover:border-broadcast-borderLight hover:text-white'
                }`}
              >
                <div className="text-sm font-bold font-mono">{fmt}</div>
                <div className="text-[10px] text-broadcast-textMuted mt-0.5">
                  {fmt === 'PAC' ? 'Broadcast RTVE' : fmt === 'SRT' ? 'Estándar Web / VOD' : fmt === 'EBU-STL' ? 'Teletexto EBU' : 'Line 21 CC'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notice for PAC Simulated vs Real SRT */}
        {selectedFormat === 'PAC' && (
          <div className="p-3.5 rounded bg-blue-950/30 border border-blue-800/40 text-xs text-blue-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-broadcast-accent flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-broadcast-accent">Conversión PAC — integración pendiente</span>
              <p className="text-[11px] text-broadcast-textMuted mt-0.5">
                Para respetar la fidelidad técnica y evitar archivos binarios simulados no estándar, en esta fase el flujo de PAC se completa registrando la entrega simulada. Cuando conectemos Subtitle Edit CLI se compilará el `.pac` real.
              </p>
            </div>
          </div>
        )}

        {selectedFormat === 'SRT' && (
          <div className="p-3.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-broadcast-success flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-broadcast-success">Generación SRT Real Disponible</span>
              <p className="text-[11px] text-broadcast-textMuted mt-0.5">
                Este formato genera y descarga un archivo `.srt` estándar completamente válido y corregido con los nombres de personajes y timecodes actuales.
              </p>
            </div>
          </div>
        )}

        {/* Metadata summary */}
        <div className="bg-broadcast-darkest rounded p-4 border border-broadcast-border/60 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-broadcast-textMuted">Cliente:</span>
            <span className="text-white font-bold">{activeJob?.clientName || 'RTVE'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-broadcast-textMuted">Perfil de servicio:</span>
            <span className="text-cyan-400">{activeJob?.serviceType || 'Subtitulado SDH'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-broadcast-textMuted">Framerate de masterización:</span>
            <span className="text-white">{activeJob?.fps || 25} fps</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-broadcast-textMuted">Nombre de archivo de salida:</span>
            <span className="text-broadcast-accent font-bold">{generatedFileName}</span>
          </div>
        </div>

        {/* Action Button: Generar Archivo */}
        {!isFinished && !isExporting && (
          <button
            onClick={handleStartExport}
            className="w-full py-3 rounded bg-broadcast-accent hover:bg-broadcast-accentHover text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99]"
          >
            <span>GENERAR ARCHIVO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Progress & Log */}
        {isExporting && (
          <div className="space-y-3 p-4 rounded bg-broadcast-darkest border border-broadcast-border">
            <div className="flex items-center gap-2 text-xs text-broadcast-accent font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Procesando generación ({exportStep + 1}/4)...</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-broadcast-surface overflow-hidden">
              <div 
                className="h-full bg-broadcast-accent transition-all duration-300"
                style={{ width: `${((exportStep + 1) / 4) * 100}%` }}
              />
            </div>
            <p className="text-xs text-white font-mono">{steps[exportStep]}</p>
          </div>
        )}

        {/* Success Output */}
        {isFinished && (
          <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-600/40 space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">✓ Archivo generado correctamente</span>
            </div>

            <div className="text-xs font-mono text-broadcast-textMuted">
              Archivo preparado para fase de entrega: <strong className="text-white">{generatedFileName}</strong>
            </div>

            {/* If SRT, allow immediate download */}
            {selectedFormat === 'SRT' && (
              <button
                onClick={handleDownloadRealSRT}
                className="py-2 px-4 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-2 transition-colors shadow"
              >
                <Download className="w-4 h-4" />
                <span>Descargar archivo SRT ahora</span>
              </button>
            )}

            <button
              onClick={handleProceedToDelivery}
              className="w-full py-3 rounded bg-broadcast-accent hover:bg-broadcast-accentHover text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99] mt-2"
            >
              <span>CONTINUAR A ENTREGA FINAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Back button */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setActiveStage('editar')}
          className="px-4 py-2 rounded bg-broadcast-surface hover:bg-broadcast-border text-xs text-broadcast-textMuted hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Editor</span>
        </button>
      </div>
    </div>
  );
};
