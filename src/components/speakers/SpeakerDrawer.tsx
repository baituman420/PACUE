import React, { useState, useMemo } from 'react';
import { 
  Users, UserCheck, AlertCircle, Edit2, Play, Check, X, Filter 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Speaker } from '../../types';

interface SpeakerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpeakerDrawer: React.FC<SpeakerDrawerProps> = ({ isOpen, onClose }) => {
  const {
    speakers,
    segments,
    renameSpeaker,
    viewSpeakerInterventions,
    selectedSpeakerFilter,
    setSelectedSpeakerFilter,
    selectedSegment,
    updateSegmentSpeaker
  } = useApp();

  // Dialog state for renaming
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [newName, setNewName] = useState('');
  const [applyMode, setApplyMode] = useState<'all' | 'single'>('all');

  // Compute intervention counts dynamically for each speaker
  const speakerStats = useMemo(() => {
    const counts: Record<string, number> = {};
    segments.forEach(seg => {
      counts[seg.speakerId] = (counts[seg.speakerId] || 0) + 1;
    });

    return Object.values(speakers).map(spk => ({
      ...spk,
      count: counts[spk.id] || 0
    })).sort((a, b) => b.count - a.count);
  }, [speakers, segments]);

  const handleOpenEdit = (spk: Speaker) => {
    setEditingSpeaker(spk);
    setNewName(spk.displayName.startsWith('Speaker') ? '' : spk.displayName);
    setApplyMode('all');
  };

  const handleConfirmRename = () => {
    if (!editingSpeaker || !newName.trim()) return;

    if (applyMode === 'all') {
      // Renames the speaker entity -> instantly renames all 24 interventions via speakerId!
      renameSpeaker(editingSpeaker.id, newName.trim(), true);
    } else {
      // Single block mode: if user chose "Sólo este bloque", we create or assign
      if (selectedSegment) {
        // If a speaker with this name exists, assign it, else rename current
        const existing = Object.values(speakers).find(s => s.displayName.toLowerCase() === newName.trim().toLowerCase());
        if (existing) {
          updateSegmentSpeaker(selectedSegment.id, existing.id);
        } else {
          renameSpeaker(editingSpeaker.id, newName.trim(), true);
        }
      }
    }

    setEditingSpeaker(null);
    setNewName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-broadcast-panel border-l border-broadcast-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-broadcast-border bg-broadcast-darkest">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-broadcast-accent" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Hablantes Detectados
              </h2>
              <p className="text-[11px] text-broadcast-textMuted">
                Gestión y normalización de personajes del audio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-broadcast-textMuted hover:text-white hover:bg-broadcast-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Filter Indicator */}
        {selectedSpeakerFilter && (
          <div className="bg-broadcast-surface px-4 py-2 border-b border-broadcast-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-broadcast-accent">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrando por: <strong>{speakers[selectedSpeakerFilter]?.displayName}</strong></span>
            </div>
            <button
              onClick={() => setSelectedSpeakerFilter(null)}
              className="text-xs text-broadcast-textMuted hover:text-white underline"
            >
              Quitar filtro
            </button>
          </div>
        )}

