import React, { useState } from 'react';
import { 
  Film, AlignLeft, SplitSquareVertical, Users, AlertTriangle, 
  Sparkles, CheckCircle2, BookOpen 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VideoMonitor } from './VideoMonitor';
import { TimelineTrack } from './TimelineTrack';
import { SegmentInspector } from './SegmentInspector';
import { SubtitleList } from './SubtitleList';
import { SpeakerDrawer } from '../speakers/SpeakerDrawer';
import { RulesDrawer } from '../rules/RulesDrawer';

export const EditorScreen: React.FC = () => {
  const { 
    selectedSegment, 
    speakers, 
    qcCounts, 
    selectedSegmentId,
    isRulesDrawerOpen,
    setIsRulesDrawerOpen,
    activeRuleIdToHighlight
  } = useApp();

  // Mode: 'timeline' (Timeline-first, default) | 'texto' (Vertical list) | 'split' (Combined)
  const [editorMode, setEditorMode] = useState<'timeline' | 'texto' | 'split'>('timeline');
  const [isSpeakerDrawerOpen, setIsSpeakerDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-broadcast-darkest overflow-hidden">
      {/* Top Secondary View Switcher Bar */}
      <div className="h-9 bg-broadcast-darkest border-b border-broadcast-border px-4 flex items-center justify-between text-xs select-none">
        {/* Left: View mode toggles */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-broadcast-textMuted mr-1">
            Modo de Trabajo:
          </span>
          <div className="flex items-center rounded bg-broadcast-surface border border-broadcast-border p-0.5">
            <button
              onClick={() => setEditorMode('timeline')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                editorMode === 'timeline'
                  ? 'bg-broadcast-accent text-black shadow'
                  : 'text-broadcast-textMuted hover:text-white'
              }`}
              title="Enfoque Timeline-First: Vídeo superior + Línea temporal con waveform y bloques espaciales"
            >
              <Film className="w-3.5 h-3.5" />
              <span>TIMELINE</span>
            </button>

            <button
              onClick={() => setEditorMode('texto')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                editorMode === 'texto'
                  ? 'bg-broadcast-accent text-black shadow'
                  : 'text-broadcast-textMuted hover:text-white'
              }`}
              title="Enfoque Texto: Revisión vertical masiva, filtros de QC y búsqueda"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>TEXTO</span>
            </button>

            <button
              onClick={() => setEditorMode('split')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                editorMode === 'split'
                  ? 'bg-broadcast-accent text-black shadow'
                  : 'text-broadcast-textMuted hover:text-white'
              }`}
              title="Vista Híbrida: Vídeo + Lista de texto + Timeline inferior"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>SPLIT</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Context Status & Speakers Modal Button */}
        <div className="flex items-center gap-3">
          {/* Active selection summary */}
          {selectedSegment ? (
            <div className="text-[11px] font-mono text-broadcast-textMuted hidden sm:flex items-center gap-2">
              <span>Seleccionado: <strong className="text-white">#{selectedSegment.number}</strong></span>
              <span
                className="font-bold px-1.5 py-0.2 rounded text-[10px]"
                style={{
                  color: speakers[selectedSegment.speakerId]?.color || '#38bdf8',
                  backgroundColor: `${speakers[selectedSegment.speakerId]?.color || '#38bdf8'}20`
                }}
              >
                {speakers[selectedSegment.speakerId]?.displayName}
              </span>
              <span>[{selectedSegment.startTime} - {selectedSegment.endTime}]</span>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-broadcast-textMuted hidden sm:inline">
              Ningún bloque seleccionado
            </span>
          )}

          {/* Speakers button */}
          <button
            onClick={() => setIsSpeakerDrawerOpen(true)}
            className="px-2.5 py-1 rounded bg-broadcast-surface hover:bg-broadcast-border border border-broadcast-border text-xs font-semibold text-broadcast-textPrimary hover:text-broadcast-accent flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>PERSONAJES</span>
          </button>

          {/* Work Rules button */}
          <button
            onClick={() => setIsRulesDrawerOpen(true)}
            className="px-2.5 py-1 rounded bg-broadcast-surface hover:bg-cyan-950/40 border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 transition-all shadow-sm"
            title="Consultar manual de estilo y reglas de subtitulado (UNE 153010, Cliente, Proyecto)"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wide">REGLAS</span>
          </button>
        </div>
      </div>

      {/* Main Dynamic Viewport */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* MODE 1: TIMELINE FIRST (Video Top + Timeline Bottom + Inspector Right) */}
        {editorMode === 'timeline' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Upper Area: Video Monitor + Compact Inspector */}
            <div className="h-[56%] flex border-b border-broadcast-border overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <VideoMonitor />
              </div>
              <div className="w-80 lg:w-96 flex-shrink-0 overflow-hidden">
                <SegmentInspector onOpenSpeakersModal={() => setIsSpeakerDrawerOpen(true)} />
              </div>
            </div>

            {/* Lower Main Area: Full-width Horizontal Timeline */}
            <div className="h-[44%] overflow-hidden">
              <TimelineTrack />
            </div>
          </div>
        )}

        {/* MODE 2: TEXTO FIRST (Video Left + Vertical SubtitleList Right) */}
        {editorMode === 'texto' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
            <div className="lg:col-span-7 h-full overflow-hidden flex flex-col">
              <VideoMonitor />
            </div>
            <div className="lg:col-span-5 h-full overflow-hidden flex flex-col">
              <SubtitleList />
            </div>
          </div>
        )}

        {/* MODE 3: SPLIT / HÍBRIDO (Top: Video + SubtitleList | Bottom: Timeline) */}
        {editorMode === 'split' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-[60%] grid grid-cols-1 lg:grid-cols-12 overflow-hidden border-b border-broadcast-border">
              <div className="lg:col-span-7 h-full overflow-hidden flex flex-col">
                <VideoMonitor />
              </div>
              <div className="lg:col-span-5 h-full overflow-hidden flex flex-col">
                <SubtitleList />
              </div>
            </div>
            <div className="h-[40%] overflow-hidden">
              <TimelineTrack />
            </div>
          </div>
        )}
      </div>

      {/* Speaker Drawer Modal */}
      <SpeakerDrawer
        isOpen={isSpeakerDrawerOpen}
        onClose={() => setIsSpeakerDrawerOpen(false)}
      />

      {/* Rules Drawer Modal */}
      <RulesDrawer
        isOpen={isRulesDrawerOpen}
        onClose={() => setIsRulesDrawerOpen(false)}
        highlightRuleId={activeRuleIdToHighlight}
      />
    </div>
  );
};
