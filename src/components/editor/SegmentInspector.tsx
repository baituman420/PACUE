import React, { useState, useEffect } from 'react';
import { 
  Play, AlertTriangle, ChevronRight, ChevronLeft,
  BookOpen, SlidersHorizontal, Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseAnyTimecodeToSeconds } from '../../services/srtService';
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

  // Empty state when no segment is selected (Contextual, calm)
  if (!selectedSegment) {
    return (
      <div className="h-full bg-broadcast-panel border-l border-broadcast-border flex flex-col items-center justify-center p-6 text-center text-broadcast-textMuted text-xs select-none font-sans">
        <SlidersHorizontal className="w-6 h-6 text-broadcast-border mb-2.5 opacity-60" />
        <p className="font-medium text-broadcast-textSecondary text-xs">Sin bloque seleccionado</p>
        <p className="text-[11px] mt-1 text-broadcast-textMuted max-w-[200px] leading-relaxed">
          Selecciona un subtítulo en la línea temporal para editar su texto y sincronización
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
  const lineLengths = lines.map(l => l.length).join(' / ');

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
    <div className="h-full bg-broadcast-panel border-l border-broadcast-border flex flex-col justify-between overflow-y-auto p-4 space-y-4 select-none font-sans text-xs">
      {/* 1. SPEAKER NAME & NAVIGATION (CLEAN & PROMINENT) */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          {/* Speaker button: clear, prominent name without heavy border box */}
          <button
            onClick={onOpenSpeakersModal}
            className="text-sm font-semibold tracking-wide uppercase hover:underline transition-colors flex items-center gap-1.5"
            style={{ color: speaker?.color || '#AAA49A' }}
            title="Cambiar o configurar personaje"
          >
            <span>{speaker?.displayName || selectedSegment.speakerId}</span>
          </button>
          <span className="text-[11px] font-mono text-broadcast-textMuted">
            #{selectedSegment.number}
          </span>
        </div>

        {/* Previous / Next block navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePlayBlock}
            className="p-1 rounded hover:bg-broadcast-surface text-broadcast-textSecondary hover:text-broadcast-textPrimary transition-colors"
            title="Reproducir bloque"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
          <button
            onClick={jumpToPrevSegment}
            className="p-1 rounded hover:bg-broadcast-surface text-broadcast-textMuted hover:text-broadcast-textPrimary transition-colors"
            title="Bloque anterior (↑)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={jumpToNextSegment}
            className="p-1 rounded hover:bg-broadcast-surface text-broadcast-textMuted hover:text-broadcast-textPrimary transition-colors"
            title="Bloque siguiente (↓)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. TEXT EDITING AREA: AMPLA Y CÓMODA */}
      <div className="space-y-1.5 flex-1 flex flex-col min-h-[110px]">
        <textarea
          value={selectedSegment.text}
          onChange={(e) => updateSegmentText(selectedSegment.id, e.target.value)}
          rows={4}
          className="w-full flex-1 bg-broadcast-surface px-3 py-2.5 rounded text-base text-broadcast-textPrimary font-sans focus:outline-none focus:ring-1 focus:ring-broadcast-accent resize-none leading-relaxed select-text border border-broadcast-border"
          placeholder="Texto del subtítulo..."
        />
        <div className="flex items-center justify-between text-[11px] text-broadcast-textMuted px-1">
          <span>{lines.length} {lines.length === 1 ? 'línea' : 'líneas'}</span>
          <span className="font-mono">{lineLengths} caracteres</span>
        </div>
      </div>

      {/* 3. COMPACT METRICS ROW: IN | OUT | DURACIÓN | CPS (IN A SINGLE STRIP) */}
      <div className="bg-broadcast-darkest px-2 sm:px-3 py-2 rounded flex items-center justify-between text-xs border border-broadcast-border/60 overflow-x-auto">
        {/* IN */}
        <div className="flex flex-col flex-shrink-0">
          <span className="text-[10px] text-broadcast-textMuted">IN</span>
          <input
            type="text"
            value={inInput}
            onChange={(e) => setInInput(e.target.value)}
            onBlur={handleInSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleInSubmit()}
            className="w-16 sm:w-20 bg-transparent font-mono text-xs font-semibold text-broadcast-textPrimary focus:outline-none focus:text-white"
          />
        </div>

        <span className="text-broadcast-border px-1">|</span>

        {/* OUT */}
        <div className="flex flex-col flex-shrink-0">
          <span className="text-[10px] text-broadcast-textMuted">OUT</span>
          <input
            type="text"
            value={outInput}
            onChange={(e) => setOutInput(e.target.value)}
            onBlur={handleOutSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleOutSubmit()}
            className="w-16 sm:w-20 bg-transparent font-mono text-xs font-semibold text-broadcast-textPrimary focus:outline-none focus:text-white"
          />
        </div>

        <span className="text-broadcast-border px-1">|</span>

        {/* DURACIÓN */}
        <div className="flex flex-col flex-shrink-0">
          <span className="text-[10px] text-broadcast-textMuted">DURACIÓN</span>
          <span className="font-mono text-xs font-semibold text-broadcast-textPrimary">
            {duration.toFixed(2)}s <span className="text-[10px] text-broadcast-textMuted">({totalFrames}f)</span>
          </span>
        </div>

        <span className="text-broadcast-border px-1">|</span>

        {/* CPS */}
        <div className="flex flex-col flex-shrink-0">
          <span className="text-[10px] text-broadcast-textMuted">CPS</span>
          <span className={`font-mono text-xs font-semibold ${
            isHighCps ? 'text-broadcast-amber font-bold' : 'text-broadcast-textSecondary'
          }`}>
            {cps}
          </span>
        </div>
      </div>

      {/* 4. SECONDARY TRIM & SLIP ACTIONS (QUIET & MINIMAL) */}
      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] pt-1">
        <div className="flex items-center gap-1 text-broadcast-textMuted">
          <button
            onClick={() => setSegmentInPoint(selectedSegment.id)}
            className="px-2 py-1 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textSecondary hover:text-broadcast-textPrimary transition-colors"
            title="Establecer IN en el cabezal actual [I]"
          >
            Set IN [I]
          </button>
          <button
            onClick={() => setSegmentOutPoint(selectedSegment.id)}
            className="px-2 py-1 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textSecondary hover:text-broadcast-textPrimary transition-colors"
            title="Establecer OUT en el cabezal actual [O]"
          >
            Set OUT [O]
          </button>
        </div>

        <div className="flex items-center gap-1 text-broadcast-textMuted font-mono text-[10px]">
          <button
            onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'both', -frameDuration)}
            className="px-1.5 py-1 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-broadcast-textPrimary"
            title="Mover 1 cuadro a la izquierda"
          >
            -1f
          </button>
          <button
            onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'both', frameDuration)}
            className="px-1.5 py-1 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-broadcast-textPrimary"
            title="Mover 1 cuadro a la derecha"
          >
            +1f
          </button>
          <button
            onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'both', -0.1)}
            className="px-1.5 py-1 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-broadcast-textPrimary"
            title="Mover 100ms a la izquierda"
          >
            -100ms
          </button>
          <button
            onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'both', 0.1)}
            className="px-1.5 py-1 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textMuted hover:text-broadcast-textPrimary"
            title="Mover 100ms a la derecha"
          >
            +100ms
          </button>
        </div>
      </div>

      {/* 5. QC WARNINGS (CALM & CONTEXTUAL) */}
      {selectedSegment.warnings && selectedSegment.warnings.length > 0 && (
        <div className="pt-2 border-t border-broadcast-border/60 space-y-1.5">
          {selectedSegment.warnings.map((w, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 text-[11px] text-broadcast-amber leading-tight">
              <div className="flex items-center gap-1.5 truncate">
                <AlertTriangle className="w-3 h-3 flex-shrink-0 opacity-80" />
                <span className="truncate">{w.message}</span>
              </div>
              {w.ruleId && (
                <button
                  onClick={() => openRule(w.ruleId!)}
                  className="px-1.5 py-0.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textSecondary hover:text-broadcast-textPrimary text-[10px] whitespace-nowrap transition-colors flex items-center gap-1"
                >
                  <BookOpen className="w-2.5 h-2.5" />
                  <span>Regla</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 6. SUBTLE FOOTER HELPER */}
      <div className="text-[10px] text-broadcast-textMuted text-center pt-1">
        [I] IN • [O] OUT • [Espacio] Play/Pausa
      </div>
    </div>
  );
};
