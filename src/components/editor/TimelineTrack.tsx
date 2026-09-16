import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, AlertTriangle, Play, Pause, 
  ChevronRight, ArrowLeft, ArrowRight, CornerDownLeft 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubtitleSegment } from '../../types';
import { secondsToDisplayTime, secondsToSMPTE } from '../../services/srtService';

interface TimelineTrackProps {
  onSelectSegment?: (segmentId: string) => void;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({ onSelectSegment }) => {
  const {
    segments,
    speakers,
    selectedSegmentId,
    selectedSegment,
    selectSegment,
    currentTime,
    duration,
    seekVideo,
    isPlaying,
    activeJob
  } = useApp();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

  // Zoom level: pixels per second (pps)
  // Default to 30s visible window on ~1200px width -> ~40 pps
  const [pixelsPerSecond, setPixelsPerSecond] = useState<number>(40);
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const fps = activeJob?.fps || 25;
  const totalWidth = Math.max(1200, duration * pixelsPerSecond);

  // Zoom Presets
  const zoomPresets = [
    { label: '5s', pps: 200 },
    { label: '10s', pps: 100 },
    { label: '30s', pps: 40 },
    { label: '60s', pps: 20 },
  ];

  // Auto scroll timeline container to keep playhead visible while playing
  useEffect(() => {
    if (!autoFollow || isScrubbing) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const playheadX = currentTime * pixelsPerSecond;
    const scrollLeft = container.scrollLeft;
    const visibleWidth = container.clientWidth;

    // If playhead goes beyond 75% or before 10% of visible area, center it
    if (playheadX > scrollLeft + visibleWidth * 0.8 || playheadX < scrollLeft) {
      container.scrollTo({
        left: Math.max(0, playheadX - visibleWidth * 0.3),
        behavior: isPlaying ? 'smooth' : 'auto'
      });
    }
  }, [currentTime, pixelsPerSecond, autoFollow, isScrubbing, isPlaying]);

  // Scroll to selected segment when changed
  useEffect(() => {
    if (!selectedSegment) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const segX = selectedSegment.startSeconds * pixelsPerSecond;
    const scrollLeft = container.scrollLeft;
    const visibleWidth = container.clientWidth;

    if (segX < scrollLeft || segX > scrollLeft + visibleWidth - 100) {
      container.scrollTo({
        left: Math.max(0, segX - visibleWidth * 0.25),
        behavior: 'smooth'
      });
    }
  }, [selectedSegmentId, pixelsPerSecond]);

  // Render Waveform Canvas matching timeline coordinates exactly
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const h = canvas.height;
    ctx.clearRect(0, 0, totalWidth, h);

    // Dark background for waveform track
    ctx.fillStyle = '#0e1117';
    ctx.fillRect(0, 0, totalWidth, h);

    // Center horizontal guide line
    ctx.strokeStyle = '#1e2430';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(totalWidth, h / 2);
    ctx.stroke();

    // Render speech amplitude peaks aligned with segments
    // Outside of segments: low ambient noise. Inside segments: speech peaks!
    const step = 4; // px per sample bar
    const barsCount = Math.ceil(totalWidth / step);

    for (let i = 0; i < barsCount; i++) {
      const barX = i * step;
      const t = barX / pixelsPerSecond;

      // Check if this time falls inside any segment
      const activeSeg = segments.find(s => t >= s.startSeconds && t <= s.endSeconds);
      const isVoice = !!activeSeg;

      let amplitude: number;
      if (isVoice) {
        // Speech modulation with syllable peaks
        const freq1 = Math.sin(t * 14.5);
        const freq2 = Math.cos(t * 28.2);
        const envelope = Math.abs(freq1 * 0.7 + freq2 * 0.3);
        amplitude = Math.max(6, envelope * (h * 0.75));
        
        // Color based on speaker or warning
        if (activeSeg.id === selectedSegmentId) {
          ctx.fillStyle = '#00e5ff'; // Neon cyan for selected block audio
        } else {
          const spk = speakers[activeSeg.speakerId];
          ctx.fillStyle = spk?.color ? `${spk.color}bb` : 'rgba(56, 189, 248, 0.7)';
        }
      } else {
        // Ambient room noise / silence
        amplitude = 2 + (Math.sin(i * 0.8) * 1.5);
        ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
      }

      const barY = (h - amplitude) / 2;
      ctx.fillRect(barX, barY, 2.2, amplitude);
    }
  }, [totalWidth, pixelsPerSecond, segments, speakers, selectedSegmentId]);

  // Handle click / scrubbing on ruler or waveform
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleScrub(e);
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left + container.scrollLeft;
    const targetSeconds = Math.max(0, Math.min(duration, clickX / pixelsPerSecond));
    seekVideo(targetSeconds);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      handleScrub(e);
    }
  };

  const handleMouseUp = () => {
    if (isScrubbing) {
      setIsScrubbing(false);
    }
  };

  // Generate Time Ruler Marks
  const rulerTicks = useMemo(() => {
    // Determine tick interval based on zoom
    let majorInterval = 5; // seconds
    let minorInterval = 1; // second

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

  // Subtitle blocks with overlap detection
  const positionedSegments = useMemo(() => {
    return segments.map((seg, idx) => {
      const x = seg.startSeconds * pixelsPerSecond;
      const width = Math.max(16, (seg.endSeconds - seg.startSeconds) * pixelsPerSecond);
      const isSelected = seg.id === selectedSegmentId;
      const isCurrent = currentTime >= seg.startSeconds && currentTime <= seg.endSeconds;
      const speaker = speakers[seg.speakerId];
      const hasWarning = seg.warnings && seg.warnings.length > 0;
      const isOverlap = seg.warnings?.some(w => w.type === 'overlap');

      // Check if previous segment overlaps with this one spatially
      const prev = idx > 0 ? segments[idx - 1] : null;
      const prevOverlap = prev && seg.startSeconds < prev.endSeconds;

      return {
        ...seg,
        x,
        width,
        isSelected,
        isCurrent,
        speaker,
        hasWarning,
        isOverlap: isOverlap || prevOverlap
      };
    });
  }, [segments, speakers, selectedSegmentId, currentTime, pixelsPerSecond]);

  const playheadPositionX = currentTime * pixelsPerSecond;

  return (
    <div 
      className="flex flex-col h-full bg-broadcast-panel border-t border-broadcast-border select-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Controls Bar: Zoom & Follow Playhead */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-broadcast-darkest border-b border-broadcast-border text-xs">
        <div className="flex items-center gap-3 font-mono">
          <span className="text-broadcast-accent font-bold uppercase text-[11px] tracking-wider">
            Línea Temporal (Timeline)
          </span>
          <span className="text-broadcast-textMuted text-[10px]">
            {pixelsPerSecond} px/s • SMPTE {secondsToSMPTE(currentTime, fps)}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Presets */}
          <div className="flex items-center rounded bg-broadcast-surface border border-broadcast-border p-0.5">
            {zoomPresets.map(preset => (
              <button
                key={preset.label}
                onClick={() => setPixelsPerSecond(preset.pps)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  pixelsPerSecond === preset.pps
                    ? 'bg-broadcast-accent text-black font-bold'
                    : 'text-broadcast-textMuted hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-broadcast-border">
            <ZoomOut className="w-3.5 h-3.5 text-broadcast-textMuted" />
            <input
              type="range"
              min={15}
              max={220}
              value={pixelsPerSecond}
              onChange={(e) => setPixelsPerSecond(Number(e.target.value))}
              className="w-20 accent-cyan-400 cursor-pointer h-1"
              title="Ajuste fino de escala horizontal"
            />
            <ZoomIn className="w-3.5 h-3.5 text-broadcast-textMuted" />
          </div>

          {/* Auto Follow Toggle */}
          <button
            onClick={() => setAutoFollow(v => !v)}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ml-2 ${
              autoFollow
                ? 'bg-cyan-950 text-cyan-300 border-cyan-600/50'
                : 'bg-broadcast-surface text-broadcast-textMuted border-broadcast-border hover:text-white'
            }`}
            title="Auto-seguir el cabezal de reproducción en tiempo real"
          >
            Auto-follow {autoFollow ? 'ON' : 'OFF'}
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
          {/* TRACK 1: TIME RULER (Scale) */}
          <div 
            className="h-7 border-b border-broadcast-border bg-broadcast-panel/80 relative cursor-pointer"
            onMouseDown={handleTimelineMouseDown}
          >
            {rulerTicks.map((tick, i) => (
              <div
                key={i}
                style={{ left: `${tick.x}px` }}
                className={`absolute top-0 bottom-0 pointer-events-none ${
                  tick.isMajor ? 'border-l border-broadcast-borderLight' : 'border-l border-broadcast-border/40'
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
            className="h-12 border-b border-broadcast-border relative cursor-pointer overflow-hidden"
            onMouseDown={handleTimelineMouseDown}
          >
            <canvas
              ref={waveformCanvasRef}
              width={totalWidth}
              height={48}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            {/* Waveform track label */}
            <div className="absolute top-1 left-2 pointer-events-none z-10">
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/60 text-broadcast-textMuted uppercase">
                AUDIO CH 1+2
              </span>
            </div>
          </div>

          {/* TRACK 3: SUBTITLES TRACK */}
          <div className="flex-1 relative bg-broadcast-panel/40 p-2 overflow-hidden">
            {/* Track background guide lines */}
            <div className="absolute top-1 left-2 pointer-events-none z-10">
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/60 text-broadcast-accent uppercase">
                SUBTITLES TRACK ({segments.length} BLOQUES)
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
                    top: seg.isOverlap ? '28px' : '12px', // Stagger slightly if overlap to make both visible!
                    height: '42px'
                  }}
                  className={`absolute rounded p-1.5 flex flex-col justify-between cursor-pointer transition-all duration-75 overflow-hidden shadow-md group ${
                    seg.isSelected
                      ? 'border-2 border-broadcast-accent bg-broadcast-surface ring-2 ring-broadcast-accent/50 z-20 scale-[1.01]'
                      : seg.isCurrent
                      ? 'border border-cyan-400 bg-cyan-950/60 z-10'
                      : seg.isOverlap
                      ? 'border border-red-500 bg-red-950/40 hover:border-red-400'
                      : 'border border-broadcast-border hover:border-broadcast-borderLight bg-broadcast-darkest/90 hover:bg-broadcast-surface'
                  }`}
                  title={`#${seg.number} ${seg.speaker?.displayName || 'Speaker'}: ${seg.text} (${seg.startTime} - ${seg.endTime})`}
                >
                  {/* Top Bar inside block: Speaker name + Warnings */}
                  <div className="flex items-center justify-between gap-1 overflow-hidden leading-tight">
                    <span 
                      className="text-[10px] font-bold font-mono uppercase truncate"
                      style={{ color: speakerColor }}
                    >
                      {seg.speaker?.displayName || 'Speaker'}
                    </span>

                    {/* Warning icon if any */}
                    {seg.hasWarning && (
                      <span className="text-broadcast-amber flex-shrink-0" title={seg.warnings?.map(w => w.message).join(' • ')}>
                        <AlertTriangle className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Text snippet inside block */}
                  <div className="text-[11px] text-white font-sans truncate leading-tight mt-0.5">
                    {seg.text}
                  </div>

                  {/* Active Selection IN / OUT handles */}
                  {seg.isSelected && (
                    <>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-broadcast-accent" />
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-broadcast-accent" />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* VERTICAL PLAYHEAD (Spanning across ruler, waveform, and subtitles track) */}
          <div
            style={{ left: `${playheadPositionX}px` }}
            className="absolute top-0 bottom-0 w-px bg-broadcast-accent z-30 pointer-events-none shadow-[0_0_8px_rgba(0,229,255,0.8)]"
          >
            {/* Playhead Top Scrubber Head */}
            <div className="relative -left-2.5 top-0 w-5 h-4 bg-broadcast-accent text-black flex items-center justify-center rounded-b-sm shadow-md">
              <div className="w-0.5 h-2 bg-black/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
