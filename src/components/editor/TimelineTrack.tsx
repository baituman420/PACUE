import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, AlertTriangle, Volume2, Sliders
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

  // Waveform Height Mode
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
  // Palette: Fondo #201F1C, onda #77736C, onda seleccionada #759E96
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const h = waveformHeight;
    canvas.height = h;
    canvas.width = totalWidth;

    // Solid dark warm background
    ctx.fillStyle = '#201F1C';
    ctx.fillRect(0, 0, totalWidth, h);

    // Center zero guide line in soft earthy slate
    ctx.strokeStyle = '#2C2925';
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
        amplitude = Math.max(3, rawAmp * (h * 0.85));
      } else {
        // Safe synthetic speech fallback (always textured, never blank!)
        const activeSeg = segments.find(s => t >= s.startSeconds && t <= s.endSeconds);
        if (activeSeg) {
          const freq1 = Math.sin(t * 14.5);
          const freq2 = Math.cos(t * 28.2);
          const envelope = Math.abs(freq1 * 0.65 + freq2 * 0.35);
          amplitude = Math.max(5, envelope * (h * 0.75));
        } else {
          // Room floor noise
          amplitude = 2.5 + (Math.sin(i * 0.7) * 1.5);
        }
      }

      // Warm earthy color grading:
      // In selection: #759E96 (soft muted teal wave)
      // Normal wave: #77736C
      if (isInSelection) {
        ctx.fillStyle = '#759E96';
      } else {
        ctx.fillStyle = amplitude > 4 ? '#77736C' : '#39352F';
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

  // Unified Pointer Handlers for Interactive Dragging
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
      updateSegmentTimecodes(
        dragState.segmentId,
        dragState.currentStart,
        dragState.currentEnd
      );
      setDragState(null);
    }
  };

  // Subtitle blocks positioned in time
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
      className="flex flex-col h-full bg-broadcast-panel border-t border-broadcast-border select-none overflow-hidden font-sans"
      onPointerMove={handleGlobalPointerMove}
      onPointerUp={handleGlobalPointerUp}
      onPointerCancel={handleGlobalPointerUp}
    >
      {/* Top Controls Bar: Subdued & Clean */}
      <div className="flex items-center justify-between px-3 py-1 bg-broadcast-darkest border-b border-broadcast-border text-xs">
        {/* Left: Title & SMPTE */}
        <div className="flex items-center gap-3">
          <span className="text-broadcast-textSecondary text-xs font-medium">
            Línea temporal
          </span>
          <span className="text-broadcast-textMuted text-[11px] font-mono">
            {pixelsPerSecond} px/s • SMPTE <span className="text-broadcast-textPrimary font-mono">{secondsToSMPTE(currentTime, fps)}</span>
          </span>
        </div>

        {/* Right Controls: Audio Height, Snap, Zoom, Follow */}
        <div className="flex items-center gap-2">
          {/* Waveform Height Selector */}
          <div className="flex items-center rounded bg-broadcast-surface px-1 py-0.5 text-[10px] text-broadcast-textMuted">
            <span className="pr-1">Audio:</span>
            {(['compact', 'normal', 'expanded'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setWaveformHeightMode(mode)}
                className={`px-1.5 py-0.2 rounded transition-colors ${
                  waveformHeightMode === mode
                    ? 'bg-broadcast-surfaceHover text-broadcast-textPrimary font-medium'
                    : 'text-broadcast-textMuted hover:text-broadcast-textSecondary'
                }`}
              >
                {mode === 'compact' ? '28' : mode === 'normal' ? '48' : '80'}
              </button>
            ))}
          </div>

          {/* Snap Toggle */}
          <button
            onClick={() => setSnapToFrames(!snapToFrames)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors border ${
              snapToFrames
                ? 'bg-broadcast-surfaceHover text-broadcast-textPrimary border-broadcast-accent'
                : 'bg-broadcast-surface text-broadcast-textMuted border-broadcast-border hover:text-broadcast-textSecondary'
            }`}
            title={`Ajuste magnético a fotogramas (${fps} fps, pasos de ${Math.round(frameDuration * 1000)}ms)`}
          >
            Snap {fps}f {snapToFrames ? 'ON' : 'OFF'}
          </button>

          {/* Zoom Presets */}
          <div className="flex items-center rounded bg-broadcast-surface p-0.5 text-[10px] font-mono">
            {zoomPresets.map(preset => (
              <button
                key={preset.label}
                onClick={() => setPixelsPerSecond(preset.pps)}
                className={`px-1.5 py-0.2 rounded transition-colors ${
                  pixelsPerSecond === preset.pps
                    ? 'bg-broadcast-surfaceHover text-broadcast-textPrimary font-semibold'
                    : 'text-broadcast-textMuted hover:text-broadcast-textSecondary'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-1 pl-1 border-l border-broadcast-border">
            <ZoomOut className="w-3.5 h-3.5 text-broadcast-textMuted" />
            <input
              type="range"
              min={15}
              max={220}
              value={pixelsPerSecond}
              onChange={(e) => setPixelsPerSecond(Number(e.target.value))}
              className="w-14 accent-[#568F87] cursor-pointer h-1"
            />
            <ZoomIn className="w-3.5 h-3.5 text-broadcast-textMuted" />
          </div>

          {/* Auto Follow Toggle */}
          <button
            onClick={() => setAutoFollow(v => !v)}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              autoFollow
                ? 'bg-broadcast-surfaceHover text-broadcast-textPrimary'
                : 'text-broadcast-textMuted hover:text-broadcast-textSecondary'
            }`}
          >
            Follow {autoFollow ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Horizontal Scrollable Timeline Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden relative scrollbar-thin bg-broadcast-darkest"
      >
        <div 
          style={{ width: `${totalWidth}px` }} 
          className="h-full relative flex flex-col"
        >
          {/* TRACK 1: TIME RULER */}
          <div 
            className="h-5 border-b border-broadcast-border bg-broadcast-panel relative cursor-pointer"
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
                  <span className="text-[9px] font-mono text-broadcast-textMuted pl-1 block select-none">
                    {tick.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* TRACK 2: WAVEFORM (Audio Track) - Solid Dark Background: #201F1C */}
          <div 
            style={{ height: `${waveformHeight}px`, backgroundColor: '#201F1C' }}
            className="border-b border-broadcast-border relative cursor-pointer overflow-hidden transition-all duration-150 bg-[#201F1C]"
            onPointerDown={handleTimelinePointerDown}
          >
            <canvas
              ref={waveformCanvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ width: `${totalWidth}px`, height: `${waveformHeight}px` }}
            />

            {/* Discrete Waveform Status */}
            <div className="absolute top-1 left-2 pointer-events-none z-10">
              <span className="text-[9px] font-sans px-1.5 py-0.2 rounded bg-[#1A1917]/80 text-broadcast-textMuted flex items-center gap-1">
                <Volume2 className="w-2.5 h-2.5 text-[#568F87]" />
                {isExtractingWaveform ? (
                  <span>Decodificando audio...</span>
                ) : waveformData?.isReal ? (
                  <span>Audio físico ({waveformData.fileName})</span>
                ) : waveformExtractionFailed ? (
                  <span>Audio sintético (formato no soportado)</span>
                ) : (
                  <span>Forma de onda de referencia</span>
                )}
              </span>
            </div>
          </div>

          {/* TRACK 3: SUBTITLES TRACK */}
          <div className="flex-1 relative bg-broadcast-panel/50 p-2 overflow-hidden">
            {/* Subtitle Blocks */}
            {positionedSegments.map(seg => {
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
                    top: seg.isOverlap ? '26px' : '8px',
                    height: '42px'
                  }}
                  className={`absolute rounded px-2 py-1 flex flex-col justify-between select-none cursor-pointer transition-colors overflow-hidden ${
                    seg.isSelected
                      ? 'bg-broadcast-surfaceHover border border-broadcast-accent text-broadcast-textPrimary shadow-sm z-20'
                      : seg.isCurrent
                      ? 'bg-broadcast-surface border border-broadcast-accent/50 text-broadcast-textPrimary z-10'
                      : seg.isOverlap
                      ? 'bg-broadcast-panel border border-broadcast-danger text-broadcast-textSecondary'
                      : 'bg-broadcast-panel border border-broadcast-border hover:bg-broadcast-surface hover:border-broadcast-borderLight text-broadcast-textSecondary'
                  }`}
                  title={`#${seg.number}: ${seg.text} (${secondsToDisplayTime(seg.startSeconds)} - ${secondsToDisplayTime(seg.endSeconds)})`}
                >
                  {/* Top Bar inside block: Speaker + Live CPS if selected */}
                  <div className="flex items-center justify-between gap-1 overflow-hidden leading-tight text-[10px]">
                    <span 
                      className="font-medium truncate"
                      style={{ color: seg.speaker?.color || '#AAA49A' }}
                    >
                      {seg.speaker?.displayName || 'Hablante'}
                    </span>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {seg.isSelected && (
                        <span className={`text-[9px] font-mono ${
                          seg.isHighCps ? 'text-broadcast-amber font-semibold' : 'text-broadcast-textMuted'
                        }`}>
                          {seg.liveCps.toFixed(1)} CPS
                        </span>
                      )}

                      {seg.hasWarning && (
                        <span className="text-broadcast-amber" title={seg.warnings?.map(w => w.message).join(' • ')}>
                          <AlertTriangle className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Text snippet inside block */}
                  <div className="text-[11px] text-broadcast-textPrimary truncate leading-tight mt-0.5 font-sans">
                    {seg.text}
                  </div>

                  {/* Drag Handles on Selected Segment (Quiet, non-fluorescent) */}
                  {seg.isSelected && (
                    <>
                      {/* LEFT TRIM HANDLE (IN) */}
                      <div
                        onPointerDown={(e) => handleStartDrag(e, seg, 'in')}
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize bg-[#568F87]/80 hover:bg-[#568F87] z-30 transition-colors"
                        title="Ajustar punto IN"
                      />

                      {/* BODY MOVE HANDLE */}
                      <div
                        onPointerDown={(e) => handleStartDrag(e, seg, 'body')}
                        className="absolute left-2 right-2 top-0 bottom-0 cursor-grab active:cursor-grabbing z-20"
                        title="Desplazar bloque"
                      />

                      {/* RIGHT TRIM HANDLE (OUT) */}
                      <div
                        onPointerDown={(e) => handleStartDrag(e, seg, 'out')}
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize bg-[#568F87]/80 hover:bg-[#568F87] z-30 transition-colors"
                        title="Ajustar punto OUT"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* UNIFIED VERTICAL PLAYHEAD (Discreet teal, no electric glow) */}
          <div
            style={{ left: `${playheadPositionX}px` }}
            className="absolute top-0 bottom-0 w-px bg-[#568F87] z-30 pointer-events-none"
          >
            {/* Scrubber top head */}
            <div className="relative -left-1.5 top-0 w-3 h-2.5 bg-[#568F87] rounded-b-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
