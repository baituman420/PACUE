import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  ZoomIn, ZoomOut, AlertTriangle, Volume2, Move,
  ChevronRight, Sparkles, Layers, Sliders
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubtitleSegment } from '../../types';
import { secondsToDisplayTime, secondsToSMPTE } from '../../services/srtService';
import { getWaveformAmplitude } from '../../services/audioWaveformService';
import { calculateCPS } from '../../services/qcService';

interface TimelineTrackProps {
  onSelectSegment?: (segmentId: string) => void;
}

interface DragState {
  type: 'in' | 'out' | 'body';
  segmentId: string;
  startX: number;
  origStart: number;
  origEnd: number;
  currentStart: number;
  currentEnd: number;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({ onSelectSegment }) => {
  const {
    segments,
    speakers,
    selectedSegmentId,
    selectedSegment,
    selectSegment,
    updateSegmentTimecodes,
    currentTime,
    duration,
    seekVideo,
    isPlaying,
    activeJob,
    qcProfile,
    waveformData,
    isExtractingWaveform,
    waveformExtractionFailed,
    snapToFrames,
    setSnapToFrames,
    waveformHeightMode,
    setWaveformHeightMode
  } = useApp();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

  // Zoom level: pixels per second (pps)
  const [pixelsPerSecond, setPixelsPerSecond] = useState<number>(40);
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const fps = activeJob?.fps || 25;
  const frameDuration = 1 / fps; // 0.040s at 25 fps
  const totalWidth = Math.max(1200, duration * pixelsPerSecond);

  // Dynamic Waveform Track Height based on user mode
  const waveformHeight = useMemo(() => {
    switch (waveformHeightMode) {
      case 'compact': return 28;
      case 'expanded': return 80;
      case 'normal':
      default: return 48;
    }
  }, [waveformHeightMode]);

  // Zoom Presets
  const zoomPresets = [
    { label: '5s', pps: 200 },
    { label: '10s', pps: 100 },
    { label: '30s', pps: 40 },
    { label: '60s', pps: 20 },
  ];

  // Auto scroll timeline container to keep playhead visible while playing
  useEffect(() => {
    if (!autoFollow || isScrubbing || dragState) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const playheadX = currentTime * pixelsPerSecond;
    const scrollLeft = container.scrollLeft;
    const visibleWidth = container.clientWidth;

    if (playheadX > scrollLeft + visibleWidth * 0.8 || playheadX < scrollLeft) {
      container.scrollTo({
        left: Math.max(0, playheadX - visibleWidth * 0.3),
        behavior: isPlaying ? 'smooth' : 'auto'
      });
    }
  }, [currentTime, pixelsPerSecond, autoFollow, isScrubbing, isPlaying, dragState]);

  // Scroll to selected segment when changed
  useEffect(() => {
    if (!selectedSegment || dragState) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const segX = selectedSegment.startSeconds * pixelsPerSecond;
    const scrollLeft = container.scrollLeft;
    const visibleWidth = container.clientWidth;

    if (segX < scrollLeft || segX > scrollLeft + visibleWidth - 120) {
      container.scrollTo({
        left: Math.max(0, segX - visibleWidth * 0.25),
        behavior: 'smooth'
      });
    }
  }, [selectedSegmentId, pixelsPerSecond]);

  // Render Waveform Canvas - Unified coordinate scale (pixelsPerSecond)
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const h = waveformHeight;
    canvas.height = h;
    canvas.width = totalWidth;

    ctx.clearRect(0, 0, totalWidth, h);

    // Warm charcoal background
    ctx.fillStyle = '#14171b';
    ctx.fillRect(0, 0, totalWidth, h);

    // Center zero guide line in soft slate
    ctx.strokeStyle = '#222730';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(totalWidth, h / 2);
    ctx.stroke();

    // Determine currently active selected interval
    const selStart = dragState && dragState.segmentId === selectedSegment?.id
      ? dragState.currentStart
      : (selectedSegment?.startSeconds ?? -1);
    const selEnd = dragState && dragState.segmentId === selectedSegment?.id
      ? dragState.currentEnd
      : (selectedSegment?.endSeconds ?? -1);

    const step = 4; // px per bar
    const barsCount = Math.ceil(totalWidth / step);

    const isRealAudio = !!(waveformData && waveformData.isReal && waveformData.peaks.length > 0);

    for (let i = 0; i < barsCount; i++) {
      const barX = i * step;
      const t = barX / pixelsPerSecond;
      const isInSelection = selStart >= 0 && t >= selStart && t <= selEnd;

      let amplitude = 0;

      if (isRealAudio) {
        // Real Audio extraction from Web Audio API
        const rawAmp = getWaveformAmplitude(waveformData, t);
        amplitude = Math.max(2, rawAmp * (h * 0.85));
      } else {
        // Safe synthetic speech fallback
        const activeSeg = segments.find(s => t >= s.startSeconds && t <= s.endSeconds);
        if (activeSeg) {
          const freq1 = Math.sin(t * 14.5);
          const freq2 = Math.cos(t * 28.2);
          const envelope = Math.abs(freq1 * 0.65 + freq2 * 0.35);
          amplitude = Math.max(4, envelope * (h * 0.75));
        } else {
          amplitude = 1.5 + (Math.sin(i * 0.8) * 1.0);
        }
      }

      // Soft warm color grading (Teal on selection, Warm Gray elsewhere)
      if (isInSelection) {
        ctx.fillStyle = 'rgba(20, 184, 166, 0.85)'; // Soft teal
      } else if (isRealAudio) {
        ctx.fillStyle = amplitude > 4 ? '#5b6574' : '#323946'; // Warm slate gray
      } else {
        const activeSeg = segments.find(s => t >= s.startSeconds && t <= s.endSeconds);
        ctx.fillStyle = activeSeg ? '#5b6574' : '#272d38';
      }

      const barY = (h - amplitude) / 2;
      ctx.fillRect(barX, barY, 2.2, amplitude);
    }
  }, [totalWidth, pixelsPerSecond, waveformHeight, waveformData, segments, selectedSegment, dragState]);

  // Scrubbing on Ruler / Waveform Track via Pointer Events
  const handleTimelinePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState) return;
    setIsScrubbing(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    handleScrub(e.clientX);
  };

  const handleScrub = (clientX: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickX = clientX - rect.left + container.scrollLeft;
    let targetSeconds = Math.max(0, Math.min(duration, clickX / pixelsPerSecond));
    if (snapToFrames) {
      targetSeconds = Math.round(targetSeconds * fps) / fps;
    }
    seekVideo(targetSeconds);
  };

  // Generate Time Ruler Marks
  const rulerTicks = useMemo(() => {
    let majorInterval = 5;
    let minorInterval = 1;

    if (pixelsPerSecond >= 100) {
      majorInterval = 1;
      minorInterval = 0.2;
    } else if (pixelsPerSecond >= 40) {
      majorInterval = 5;
      minorInterval = 1;
    } else if (pixelsPerSecond >= 20) {
      majorInterval = 10;
      minorInterval = 2;
    } else {
      majorInterval = 30;
      minorInterval = 5;
    }

    const ticks: Array<{ time: number; x: number; isMajor: boolean; label: string }> = [];
    const maxTime = duration + 30;

    for (let t = 0; t <= maxTime; t += minorInterval) {
      const isMajor = Math.abs(t % majorInterval) < 0.001;
      const x = t * pixelsPerSecond;
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      const pad = (n: number) => String(n).padStart(2, '0');
      const label = isMajor ? `${pad(m)}:${pad(s)}` : '';
      ticks.push({ time: t, x, isMajor, label });
    }

    return ticks;
  }, [duration, pixelsPerSecond]);

  // Unified Pointer Handlers for Interactive Dragging (Left Handle, Right Handle, Body)
  const handleStartDrag = (
    e: React.PointerEvent,
    seg: SubtitleSegment,
    type: 'in' | 'out' | 'body'
  ) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    selectSegment(seg.id, false);
    setDragState({
      type,
      segmentId: seg.id,
      startX: e.clientX,
      origStart: seg.startSeconds,
      origEnd: seg.endSeconds,
      currentStart: seg.startSeconds,
      currentEnd: seg.endSeconds
    });
  };

  const handleGlobalPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      handleScrub(e.clientX);
      return;
    }

    if (!dragState) return;

    // Use requestAnimationFrame for smooth 60fps drag rendering
    window.requestAnimationFrame(() => {
      const deltaX = e.clientX - dragState.startX;
      let deltaSec = deltaX / pixelsPerSecond;

      if (snapToFrames) {
        deltaSec = Math.round(deltaSec / frameDuration) * frameDuration;
      }

      if (dragState.type === 'in') {
        let newStart = Math.max(0, Math.min(dragState.origStart + deltaSec, dragState.origEnd - 0.2));
        if (snapToFrames) newStart = Math.round(newStart * fps) / fps;
        setDragState(prev => prev ? { ...prev, currentStart: Number(newStart.toFixed(3)) } : null);
        seekVideo(newStart);
      } else if (dragState.type === 'out') {
        let newEnd = Math.max(dragState.origStart + 0.2, Math.min(duration, dragState.origEnd + deltaSec));
        if (snapToFrames) newEnd = Math.round(newEnd * fps) / fps;
        setDragState(prev => prev ? { ...prev, currentEnd: Number(newEnd.toFixed(3)) } : null);
        seekVideo(newEnd);
      } else if (dragState.type === 'body') {
        const blockDur = dragState.origEnd - dragState.origStart;
        let newStart = Math.max(0, dragState.origStart + deltaSec);
        if (snapToFrames) newStart = Math.round(newStart * fps) / fps;
        const newEnd = Number((newStart + blockDur).toFixed(3));
        setDragState(prev => prev ? {
          ...prev,
          currentStart: Number(newStart.toFixed(3)),
          currentEnd: newEnd
        } : null);
      }
    });
  };

  const handleGlobalPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      setIsScrubbing(false);
    }

    if (dragState) {
      // Commit final timecodes and trigger full QC evaluation
      updateSegmentTimecodes(
        dragState.segmentId,
        dragState.currentStart,
        dragState.currentEnd
      );
      setDragState(null);
    }
  };

  // Subtitle blocks with real-time draft position during dragging
  const positionedSegments = useMemo(() => {
    return segments.map((seg, idx) => {
      const isBeingDragged = dragState?.segmentId === seg.id;
      const startSeconds = isBeingDragged ? dragState.currentStart : seg.startSeconds;
      const endSeconds = isBeingDragged ? dragState.currentEnd : seg.endSeconds;
      const dur = Math.max(0.04, endSeconds - startSeconds);

      const x = startSeconds * pixelsPerSecond;
      const width = Math.max(20, dur * pixelsPerSecond);
      const isSelected = seg.id === selectedSegmentId;
      const isCurrent = currentTime >= startSeconds && currentTime <= endSeconds;
      const speaker = speakers[seg.speakerId];
      const liveCps = calculateCPS(seg.text, dur);
      const isHighCps = liveCps > qcProfile.maxCps;

      // Immediate adjacent overlap checking during drag
      const prev = idx > 0 ? segments[idx - 1] : null;
      const prevEnd = prev ? (dragState?.segmentId === prev.id ? dragState.currentEnd : prev.endSeconds) : 0;
      const next = idx < segments.length - 1 ? segments[idx + 1] : null;
      const nextStart = next ? (dragState?.segmentId === next.id ? dragState.currentStart : next.startSeconds) : 999999;

      const hasPrevOverlap = prev && startSeconds < prevEnd;
      const hasNextOverlap = next && endSeconds > nextStart;
      const isOverlap = hasPrevOverlap || hasNextOverlap;
      const hasWarning = seg.warnings && seg.warnings.length > 0;

      return {
        ...seg,
        startSeconds,
        endSeconds,
        dur,
        liveCps,
        isHighCps,
        x,
        width,
        isSelected,
        isCurrent,
        speaker,
        hasWarning,
        isOverlap,
        isBeingDragged
      };
    });
  }, [segments, speakers, selectedSegmentId, currentTime, pixelsPerSecond, dragState, qcProfile.maxCps]);

  const playheadPositionX = currentTime * pixelsPerSecond;

  return (
    <div 
      className="flex flex-col h-full bg-broadcast-panel border-t border-broadcast-border select-none overflow-hidden"
      onPointerMove={handleGlobalPointerMove}
      onPointerUp={handleGlobalPointerUp}
      onPointerCancel={handleGlobalPointerUp}
    >
      {/* Top Controls Bar: Zoom, Snap, Waveform Height, Follow */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-broadcast-darkest border-b border-broadcast-border text-xs">
        {/* Left: Section Title & SMPTE */}
        <div className="flex items-center gap-3">
          <span className="text-broadcast-accent font-semibold text-xs tracking-wide flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            LÍNEA TEMPORAL
          </span>
          <span className="text-broadcast-textMuted text-[11px] font-mono">
            {pixelsPerSecond} px/s • SMPTE <strong className="text-white font-mono">{secondsToSMPTE(currentTime, fps)}</strong>
          </span>
        </div>

        {/* Right Controls: Waveform Height, Snap, Zoom, Follow */}
        <div className="flex items-center gap-2">
          {/* Waveform Height Selector */}
          <div className="flex items-center rounded bg-broadcast-surface border border-broadcast-border p-0.5 text-[10px]">
            <span className="text-broadcast-textMuted px-1.5 font-sans">Audio:</span>
            {(['compact', 'normal', 'expanded'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setWaveformHeightMode(mode)}
                className={`px-1.5 py-0.5 rounded transition-colors uppercase ${
                  waveformHeightMode === mode
                    ? 'bg-broadcast-accent text-white font-semibold'
                    : 'text-broadcast-textMuted hover:text-white'
                }`}
                title={`Altura de pista de audio: ${mode}`}
              >
                {mode === 'compact' ? '28px' : mode === 'normal' ? '48px' : '80px'}
              </button>
            ))}
          </div>

          {/* Snap to Frames Toggle */}
          <button
            onClick={() => setSnapToFrames(!snapToFrames)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors flex items-center gap-1 ${
              snapToFrames
                ? 'bg-teal-950/60 text-teal-300 border-teal-600/40 font-semibold'
                : 'bg-broadcast-surface text-broadcast-textMuted border-broadcast-border hover:text-white'
            }`}
            title={`Ajuste magnético a fotogramas (${fps} fps, pasos de ${Math.round(frameDuration * 1000)}ms)`}
          >
            <span>SNAP {fps}fps</span>
            <span className="text-[9px] px-1 rounded bg-black/40">
              {snapToFrames ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Zoom Presets */}
          <div className="flex items-center rounded bg-broadcast-surface border border-broadcast-border p-0.5">
            {zoomPresets.map(preset => (
              <button
                key={preset.label}
                onClick={() => setPixelsPerSecond(preset.pps)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  pixelsPerSecond === preset.pps
                    ? 'bg-broadcast-accent text-white font-semibold'
                    : 'text-broadcast-textMuted hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-broadcast-border">
            <ZoomOut className="w-3.5 h-3.5 text-broadcast-textMuted" />
            <input
              type="range"
              min={15}
              max={220}
              value={pixelsPerSecond}
              onChange={(e) => setPixelsPerSecond(Number(e.target.value))}
              className="w-16 accent-teal-500 cursor-pointer h-1"
              title="Ajuste fino de zoom horizontal"
            />
            <ZoomIn className="w-3.5 h-3.5 text-broadcast-textMuted" />
          </div>

          {/* Auto Follow Toggle */}
          <button
            onClick={() => setAutoFollow(v => !v)}
            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
              autoFollow
                ? 'bg-broadcast-surface text-teal-300 border-teal-500/30'
                : 'bg-broadcast-surface text-broadcast-textMuted border-broadcast-border hover:text-white'
            }`}
            title="Auto-seguir el cabezal de reproducción en tiempo real"
          >
            Auto-follow {autoFollow ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Horizontal Scrollable Timeline Area (Unified Tracks) */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden relative scrollbar-thin bg-broadcast-darkest"
      >
        <div 
          style={{ width: `${totalWidth}px` }} 
          className="h-full relative flex flex-col"
        >
          {/* TRACK 1: TIME RULER (Scale) */}
          <div 
            className="h-6 border-b border-broadcast-border bg-broadcast-panel/90 relative cursor-pointer"
            onPointerDown={handleTimelinePointerDown}
          >
            {rulerTicks.map((tick, i) => (
              <div
                key={i}
                style={{ left: `${tick.x}px` }}
                className={`absolute top-0 bottom-0 pointer-events-none ${
                  tick.isMajor ? 'border-l border-broadcast-borderLight' : 'border-l border-broadcast-border/30'
                }`}
              >
                {tick.label && (
                  <span className="text-[10px] font-mono text-broadcast-textMuted pl-1 pt-0.5 block select-none">
                    {tick.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* TRACK 2: WAVEFORM (Audio Track) */}
          <div 
            style={{ height: `${waveformHeight}px` }}
            className="border-b border-broadcast-border relative cursor-pointer overflow-hidden transition-all duration-150"
            onPointerDown={handleTimelinePointerDown}
          >
            <canvas
              ref={waveformCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Discrete Waveform Status Badge */}
            <div className="absolute top-1 left-2 pointer-events-none z-10 flex items-center gap-1.5">
              <span className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-broadcast-darkest/80 text-broadcast-textMuted border border-broadcast-border flex items-center gap-1">
                <Volume2 className="w-2.5 h-2.5 text-teal-400" />
                {isExtractingWaveform ? (
                  <span className="text-teal-400 animate-pulse">Decodificando audio real...</span>
                ) : waveformData?.isReal ? (
                  <span>Audio nativo ({waveformData.fileName})</span>
                ) : waveformExtractionFailed ? (
                  <span className="text-amber-400">Fallback de voz (formato no soportado)</span>
                ) : (
                  <span>Forma de onda referencial</span>
                )}
              </span>
            </div>
          </div>

          {/* TRACK 3: SUBTITLES TRACK */}
          <div className="flex-1 relative bg-broadcast-panel/30 p-2 overflow-hidden">
            {/* Track background guide label */}
            <div className="absolute top-1 left-2 pointer-events-none z-10">
              <span className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-broadcast-darkest/80 text-broadcast-textMuted border border-broadcast-border">
                Pista de Subtítulos ({segments.length} bloques)
              </span>
            </div>

            {/* Subtitle Blocks */}
            {positionedSegments.map(seg => {
              const speakerColor = seg.speaker?.color || '#38bdf8';

              return (
                <div
                  key={seg.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectSegment(seg.id, false);
                    if (onSelectSegment) onSelectSegment(seg.id);
                  }}
                  style={{
                    left: `${seg.x}px`,
                    width: `${seg.width}px`,
                    top: seg.isOverlap ? '28px' : '10px',
                    height: '42px'
                  }}
                  className={`absolute rounded px-2 py-1 flex flex-col justify-between select-none cursor-pointer transition-shadow overflow-hidden group ${
                    seg.isSelected
                      ? 'border-2 border-teal-500 bg-broadcast-surface shadow-md z-20'
                      : seg.isCurrent
                      ? 'border border-teal-600/70 bg-teal-950/30 z-10'
                      : seg.isOverlap
                      ? 'border border-terracotta bg-red-950/30'
                      : 'border border-broadcast-border hover:border-broadcast-borderLight bg-broadcast-darkest/90 hover:bg-broadcast-surface'
                  }`}
                  title={`#${seg.number} ${seg.speaker?.displayName || 'Speaker'}: ${seg.text} (${secondsToDisplayTime(seg.startSeconds)} - ${secondsToDisplayTime(seg.endSeconds)})`}
                >
                  {/* Top Bar inside block: Speaker name + CPS + Warnings */}
                  <div className="flex items-center justify-between gap-1 overflow-hidden leading-tight">
                    <span 
                      className="text-[10px] font-semibold truncate"
                      style={{ color: speakerColor }}
                    >
                      {seg.speaker?.displayName || 'Speaker'}
                    </span>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Live CPS Badge if selected or high */}
                      {seg.isSelected && (
                        <span className={`text-[9px] font-mono px-1 rounded ${
                          seg.isHighCps ? 'bg-amber-950 text-amber-300 font-bold' : 'text-broadcast-textMuted'
                        }`}>
                          {seg.liveCps.toFixed(1)} CPS
                        </span>
                      )}

                      {/* Warning indicator */}
                      {seg.hasWarning && (
                        <span className="text-amber-500" title={seg.warnings?.map(w => w.message).join(' • ')}>
                          <AlertTriangle className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Text snippet inside block */}
                  <div className="text-[11px] text-broadcast-textPrimary font-sans truncate leading-tight mt-0.5">
                    {seg.text}
                  </div>

                  {/* Interactive Drag Handles (Rendered only on Selected Segment) */}
                  {seg.isSelected && (
                    <>
                      {/* LEFT TRIM HANDLE (IN) */}
                      <div
                        onPointerDown={(e) => handleStartDrag(e, seg, 'in')}
                        className="absolute left-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-teal-400 bg-teal-500/80 z-30 transition-colors flex items-center justify-center group/left"
                        title="Arrastrar para ajustar punto de ENTRADA (IN)"
                      >
                        <div className="w-0.5 h-3 bg-white/70 rounded-full" />
                      </div>

                      {/* BODY SLIP HANDLE (MOVE) */}
                      <div
                        onPointerDown={(e) => handleStartDrag(e, seg, 'body')}
                        className="absolute left-2.5 right-2.5 top-0 bottom-0 cursor-grab active:cursor-grabbing z-20"
                        title="Arrastrar para desplazar subtítulo conservando duración"
                      />

                      {/* RIGHT TRIM HANDLE (OUT) */}
                      <div
                        onPointerDown={(e) => handleStartDrag(e, seg, 'out')}
                        className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize hover:bg-teal-400 bg-teal-500/80 z-30 transition-colors flex items-center justify-center group/right"
                        title="Arrastrar para ajustar punto de SALIDA (OUT)"
                      >
                        <div className="w-0.5 h-3 bg-white/70 rounded-full" />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* UNIFIED VERTICAL PLAYHEAD (Spans across ruler, waveform and subtitles) */}
          <div
            style={{ left: `${playheadPositionX}px` }}
            className="absolute top-0 bottom-0 w-px bg-teal-400 z-30 pointer-events-none shadow-[0_0_4px_rgba(20,184,166,0.6)]"
          >
            {/* Playhead Top Scrubber Head */}
            <div className="relative -left-2 top-0 w-4 h-3.5 bg-teal-500 text-black flex items-center justify-center rounded-b-sm shadow">
              <div className="w-0.5 h-2 bg-black/60 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
