import React, { useRef, useEffect, useMemo, useState } from 'react';
import { 
  Users, Upload, Search, ChevronUp, ChevronDown, AlertTriangle, 
  CheckCircle2, Clock, Filter, Check, ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubtitleSegment, QCFilterKey } from '../../types';
import { filterSegmentsByQC, calculateCPS } from '../../services/qcService';
import { SpeakerDrawer } from '../speakers/SpeakerDrawer';
import { ImportModal } from './ImportModal';

export const SubtitleList: React.FC = () => {
  const {
    segments,
    speakers,
    selectedSegmentId,
    selectSegment,
    updateSegmentText,
    activeQCFilter,
    setActiveQCFilter,
    selectedSpeakerFilter,
    setSelectedSpeakerFilter,
    searchQuery,
    setSearchQuery,
    qcCounts,
    jumpToPrevSegment,
    jumpToNextSegment,
    currentTime,
    qcProfile,
    togglePlayPause
  } = useApp();

  const [isSpeakerDrawerOpen, setIsSpeakerDrawerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const activeRowRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Filter segments based on QC tab, Speaker filter, and Search Query
  const displayedSegments = useMemo(() => {
    let result = filterSegmentsByQC(segments, activeQCFilter);

    if (selectedSpeakerFilter) {
      result = result.filter(s => s.speakerId === selectedSpeakerFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.text.toLowerCase().includes(q) || 
        speakers[s.speakerId]?.displayName.toLowerCase().includes(q) ||
        String(s.number).includes(q)
      );
    }

    return result;
  }, [segments, activeQCFilter, selectedSpeakerFilter, searchQuery, speakers]);

  // Current playing segment (matches current video time)
  const playingSegmentId = useMemo(() => {
    const found = segments.find(s => currentTime >= s.startSeconds && currentTime <= s.endSeconds);
    return found ? found.id : null;
  }, [segments, currentTime]);

  // Auto scroll to active/playing segment smoothly when playing or jumping
  useEffect(() => {
    const targetId = selectedSegmentId || playingSegmentId;
    if (targetId && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [selectedSegmentId, playingSegmentId]);

  // Global keyboard shortcuts for editing workflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Ctrl/Cmd + Enter: Confirm/Blur current editing field
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (isInputFocused) {
          target.blur();
          e.preventDefault();
        }
        return;
      }

      // Space: Play/Pause only when not typing inside an input/textarea
      if (e.code === 'Space' && !isInputFocused) {
        e.preventDefault();
        togglePlayPause();
        return;
      }

      // Arrow Up / Down: Move between segments when not actively typing text
      if (!isInputFocused) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          jumpToPrevSegment();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          jumpToNextSegment();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, jumpToPrevSegment, jumpToNextSegment]);

  const qcFilterKeys: QCFilterKey[] = [
    'TODOS',
    'HABLANTE ?',
    'TEXTO LARGO',
    'LECTURA RÁPIDA',
    'SOLAPAMIENTO',
    'TIMECODE'
  ];

  return (
    <div className="flex flex-col h-full bg-broadcast-panel select-none">
      {/* Top Toolbar with QC Filter Tabs & Live Counters */}
      <div className="border-b border-broadcast-border bg-broadcast-darkest p-2 space-y-2">
        {/* QC Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          {qcFilterKeys.map(filterKey => {
            const count = qcCounts[filterKey] || 0;
            const isActive = activeQCFilter === filterKey;
            const hasIssues = filterKey !== 'TODOS' && count > 0;

            return (
              <button
                key={filterKey}
                onClick={() => setActiveQCFilter(filterKey)}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-broadcast-accent text-black border-broadcast-accent'
                    : hasIssues
                    ? 'bg-broadcast-surface text-broadcast-amber border-broadcast-amber/30 hover:border-broadcast-amber'
                    : 'bg-broadcast-surface text-broadcast-textMuted border-broadcast-border hover:border-broadcast-borderLight hover:text-white'
                }`}
              >
                <span>{filterKey}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isActive ? 'bg-black/30 text-black' : 'bg-black/40 text-broadcast-textPrimary'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Action Bar: Search + Speakers + Import + Prev/Next */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-broadcast-textMuted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por texto o personaje..."
              className="w-full pl-8 pr-3 py-1 bg-broadcast-surface rounded border border-broadcast-border text-xs text-white placeholder-broadcast-textMuted focus:outline-none focus:border-broadcast-accent"
            />
          </div>

          {/* Speaker Drawer Action */}
          <button
            onClick={() => setIsSpeakerDrawerOpen(true)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              selectedSpeakerFilter
                ? 'bg-broadcast-accent/20 border-broadcast-accent text-broadcast-accent'
                : 'bg-broadcast-surface hover:bg-broadcast-border border-broadcast-border text-broadcast-textPrimary hover:text-white'
            }`}
            title="Abrir panel de hablantes y personajes detectados"
          >
            <Users className="w-3.5 h-3.5" />
            <span>PERSONAJES</span>
            {selectedSpeakerFilter && (
              <span className="text-[10px] bg-broadcast-accent text-black px-1 rounded font-bold">
                1
              </span>
            )}
          </button>

          {/* Import Action */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-2.5 py-1 rounded bg-broadcast-surface hover:bg-broadcast-border border border-broadcast-border text-xs font-semibold text-broadcast-accent hover:text-white flex items-center gap-1.5 transition-colors"
            title="Importar subtítulos SRT o JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>IMPORTAR</span>
          </button>

          {/* Segment Navigation */}
          <div className="flex items-center border border-broadcast-border rounded overflow-hidden">
            <button
              onClick={jumpToPrevSegment}
              title="Bloque anterior (Flecha Arriba)"
              className="p-1 bg-broadcast-surface hover:bg-broadcast-border text-broadcast-textMuted hover:text-white border-r border-broadcast-border"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={jumpToNextSegment}
              title="Bloque siguiente (Flecha Abajo)"
              className="p-1 bg-broadcast-surface hover:bg-broadcast-border text-broadcast-textMuted hover:text-white"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter status banner if speaker filter active */}
        {selectedSpeakerFilter && (
          <div className="flex items-center justify-between px-2 py-1 bg-broadcast-accent/10 border border-broadcast-accent/30 rounded text-[11px] text-broadcast-accent">
            <span>Filtrando intervenciones de: <strong>{speakers[selectedSpeakerFilter]?.displayName}</strong></span>
            <button
              onClick={() => setSelectedSpeakerFilter(null)}
              className="hover:underline font-bold text-white"
            >
              Ver todos
            </button>
          </div>
        )}
      </div>

      {/* Subtitle Blocks Vertical List */}
      <div 
        ref={listContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin"
      >
        {displayedSegments.length === 0 ? (
          <div className="text-center py-16 text-broadcast-textMuted text-xs">
            No hay bloques de subtítulos que coincidan con los filtros actuales.
          </div>
        ) : (
          displayedSegments.map(segment => {
            const isSelected = segment.id === selectedSegmentId;
            const isPlaying = segment.id === playingSegmentId;
            const speaker = speakers[segment.speakerId];
            const duration = Math.max(0.01, segment.endSeconds - segment.startSeconds);
            const cps = calculateCPS(segment.text, duration);
            const isHighCps = cps > qcProfile.maxCps;
            const isUnidentifiedSpeaker = !speaker || !speaker.confirmed || speaker.displayName.toLowerCase().startsWith('speaker');

            return (
              <div
                key={segment.id}
                ref={isSelected ? activeRowRef : undefined}
                onClick={() => selectSegment(segment.id, true)}
                className={`p-3 rounded border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-broadcast-accent bg-broadcast-surface/90 ring-1 ring-broadcast-accent shadow-lg'
                    : isPlaying
                    ? 'border-cyan-600/60 bg-cyan-950/20'
                    : 'border-broadcast-border bg-broadcast-darkest/70 hover:border-broadcast-borderLight'
                }`}
              >
                {/* Header of Block: #Number, Timecode in/out, Duration, Speaker */}
                <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-broadcast-textMuted text-[11px]">
                      #{segment.number}
                    </span>
                    <span className="font-mono text-cyan-400 font-semibold text-[11px]">
                      {segment.startTime}
                    </span>
                    <span className="text-broadcast-textMuted text-[10px]">→</span>
                    <span className="font-mono text-cyan-400 font-semibold text-[11px]">
                      {segment.endTime}
                    </span>
                    <span className="text-[10px] font-mono text-broadcast-textMuted">
                      ({duration.toFixed(2)}s)
                    </span>
                  </div>

                  {/* Speaker pill badge */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSpeakerDrawerOpen(true);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase transition-transform hover:scale-105"
                      style={{
                        backgroundColor: speaker?.color ? `${speaker.color}25` : '#38bdf825',
                        color: speaker?.color || '#38bdf8',
                        border: `1px solid ${speaker?.color || '#38bdf8'}50`
                      }}
                      title="Haz clic para gestionar este personaje"
                    >
                      {speaker?.displayName || segment.speakerId}
                    </button>
                  </div>
                </div>

                {/* Subtitle Text Content Editor */}
                <div className="relative">
                  <textarea
                    value={segment.text}
                    onChange={(e) => updateSegmentText(segment.id, e.target.value)}
                    rows={2}
                    className="w-full bg-broadcast-darkest px-2.5 py-1.5 rounded border border-broadcast-border text-sm text-white font-sans focus:outline-none focus:border-broadcast-accent focus:ring-1 focus:ring-broadcast-accent resize-none leading-relaxed select-text"
                    onClick={(e) => e.stopPropagation()}
                    onFocus={() => selectSegment(segment.id, false)}
                  />
                </div>

                {/* Footer of Block: Warnings & Metrics (CPS, length) */}
                <div className="flex items-center justify-between mt-1.5 text-[10px]">
                  {/* Left: Warnings badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {segment.warnings?.map((w, wIdx) => (
                      <span
                        key={wIdx}
                        className={`px-1.5 py-0.5 rounded flex items-center gap-1 font-mono font-medium ${
                          w.severity === 'error'
                            ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        }`}
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>{w.message}</span>
                      </span>
                    ))}
                    {(!segment.warnings || segment.warnings.length === 0) && (
                      <span className="text-broadcast-textMuted flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-broadcast-success" /> QC OK
                      </span>
                    )}
                  </div>

                  {/* Right: CPS and line characters indicator */}
                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={`font-semibold ${
                        isHighCps ? 'text-broadcast-amber' : 'text-broadcast-textMuted'
                      }`}
                    >
                      {cps} CPS
                    </span>
                    <span className="text-broadcast-textMuted">
                      {segment.text.replace(/\n/g, ' ').length} car
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="px-3 py-2 border-t border-broadcast-border bg-broadcast-darkest flex items-center justify-between text-[11px] font-mono text-broadcast-textMuted">
        <div className="flex items-center gap-3">
          <span>Mostrando: <strong className="text-white">{displayedSegments.length}</strong> / {segments.length} bloques</span>
          <span>•</span>
          <span>Atajos: [Espacio] Play/Pausa • [↑/↓] Navegar • [Ctrl+Enter] Guardar</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-broadcast-accent">PACUE Editor Core</span>
        </div>
      </div>

      {/* Speaker Drawer */}
      <SpeakerDrawer
        isOpen={isSpeakerDrawerOpen}
        onClose={() => setIsSpeakerDrawerOpen(false)}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
