import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, 
  Upload, Film, Eye, EyeOff, FastForward, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { secondsToSMPTE, secondsToDisplayTime } from '../../services/srtService';

export const VideoMonitor: React.FC = () => {
  const {
    videoUrl,
    videoFileName,
    isLocalVideo,
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    seekVideo,
    togglePlayPause,
    setPlaybackRate,
    loadLocalVideoFile,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    segments,
    speakers,
    selectedSegment,
    activeJob
  } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Synchronize HTML5 video element with app state when a real local video is active
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLocalVideo) return;

    if (isPlaying && video.paused) {
      video.play().catch(e => console.log('Autoplay prevented:', e));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying, isLocalVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLocalVideo) return;

    if (Math.abs(video.currentTime - currentTime) > 0.3) {
      video.currentTime = currentTime;
    }
  }, [currentTime, isLocalVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLocalVideo) return;
    video.playbackRate = playbackRate;
  }, [playbackRate, isLocalVideo]);

  // Video event handlers for HTML5 video
  const handleTimeUpdate = () => {
    if (videoRef.current && isLocalVideo) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && isLocalVideo) {
      setDuration(videoRef.current.duration);
    }
  };

  // Synthetic Video / Fallback broadcast monitor generator when no local video is uploaded
  useEffect(() => {
    if (isLocalVideo) return;

    let animFrame: number;
    let lastTs = performance.now();

    const renderSyntheticVideo = (timestamp: number) => {
      const delta = (timestamp - lastTs) / 1000;
      lastTs = timestamp;

      if (isPlaying) {
        setCurrentTime(prev => {
          const next = prev + delta * playbackRate;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Studio dark background gradient
          const grad = ctx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, '#0c1017');
          grad.addColorStop(0.5, '#161c28');
          grad.addColorStop(1, '#0b0e14');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);

          // Grid pattern to resemble broadcast raster
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.lineWidth = 1;
          for (let x = 0; x < w; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
          for (let y = 0; y < h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }

          // Animated broadcast studio elements
          const t = currentTime;
          ctx.save();
          // Broadcast lower third graphics simulation
          ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
          ctx.fillRect(0, h - 80, w, 4);

          // Synthetic camera slate banner
          ctx.fillStyle = 'rgba(16, 18, 22, 0.85)';
          ctx.fillRect(24, 24, 280, 56);
          ctx.strokeStyle = '#232832';
          ctx.strokeRect(24, 24, 280, 56);

          ctx.fillStyle = '#00e5ff';
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillText(`PROD: ${activeJob?.clientName || 'RTVE'} // MASTER REC`, 36, 44);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.fillText(`CAM 01 • 25 FPS • 1080p50 • STEREO`, 36, 62);

          // Simulated studio scene lighting movement
          const orbX = (w / 2) + Math.sin(t * 0.8) * 160;
          const orbY = (h / 2) + Math.cos(t * 0.5) * 40;
          const radial = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 260);
          radial.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
          radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = radial;
          ctx.beginPath();
          ctx.arc(orbX, orbY, 260, 0, Math.PI * 2);
          ctx.fill();

          // Camera focal center crosshair
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          const cx = w / 2;
          const cy = h / 2;
          ctx.beginPath();
          ctx.moveTo(cx - 20, cy);
          ctx.lineTo(cx + 20, cy);
          ctx.moveTo(cx, cy - 20);
          ctx.lineTo(cx, cy + 20);
          ctx.stroke();

          // Burnt-in Timecode (BITC) in upper right
          const smpte = secondsToSMPTE(currentTime, activeJob?.fps || 25);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(w - 220, 24, 196, 40);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.strokeRect(w - 220, 24, 196, 40);
          ctx.fillStyle = '#00e5ff';
          ctx.font = 'bold 18px "JetBrains Mono", monospace';
          ctx.fillText(`TC ${smpte}`, w - 206, 50);

          ctx.restore();
        }
      }

      animFrame = requestAnimationFrame(renderSyntheticVideo);
    };

    animFrame = requestAnimationFrame(renderSyntheticVideo);
    return () => cancelAnimationFrame(animFrame);
  }, [isLocalVideo, isPlaying, currentTime, duration, playbackRate, activeJob]);

  // Active Subtitle for current video time
  const activeSubtitle = useMemo(() => {
    return segments.find(
      s => currentTime >= s.startSeconds && currentTime <= s.endSeconds
    );
  }, [segments, currentTime]);

  const activeSpeaker = useMemo(() => {
    if (!activeSubtitle) return null;
    return speakers[activeSubtitle.speakerId] || null;
  }, [activeSubtitle, speakers]);

  // File drop handler for real local video
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/') || file.name.match(/\.(mp4|mkv|mov|webm)$/i)) {
        loadLocalVideoFile(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadLocalVideoFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-broadcast-panel border-r border-broadcast-border select-none">
      {/* Top Monitor Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-broadcast-border bg-broadcast-darkest text-xs font-sans">
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-medium text-broadcast-textPrimary">
            Monitor de Referencia
          </span>
          <span className="text-broadcast-textMuted font-mono text-[11px]">
            {isLocalVideo ? `[${videoFileName}]` : `[FEED DEMO: ${videoFileName}]`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Safe Margins toggle */}
          <button
            onClick={() => setShowSafeAreas(v => !v)}
            title="Mostrar u ocultar guías de safe-area de broadcast"
            className={`px-2 py-0.5 rounded flex items-center gap-1 text-[11px] transition-colors border ${
              showSafeAreas ? 'bg-teal-950/60 text-teal-300 border-teal-600/40' : 'border-transparent text-broadcast-textMuted hover:text-white'
            }`}
          >
            {showSafeAreas ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Safe Area</span>
          </button>

          {/* Local Video Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.mov,.mkv,.webm"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Cargar archivo de vídeo local de tu disco para reproducirlo directamente"
            className="px-2.5 py-1 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover border border-broadcast-border text-broadcast-textPrimary hover:text-white flex items-center gap-1.5 transition-colors text-xs font-medium"
          >
            <Upload className="w-3 h-3 text-teal-400" />
            <span>Cargar vídeo local</span>
          </button>
        </div>
      </div>

      {/* Video Viewport with Subtitle Overlay */}
      <div 
        className={`relative flex-1 bg-black flex items-center justify-center overflow-hidden cursor-pointer ${
          isDraggingFile ? 'ring-2 ring-broadcast-accent bg-blue-950/20' : ''
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={handleDrop}
        onClick={togglePlayPause}
      >
        {isLocalVideo && videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            muted={isMuted}
            playsInline
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="w-full h-full object-contain"
          />
        )}

        {/* Broadcast Safe Area Overlay */}
        {showSafeAreas && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Action Safe (90%) */}
            <div className="w-[90%] h-[90%] border border-cyan-500/30 relative">
              <span className="absolute top-1 left-1 text-[9px] font-mono text-cyan-400/60 uppercase">Action Safe 90%</span>
              {/* Title Safe (80%) */}
              <div className="w-[88.8%] h-[88.8%] m-auto border border-amber-500/30 relative">
                <span className="absolute top-1 left-1 text-[9px] font-mono text-amber-400/60 uppercase">Title Safe 80%</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Subtitle Overlay on Video Screen */}
        {activeSubtitle && (
          <div className="absolute bottom-8 left-0 right-0 pointer-events-none flex flex-col items-center justify-center px-8 z-10">
            <div className="bg-black/90 px-4 py-2 rounded-sm shadow-2xl border border-black/50 text-center max-w-[85%] backdrop-blur-[2px]">
              {activeSpeaker && (
                <div 
                  className="text-xs font-bold tracking-wider mb-0.5 uppercase"
                  style={{ color: activeSpeaker.color || '#38bdf8' }}
                >
                  {activeSpeaker.displayName}
                </div>
              )}
              <div className="text-white text-base md:text-lg font-medium tracking-wide leading-snug whitespace-pre-line drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {activeSubtitle.text}
              </div>
            </div>
          </div>
        )}

        {/* Drag file banner if hovering */}
        {isDraggingFile && (
          <div className="absolute inset-0 bg-broadcast-darkest/80 flex flex-col items-center justify-center pointer-events-none">
            <Upload className="w-12 h-12 text-broadcast-accent animate-bounce" />
            <span className="text-broadcast-accent font-medium text-sm mt-2">
              Soltar archivo de vídeo aquí para reproducir localmente
            </span>
          </div>
        )}
      </div>



      {/* Control Transport Deck */}
      <div className="flex items-center justify-between px-3 py-2 bg-broadcast-darkest border-t border-broadcast-border">
        {/* Left: Playback controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => seekVideo(currentTime - 2.0)}
            title="Saltar -2 segundos (J)"
            className="p-1.5 rounded bg-broadcast-surface hover:bg-broadcast-border text-broadcast-textPrimary hover:text-broadcast-accent transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlayPause}
            title="Reproducir / Pausar (Barra Espaciadora)"
            className="p-2 rounded bg-teal-600 hover:bg-teal-500 text-white transition-transform active:scale-95 shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => seekVideo(currentTime + 2.0)}
            title="Saltar +2 segundos (L)"
            className="p-1.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-broadcast-textPrimary hover:text-white transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted(m => !m)}
            className={`p-1.5 rounded transition-colors ${
              isMuted ? 'text-amber-400 bg-broadcast-surface' : 'text-broadcast-textMuted hover:text-white'
            }`}
            title={isMuted ? 'Activar audio' : 'Silenciar audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Center: Precision Timecode (No harsh glow, crisp readable mono) */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-broadcast-textMuted font-sans">TIMECODE ACTUAL</span>
            <span className="text-base font-mono font-semibold text-teal-400 tracking-wider">
              {secondsToSMPTE(currentTime, activeJob?.fps || 25)}
            </span>
          </div>
        </div>

        {/* Right: Playback Speed selector */}
        <div className="flex items-center gap-1 text-xs font-sans">
          <span className="text-[10px] text-broadcast-textMuted mr-1">Velocidad:</span>
          {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                playbackRate === rate
                  ? 'bg-teal-600 text-white font-medium shadow-sm'
                  : 'bg-broadcast-surface text-broadcast-textMuted hover:text-white'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
