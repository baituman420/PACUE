import React, { useState, useEffect } from 'react';
import { 
  Play, Users, AlertTriangle, Check, ArrowRight, CornerDownLeft, 
  RotateCcw, SlidersHorizontal, Sparkles, ChevronRight, ChevronLeft 
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
    activeJob
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

  if (!selectedSegment) {
    return (
      <div className="h-full bg-broadcast-panel border-l border-broadcast-border flex flex-col items-center justify-center p-6 text-center text-broadcast-textMuted text-xs">
        <SlidersHorizontal className="w-8 h-8 text-broadcast-border mb-2" />
        <p className="font-semibold text-white">Ningún bloque seleccionado</p>
        <p className="text-[11px] mt-1 text-broadcast-textMuted">
          Haz clic sobre un bloque en la línea temporal para inspeccionar y editar sus timecodes
        </p>
      </div>
    );
  }

  const speaker = speakers[selectedSegment.speakerId];
  const duration = Math.max(0.01, selectedSegment.endSeconds - selectedSegment.startSeconds);
  const cps = calculateCPS(selectedSegment.text, duration);
  const isHighCps = cps > qcProfile.maxCps;
  const totalFrames = Math.round(duration * fps);

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
    <div className="h-full bg-broadcast-panel border-l border-broadcast-border flex flex-col justify-between select-none overflow-y-auto p-4 space-y-4">
      {/* Top Header */}
      <div className="pb-3 border-b border-broadcast-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-broadcast-accent">
              BLOQUE #{selectedSegment.number}
            </span>
            {/* Prev / Next buttons */}
            <div className="flex items-center border border-broadcast-border rounded overflow-hidden">
              <button
                onClick={jumpToPrevSegment}
                className="p-1 hover:bg-broadcast-surface text-broadcast-textMuted hover:text-white"
                title="Bloque anterior (↑)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={jumpToNextSegment}
                className="p-1 hover:bg-broadcast-surface text-broadcast-textMuted hover:text-white"
                title="Bloque siguiente (↓)"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Speaker button */}
          <button
            onClick={onOpenSpeakersModal}
            className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide font-mono transition-transform hover:scale-105"
            style={{
              backgroundColor: speaker?.color ? `${speaker.color}25` : '#38bdf825',
              color: speaker?.color || '#38bdf8',
              border: `1px solid ${speaker?.color || '#38bdf8'}50`
            }}
            title="Cambiar o asignar personaje"
          >
            {speaker?.displayName || selectedSegment.speakerId}
          </button>
        </div>

        {/* Quick Play Selection */}
        <button
          onClick={handlePlayBlock}
          className="w-full py-1.5 px-3 rounded bg-broadcast-surface hover:bg-broadcast-border border border-broadcast-border text-xs text-broadcast-accent font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Reproducir Bloque</span>
        </button>
      </div>

      {/* Timecode Controls Matrix */}
      <div className="space-y-3">
        {/* IN POINT */}
        <div className="bg-broadcast-darkest p-2.5 rounded border border-broadcast-border space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-cyan-400 font-bold uppercase">PUNTO IN</span>
            <button
              onClick={() => seekVideo(selectedSegment.startSeconds)}
              className="text-[10px] text-broadcast-textMuted hover:text-white underline"
            >
              Ir a IN
            </button>
          </div>

          <input
            type="text"
            value={inInput}
            onChange={(e) => setInInput(e.target.value)}
            onBlur={handleInSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleInSubmit();
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-full px-2.5 py-1 bg-broadcast-surface rounded border border-broadcast-border font-mono text-sm font-bold text-white focus:border-broadcast-accent focus:outline-none"
          />

          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => setSegmentInPoint(selectedSegment.id)}
              className="flex-1 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/40 text-[10px] font-mono font-bold flex items-center justify-center gap-1"
              title="Establecer IN en la posición actual del vídeo (I)"
            >
              <span>SET IN</span>
              <span className="px-1 rounded bg-black/40 text-white">[I]</span>
            </button>
            <button
              onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'in', -frameDuration)}
              className="px-2 py-1 rounded bg-broadcast-surface hover:bg-broadcast-border text-broadcast-textMuted hover:text-white font-mono text-[10px]"
              title="-1 frame (-40ms)"
            >
              -1f
            </button>
            <button
              onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'in', frameDuration)}
              className="px-2 py-1 rounded bg-broadcast-surface hover:bg-broadcast-border text-broadcast-textMuted hover:text-white font-mono text-[10px]"
              title="+1 frame (+40ms)"
            >
              +1f
            </button>
          </div>
        </div>

        {/* OUT POINT */}
        <div className="bg-broadcast-darkest p-2.5 rounded border border-broadcast-border space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-cyan-400 font-bold uppercase">PUNTO OUT</span>
            <button
              onClick={() => seekVideo(selectedSegment.endSeconds)}
              className="text-[10px] text-broadcast-textMuted hover:text-white underline"
            >
              Ir a OUT
            </button>
          </div>

          <input
            type="text"
            value={outInput}
            onChange={(e) => setOutInput(e.target.value)}
            onBlur={handleOutSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleOutSubmit();
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-full px-2.5 py-1 bg-broadcast-surface rounded border border-broadcast-border font-mono text-sm font-bold text-white focus:border-broadcast-accent focus:outline-none"
          />

          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => setSegmentOutPoint(selectedSegment.id)}
              className="flex-1 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/40 text-[10px] font-mono font-bold flex items-center justify-center gap-1"
              title="Establecer OUT en la posición actual del vídeo (O)"
            >
              <span>SET OUT</span>
              <span className="px-1 rounded bg-black/40 text-white">[O]</span>
            </button>
            <button
              onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'out', -frameDuration)}
              className="px-2 py-1 rounded bg-broadcast-surface hover:bg-broadcast-border text-broadcast-textMuted hover:text-white font-mono text-[10px]"
              title="-1 frame (-40ms)"
            >
              -1f
            </button>
            <button
              onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'out', frameDuration)}
              className="px-2 py-1 rounded bg-broadcast-surface hover:bg-broadcast-border text-broadcast-textMuted hover:text-white font-mono text-[10px]"
              title="+1 frame (+40ms)"
            >
              +1f
            </button>
          </div>
        </div>

        {/* METRICS: DURATION & CPS */}
        <div className="grid grid-cols-2 gap-2 bg-broadcast-darkest p-2.5 rounded border border-broadcast-border text-xs font-mono">
          <div>
            <div className="text-[10px] text-broadcast-textMuted uppercase">DURACIÓN</div>
            <div className="text-base font-bold text-broadcast-accent mt-0.5">{duration.toFixed(3)}s</div>
            <div className="text-[10px] text-broadcast-textMuted">{totalFrames} frames</div>
          </div>
          <div>
            <div className="text-[10px] text-broadcast-textMuted uppercase">VELOCIDAD</div>
            <div className={`text-base font-bold mt-0.5 ${isHighCps ? 'text-broadcast-amber' : 'text-emerald-400'}`}>
              {cps} CPS
            </div>
            <div className="text-[10px] text-broadcast-textMuted">{selectedSegment.text.replace(/\n/g, ' ').length} caracteres</div>
          </div>
        </div>

        {/* SLIP CONTROL */}
        <div className="flex items-center justify-between p-2 rounded bg-broadcast-darkest border border-broadcast-border text-[11px] font-mono">
          <span className="text-broadcast-textMuted">Slip (Mover bloque):</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'both', -0.1)}
              className="px-2 py-0.5 rounded bg-broadcast-surface hover:bg-broadcast-border text-broadcast-textMuted hover:text-white"
            >
              -100ms
            </button>
            <button
              onClick={() => nudgeSegmentTimecode(selectedSegment.id, 'both', 0.1)}
              className="px-2 py-0.5 rounded bg-broadcast-surface hover:bg-broadcast-border text-broadcast-textMuted hover:text-white"
            >
              +100ms
            </button>
          </div>
        </div>
      </div>

      {/* Editable Subtitle Text */}
      <div className="space-y-1 pt-1">
        <label className="block text-[11px] font-mono uppercase text-broadcast-textMuted">
          Texto del Subtítulo
        </label>
        <textarea
          value={selectedSegment.text}
          onChange={(e) => updateSegmentText(selectedSegment.id, e.target.value)}
          rows={3}
          className="w-full bg-broadcast-darkest p-2.5 rounded border border-broadcast-border text-sm text-white font-sans focus:outline-none focus:border-broadcast-accent resize-none leading-relaxed"
          placeholder="Escribe el texto del subtítulo..."
        />
      </div>

      {/* Detailed QC Warnings Breakdown (Explaining cleanly) */}
      {selectedSegment.warnings && selectedSegment.warnings.length > 0 && (
        <div className="p-3 rounded bg-amber-950/30 border border-amber-800/40 space-y-1.5">
          <div className="text-[10px] font-mono font-bold text-broadcast-amber uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Incidencias QC Detectadas:</span>
          </div>
          {selectedSegment.warnings.map((w, idx) => (
            <div key={idx} className="text-xs text-amber-200/90 leading-tight">
              • {w.message}
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="text-[10px] font-mono text-broadcast-textMuted text-center pt-2 border-t border-broadcast-border/50">
        [I] Fijar IN • [O] Fijar OUT • [Espacio] Play/Pausa
      </div>
    </div>
  );
};
