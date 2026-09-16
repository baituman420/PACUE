import React, { useState, useEffect } from 'react';
import { 
  Play, AlertTriangle, ChevronRight, ChevronLeft,
  BookOpen, SlidersHorizontal, CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseAnyTimecodeToSeconds, secondsToDisplayTime } from '../../services/srtService';
import { calculateCPS } from '../../services/qcService';

interface SegmentInspectorProps {
  onOpenSpeakersModal?: () => void;
}

export const SegmentInspector: React.FC<SegmentInspectorProps> = ({ onOpenSpeakersModal }) => {
  const {
    selectedSegment,
    speakers,
    updateSegmentText,
    updateSegmentTimecodes,
    setSegmentInPoint,
    setSegmentOutPoint,
    nudgeSegmentTimecode,
    jumpToPrevSegment,
    jumpToNextSegment,
    seekVideo,
    setIsPlaying,
    qcProfile,
    activeJob,
    openRule
  } = useApp();

  const [inInput, setInInput] = useState('');
  const [outInput, setOutInput] = useState('');

  const fps = activeJob?.fps || 25;
  const frameDuration = 1 / fps; // 0.040s

  useEffect(() => {
    if (selectedSegment) {
      setInInput(selectedSegment.startTime);
      setOutInput(selectedSegment.endTime);
    }
  }, [selectedSegment?.id, selectedSegment?.startTime, selectedSegment?.endTime]);

  // Empty state when no segment is selected
  if (!selectedSegment) {
    return (
      <div className="h-full bg-broadcast-panel border-l border-broadcast-border flex flex-col items-center justify-center p-6 text-center text-broadcast-textMuted text-xs select-none">
        <SlidersHorizontal className="w-7 h-7 text-broadcast-border mb-3" />
        <p className="font-semibold text-broadcast-textPrimary text-sm">Sin selección</p>
        <p className="text-xs mt-1 text-broadcast-textMuted max-w-[220px]">
          Selecciona un subtítulo en la línea temporal para editar su texto, puntos IN/OUT y verificar QC
        </p>
      </div>
    );
  }

  const speaker = speakers[selectedSegment.speakerId];
  const duration = Math.max(0.01, selectedSegment.endSeconds - selectedSegment.startSeconds);
  const cps = calculateCPS(selectedSegment.text, duration);
  const isHighCps = cps > qcProfile.maxCps;
  const totalFrames = Math.round(duration * fps);

  // Line metrics
  const lines = selectedSegment.text.split('\n');
  const lineStats = lines.map(l => l.length).join(' / ');

  const handleInSubmit = () => {
    const parsed = parseAnyTimecodeToSeconds(inInput, fps);
    if (!isNaN(parsed) && parsed >= 0) {
      updateSegmentTimecodes(selectedSegment.id, parsed, selectedSegment.endSeconds);
    } else {
      setInInput(selectedSegment.startTime);
    }
  };

  const handleOutSubmit = () => {
    const parsed = parseAnyTimecodeToSeconds(outInput, fps);
    if (!isNaN(parsed) && parsed > selectedSegment.startSeconds) {
      updateSegmentTimecodes(selectedSegment.id, selectedSegment.startSeconds, parsed);
    } else {
      setOutInput(selectedSegment.endTime);
    }
  };

  const handlePlayBlock = () => {
    seekVideo(selectedSegment.startSeconds);
    setIsPlaying(true);
  };

  return (
    <div className="h-full bg-broadcast-panel border-l border-broadcast-border flex flex-col justify-between overflow-y-auto p-3.5 space-y-3 select-none text-xs">
      {/* 1. COMPACT TOP HEADER: Block Number, Speaker Tag, Prev/Next, Play */}
      <div className="pb-2.5 border-b border-broadcast-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-teal-400 text-xs">
            #{selectedSegment.number}
          </span>

          {/* Speaker Button */}
          <button
            onClick={onOpenSpeakersModal}
            className="px-2 py-0.5 rounded text-[11px] font-medium border transition-colors hover:brightness-110 truncate max-w-[120px]"
            style={{
              backgroundColor: speaker?.color ? `${speaker.color}15` : '#14b8a615',
              borderColor: speaker?.color ? `${speaker.color}40` : '#14b8a640',
              color: speaker?.color || '#14b8a6',
            }}
            title="Asignar o editar personaje"
          >
            {speaker?.displayName || selectedSegment.speakerId}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Play Block */}
          <button
            onClick={handlePlayBlock}
            className="p-1 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover border border-broadcast-border text-teal-400 hover:text-white transition-colors"
            title="Reproducir bloque seleccionado"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* Navigation between blocks */}
          <div className="flex items-center border border-broadcast-border rounded bg-broadcast-surface overflow-hidden">
            <button
              onClick={jumpToPrevSegment}
              className="p-1 hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-white transition-colors"
              title="Subtítulo anterior (↑)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={jumpToNextSegment}
              className="p-1 hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-white transition-colors"
              title="Subtítulo siguiente (↓)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. TEXTO EDITABLE PRIMERO (MÁXIMA ACCESIBILIDAD PARA EL TÉCNICO) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-broadcast-textMuted">Texto del Subtítulo</span>
          <span className="font-mono text-[10px] text-broadcast-textMuted">
            {lineStats} car. ({lines.length} {lines.length === 1 ? 'línea' : 'líneas'})
          </span>
        </div>
        <textarea
          value={selectedSegment.text}
          onChange={(e) => updateSegmentText(selectedSegment.id, e.target.value)}
          rows={3}
          className="w-full bg-broadcast-darkest px-3 py-2 rounded border border-broadcast-border text-sm text-broadcast-textPrimary font-sans focus:outline-none focus:border-teal-500/80 resize-none leading-relaxed transition-colors select-text"
          placeholder="Texto del subtítulo..."
        />
      </div>

      {/* 3. TIMECODES & MÉTRICAS (IN, OUT, DURACIÓN, CPS) */}
      <div className="space-y-2 pt-1">
        {/* IN & OUT SIDE BY SIDE */}
        <div className="grid grid-cols-2 gap-2">
          {/* PUNTO IN */}
          <div className="bg-broadcast-darkest p-2 rounded border border-broadcast-border space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-teal-400 font-medium">IN</span>
              <button
                onClick={() => seekVideo(selectedSegment.startSeconds)}
                className="text-broadcast-textMuted hover:text-white underline"
              >
                Ir
              </button>
            </div>
            <input
              type="text"
              value={inInput}
              onChange={(e) => setInInput(e.target.value)}
              onBlur={handleInSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleInSubmit()}
              className="w-full px-2 py-0.5 bg-broadcast-surface rounded border border-broadcast-border font-mono text-xs text-white font-semibold focus:border-teal-500 focus:outline-none"
            />
            <div className="flex items-center gap-1 pt-0.5">
              <button
                onClick={() => setSegmentInPoint(selectedSegment.id)}
                className="flex-1 py-0.5 rounded bg-teal-950/70 hover:bg-teal-900/70 text-teal-300 border border-teal-700/30 text-[10px] font-sans font-medium"
                title="Fijar IN en cabezal actual [I]"
              >
                SET [I]
              </button>
              <button
                onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'in', -frameDuration)}
                className="px-1.5 py-0.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-white font-mono text-[10px]"
                title="-1 frame (-40ms)"
              >
                -1f
              </button>
              <button
                onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'in', frameDuration)}
                className="px-1.5 py-0.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-white font-mono text-[10px]"
                title="+1 frame (+40ms)"
              >
                +1f
              </button>
            </div>
          </div>

          {/* PUNTO OUT */}
          <div className="bg-broadcast-darkest p-2 rounded border border-broadcast-border space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-teal-400 font-medium">OUT</span>
              <button
                onClick={() => seekVideo(selectedSegment.endSeconds)}
                className="text-broadcast-textMuted hover:text-white underline"
              >
                Ir
              </button>
            </div>
            <input
              type="text"
              value={outInput}
              onChange={(e) => setOutInput(e.target.value)}
              onBlur={handleOutSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleOutSubmit()}
              className="w-full px-2 py-0.5 bg-broadcast-surface rounded border border-broadcast-border font-mono text-xs text-white font-semibold focus:border-teal-500 focus:outline-none"
            />
            <div className="flex items-center gap-1 pt-0.5">
              <button
                onClick={() => setSegmentOutPoint(selectedSegment.id)}
                className="flex-1 py-0.5 rounded bg-teal-950/70 hover:bg-teal-900/70 text-teal-300 border border-teal-700/30 text-[10px] font-sans font-medium"
                title="Fijar OUT en cabezal actual [O]"
              >
                SET [O]
              </button>
              <button
                onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'out', -frameDuration)}
                className="px-1.5 py-0.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-white font-mono text-[10px]"
                title="-1 frame (-40ms)"
              >
                -1f
              </button>
              <button
                onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'out', frameDuration)}
                className="px-1.5 py-0.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-white font-mono text-[10px]"
                title="+1 frame (+40ms)"
              >
                +1f
              </button>
            </div>
          </div>
        </div>

        {/* METRICS ROW: DURACIÓN & CPS */}
        <div className="grid grid-cols-2 gap-2 bg-broadcast-darkest p-2 rounded border border-broadcast-border">
          <div>
            <span className="text-[10px] text-broadcast-textMuted block">DURACIÓN</span>
            <div className="font-mono text-sm font-semibold text-white mt-0.5">
              {duration.toFixed(3)}s
            </div>
            <span className="text-[10px] text-broadcast-textMuted font-mono">
              {totalFrames} frames
            </span>
          </div>

          <div>
            <span className="text-[10px] text-broadcast-textMuted block">VELOCIDAD</span>
            <div className={`font-mono text-sm font-semibold mt-0.5 ${
              isHighCps ? 'text-amber-400 font-bold' : 'text-broadcast-textPrimary'
            }`}>
              {cps} CPS
            </div>
            <span className={`text-[10px] ${isHighCps ? 'text-amber-400/80' : 'text-broadcast-textMuted'}`}>
              {isHighCps ? `Excede máx. ${qcProfile.maxCps}` : `Límite: ${qcProfile.maxCps} CPS`}
            </span>
          </div>
        </div>

        {/* SLIP / DESPLAZAMIENTO RÁPIDO */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-broadcast-darkest border border-broadcast-border text-[11px]">
          <span className="text-broadcast-textMuted">Desplazar bloque (Slip):</span>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <button
              onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'both', -0.1)}
              className="px-2 py-0.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-white"
              title="Retroceder 100ms"
            >
              -100ms
            </button>
            <button
              onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'both', 0.1)}
              className="px-2 py-0.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-white"
              title="Avanzar 100ms"
            >
              +100ms
            </button>
          </div>
        </div>
      </div>

      {/* 4. ADVERTENCIAS QC CON ENLACE DIRECTO VER REGLA */}
      {selectedSegment.warnings && selectedSegment.warnings.length > 0 && (
        <div className="p-2.5 rounded bg-amber-950/20 border border-amber-800/30 space-y-1.5">
          <div className="text-[10px] font-semibold text-amber-400 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Incidencias QC ({selectedSegment.warnings.length}):</span>
          </div>
          {selectedSegment.warnings.map((w, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 text-[11px] text-amber-200/90 leading-tight pt-1 border-t border-amber-800/20 first:border-0 first:pt-0">
              <span className="truncate">{w.message}</span>
              {w.ruleId && (
                <button
                  onClick={() => openRule(w.ruleId!)}
                  className="px-1.5 py-0.5 rounded bg-amber-900/50 hover:bg-amber-800/70 text-amber-300 text-[10px] font-medium whitespace-nowrap flex items-center gap-1 transition-colors"
                  title="Consultar la regla asociada"
                >
                  <BookOpen className="w-2.5 h-2.5" />
                  <span>VER REGLA</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 5. FOOTER DE ATAJOS RÁPIDOS */}
      <div className="text-[10px] text-broadcast-textMuted text-center pt-2 border-t border-broadcast-border">
        <span className="font-mono">[I]</span> IN • <span className="font-mono">[O]</span> OUT • <span className="font-mono">[Espacio]</span> Play/Pausa
      </div>
    </div>
  );
};