        {/* Speaker List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {speakerStats.map(spk => {
            const isUnidentified = !spk.confirmed || spk.displayName.startsWith('Speaker');
            const isFilterActive = selectedSpeakerFilter === spk.id;

            return (
              <div
                key={spk.id}
                className={`p-3 rounded border transition-all ${
                  isFilterActive
                    ? 'border-broadcast-accent bg-broadcast-accent/10 shadow-lg'
                    : 'border-broadcast-border bg-broadcast-darkest/60 hover:border-broadcast-borderLight'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: spk.color || '#D8D1C5' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white tracking-wide">
                          {spk.displayName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-broadcast-surface text-broadcast-textMuted">
                          {spk.id}
                        </span>
                      </div>
                      <div className="text-xs text-broadcast-textMuted mt-0.5 flex items-center gap-2">
                        <span className="font-medium text-white">{spk.count} intervenciones</span>
                        <span>•</span>
                        {isUnidentified ? (
                          <span className="text-broadcast-amber flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Sin identificar
                          </span>
                        ) : (
                          <span className="text-[#BEB6AA] flex items-center gap-1">
                            <Check className="w-3 h-3 text-[#D8D1C5]" /> Confirmado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(spk)}
                      title="Asignar personaje o renombrar"
                      className="p-1.5 rounded bg-broadcast-surface hover:bg-broadcast-border text-broadcast-textPrimary hover:text-broadcast-accent transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Action Bar: VER INTERVENCIONES */}
                <div className="mt-3 pt-2 border-t border-broadcast-border/50 flex items-center justify-between">
                  <button
                    onClick={() => {
                      viewSpeakerInterventions(spk.id);
                      onClose();
                    }}
                    className="w-full py-1.5 px-2.5 rounded bg-broadcast-surface hover:bg-broadcast-border text-xs font-semibold text-broadcast-accent hover:text-white flex items-center justify-center gap-1.5 transition-colors border border-broadcast-border"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>VER INTERVENCIONES ({spk.count})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="p-3 border-t border-broadcast-border bg-broadcast-darkest text-[11px] text-broadcast-textMuted flex items-center justify-between">
          <span>Total identificados: {speakerStats.filter(s => s.confirmed).length} / {speakerStats.length}</span>
          <span className="text-broadcast-accent">PACUE Speaker Engine</span>
        </div>

        {/* Inline Modal: Asignar Personaje */}
        {editingSpeaker && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-sm bg-broadcast-panel border border-broadcast-border rounded shadow-2xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-broadcast-border">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-broadcast-accent" />
                  Asignar Personaje
                </h3>
                <button
                  onClick={() => setEditingSpeaker(null)}
                  className="text-broadcast-textMuted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-broadcast-textMuted mb-1 uppercase">
                    Hablante original
                  </label>
                  <div className="px-3 py-1.5 bg-broadcast-darkest rounded border border-broadcast-border text-sm font-semibold text-broadcast-textMuted">
                    {editingSpeaker.displayName} ({editingSpeaker.id})
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-broadcast-accent mb-1 uppercase">
                    Nombre del Personaje
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: MARTA"
                    autoFocus
                    className="w-full px-3 py-2 bg-broadcast-darkest rounded border border-broadcast-accent text-sm text-white font-medium focus:outline-none focus:ring-1 focus:ring-broadcast-accent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmRename();
                      if (e.key === 'Escape') setEditingSpeaker(null);
                    }}
                  />
                  <span className="text-[10px] text-broadcast-textMuted mt-1 block">
                    Ejemplos: MARTA, JUAN, ALCALDESA, TESTIGO 1
                  </span>
                </div>

                {/* Scope selector */}
                <div className="space-y-2 pt-2 border-t border-broadcast-border">
                  <label className="block text-xs font-mono text-broadcast-textMuted uppercase">
                    Aplicar a:
                  </label>
                  <label className="flex items-center gap-2 text-xs text-broadcast-textPrimary cursor-pointer">
                    <input
                      type="radio"
                      name="applyScope"
                      checked={applyMode === 'all'}
                      onChange={() => setApplyMode('all')}
                      className="accent-[#B79D72]"
                    />
                    <span>
                      <strong>Todas las intervenciones de {editingSpeaker.displayName}</strong>{' '}
                      ({speakerStats.find(s => s.id === editingSpeaker.id)?.count || 0} bloques)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-broadcast-textMuted cursor-pointer">
                    <input
                      type="radio"
                      name="applyScope"
                      checked={applyMode === 'single'}
                      onChange={() => setApplyMode('single')}
                      className="accent-[#B79D72]"
                    />
                    <span>Sólo este bloque seleccionado</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-broadcast-border">
                <button
                  onClick={() => setEditingSpeaker(null)}
                  className="px-3 py-1.5 rounded bg-broadcast-surface hover:bg-broadcast-border text-xs text-broadcast-textMuted hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmRename}
                  disabled={!newName.trim()}
                  className="px-4 py-1.5 rounded bg-broadcast-accent hover:bg-broadcast-accentHover text-black text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>CONFIRMAR</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
