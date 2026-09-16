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
      <div className="h-8 bg-broadcast-darkest border-b border-broadcast-border px-3 flex items-center justify-between text-xs select-none">
        {/* Left: View mode toggles */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-broadcast-textMuted font-sans uppercase tracking-wider mr-1">
            Modo:
          </span>
          <div className="flex items-center rounded bg-broadcast-surface p-0.5">
            <button
              onClick={() => setEditorMode('timeline')}
              className={`px-2.5 py-0.5 rounded text-xs font-sans transition-colors ${
                editorMode === 'timeline'
                  ? 'bg-broadcast-surfaceHover text-broadcast-textPrimary font-medium border border-[#B79D72]'
                  : 'text-broadcast-textMuted hover:text-broadcast-textSecondary'
              }`}
              title="Enfoque Timeline-First: Vídeo superior + Línea temporal con waveform y bloques espaciales"
            >
              Timeline
            </button>

            <button
              onClick={() => setEditorMode('texto')}
              className={`px-2.5 py-0.5 rounded text-xs font-sans transition-colors ${
                editorMode === 'texto'
                  ? 'bg-broadcast-surfaceHover text-broadcast-textPrimary font-medium border border-[#B79D72]'
                  : 'text-broadcast-textMuted hover:text-broadcast-textSecondary'
              }`}
              title="Enfoque Texto: Revisión vertical masiva, filtros de QC y búsqueda"
            >
              Texto
            </button>

            <button
              onClick={() => setEditorMode('split')}
              className={`px-2.5 py-0.5 rounded text-xs font-sans transition-colors ${
                editorMode === 'split'
                  ? 'bg-broadcast-surfaceHover text-broadcast-textPrimary font-medium border border-[#B79D72]'
                  : 'text-broadcast-textMuted hover:text-broadcast-textSecondary'
              }`}
              title="Vista Híbrida: Vídeo + Lista de texto + Timeline inferior"
            >
              Split
            </button>
          </div>
        </div>

        {/* Right: Quick Context Status & Speakers Modal Button */}
        <div className="flex items-center gap-2 font-sans">
          {/* Active selection summary */}
          {selectedSegment ? (
            <div className="text-[11px] text-broadcast-textMuted hidden sm:flex items-center gap-1.5">
              <span>Selección: <strong className="text-broadcast-textPrimary font-mono">#{selectedSegment.number}</strong></span>
              <span
                className="font-medium px-1 rounded text-[10px]"
                style={{
                  color: speakers[selectedSegment.speakerId]?.color || '#BEB6AA',
                  backgroundColor: `${speakers[selectedSegment.speakerId]?.color || '#BEB6AA'}15`
                }}
              >
                {speakers[selectedSegment.speakerId]?.displayName}
              </span>
              <span className="font-mono text-[10px] text-broadcast-textMuted">[{selectedSegment.startTime} - {selectedSegment.endTime}]</span>
            </div>
          ) : (
            <span className="text-[11px] text-broadcast-textMuted hidden sm:inline">
              Sin selección
            </span>
          )}

          {/* Speakers button */}
          <button
            onClick={() => setIsSpeakerDrawerOpen(true)}
            className="px-2 py-0.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-xs font-medium text-broadcast-textSecondary hover:text-broadcast-textPrimary flex items-center gap-1 transition-colors border border-broadcast-border"
          >
            <Users className="w-3 h-3 text-broadcast-textMuted" />
            <span>Personajes</span>
          </button>

          {/* Work Rules button */}
          <button
            onClick={() => setIsRulesDrawerOpen(true)}
            className="px-2 py-0.5 rounded bg-broadcast-surface hover:bg-broadcast-surfaceHover text-xs font-medium text-broadcast-textSecondary hover:text-broadcast-textPrimary flex items-center gap-1 transition-colors border border-broadcast-border"
            title="Consultar manual de estilo y reglas de subtitulado"
          >
            <BookOpen className="w-3 h-3 text-broadcast-textMuted" />
            <span>Reglas</span>
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
