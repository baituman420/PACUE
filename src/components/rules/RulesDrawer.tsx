import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BookOpen, Search, Filter, AlertTriangle, ShieldAlert, CheckCircle2, 
  X, Check, AlertCircle, ArrowRight, ExternalLink, Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkRule, RuleLevel, RuleCategory } from '../../types';
import { WORK_RULES } from '../../data/workRules';

interface RulesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  highlightRuleId?: string | null;
}

export const RulesDrawer: React.FC<RulesDrawerProps> = ({ 
  isOpen, 
  onClose, 
  highlightRuleId 
}) => {
  const { activeJob } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | RuleLevel>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const highlightedRef = useRef<HTMLDivElement>(null);

  // When highlightRuleId is provided, jump directly to that rule
  useEffect(() => {
    if (highlightRuleId) {
      setSelectedRuleId(highlightRuleId);
      setLevelFilter('all');
      setCategoryFilter('all');
      setSearchQuery('');
    }
  }, [highlightRuleId]);

  // Scroll to highlighted rule when opened
  useEffect(() => {
    if (highlightRuleId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightRuleId, isOpen]);

  // Filter rules relevant to current client/project or general
  const availableRules = useMemo(() => {
    return WORK_RULES.filter(rule => {
      // General rules always apply
      if (rule.level === 'general') return true;
      // Client rules apply if matches active job client
      if (rule.level === 'client') {
        return !activeJob || rule.clientId === activeJob.clientId;
      }
      // Project rules apply if matches active job
      if (rule.level === 'project') {
        return !activeJob || rule.projectId === activeJob.id;
      }
      return true;
    });
  }, [activeJob]);

  // Categories present in available rules
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    availableRules.forEach(r => set.add(r.category));
    return Array.from(set);
  }, [availableRules]);

  // Filtered rules
  const filteredRules = useMemo(() => {
    return availableRules.filter(rule => {
      if (levelFilter !== 'all' && rule.level !== levelFilter) return false;
      if (categoryFilter !== 'all' && rule.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          rule.title.toLowerCase().includes(q) ||
          rule.shortDescription.toLowerCase().includes(q) ||
          rule.category.toLowerCase().includes(q) ||
          rule.correctExample?.toLowerCase().includes(q) ||
          rule.incorrectExample?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [availableRules, levelFilter, categoryFilter, searchQuery]);

  if (!isOpen) return null;

  const categoryLabels: Record<string, string> = {
    puntuacion: 'Puntuación',
    mayusculas: 'Mayúsculas/Minúsculas',
    numeros_fechas: 'Números y Fechas',
    identificacion_hablantes: 'Hablantes',
    sonidos_no_verbales: 'Sonidos No Verbales',
    musica_canciones: 'Música y Canciones',
    segmentacion_lineas: 'Segmentación',
    cortes_sintacticos: 'Cortes Sintácticos',
    velocidad_lectura: 'Velocidad (CPS)',
    caracteres_linea: 'Límites Caracteres',
    duracion: 'Duración',
    convenciones_formato: 'Convenciones Formato'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl h-full bg-broadcast-panel border-l border-broadcast-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-broadcast-border bg-broadcast-darkest flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-broadcast-accent/20 border border-broadcast-accent/50 text-broadcast-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  Reglas del Trabajo
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-broadcast-surface text-cyan-300 font-bold border border-broadcast-border">
                  {activeJob?.clientName || 'RTVE'} SDH
                </span>
              </div>
              <p className="text-[11px] text-broadcast-textMuted">
                Normas y directrices de estilo audiovisual activas para este proyecto
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

        {/* Filters Toolbar */}
        <div className="p-3 border-b border-broadcast-border bg-broadcast-darkest/70 space-y-2.5 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-broadcast-textMuted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar norma, ejemplo o criterio..."
              className="w-full pl-8 pr-3 py-1.5 bg-broadcast-surface rounded border border-broadcast-border text-xs text-white placeholder-broadcast-textMuted focus:outline-none focus:border-broadcast-accent font-sans"
            />
          </div>

          {/* Level Tabs (3 Levels of Rules) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none font-mono text-[11px]">
            <button
              onClick={() => setLevelFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                levelFilter === 'all'
                  ? 'bg-broadcast-accent text-black font-bold'
                  : 'bg-broadcast-surface text-broadcast-textMuted hover:text-white'
              }`}
            >
              Todas ({availableRules.length})
            </button>
            <button
              onClick={() => setLevelFilter('general')}
              className={`px-2.5 py-1 rounded transition-colors ${
                levelFilter === 'general'
                  ? 'bg-broadcast-accent text-black font-bold'
                  : 'bg-broadcast-surface text-broadcast-textMuted hover:text-white'
              }`}
            >
              1. Generales UNE ({availableRules.filter(r => r.level === 'general').length})
            </button>
            <button
              onClick={() => setLevelFilter('client')}
              className={`px-2.5 py-1 rounded transition-colors ${
                levelFilter === 'client'
                  ? 'bg-broadcast-accent text-black font-bold'
                  : 'bg-broadcast-surface text-broadcast-textMuted hover:text-white'
              }`}
            >
              2. Perfil Cliente ({availableRules.filter(r => r.level === 'client').length})
            </button>
            <button
              onClick={() => setLevelFilter('project')}
              className={`px-2.5 py-1 rounded transition-colors ${
                levelFilter === 'project'
                  ? 'bg-broadcast-accent text-black font-bold'
                  : 'bg-broadcast-surface text-broadcast-textMuted hover:text-white'
              }`}
            >
              3. Proyecto ({availableRules.filter(r => r.level === 'project').length})
            </button>
          </div>

          {/* Category Dropdown/Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
            <span className="text-broadcast-textMuted font-mono uppercase mr-1">Categoría:</span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2 py-0.5 rounded ${
                categoryFilter === 'all' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/50' : 'bg-broadcast-surface text-broadcast-textMuted hover:text-white'
              }`}
            >
              Todas
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded whitespace-nowrap ${
                  categoryFilter === cat ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/50' : 'bg-broadcast-surface text-broadcast-textMuted hover:text-white'
                }`}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {/* Rules Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {filteredRules.length === 0 ? (
            <div className="text-center py-16 text-broadcast-textMuted text-xs font-mono">
              No hay reglas que coincidan con la búsqueda.
            </div>
          ) : (
            filteredRules.map(rule => {
              const isHighlighted = highlightRuleId === rule.id || selectedRuleId === rule.id;

              return (
                <div
                  key={rule.id}
                  ref={isHighlighted ? highlightedRef : undefined}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isHighlighted
                      ? 'border-broadcast-accent bg-broadcast-surface/90 ring-1 ring-broadcast-accent shadow-xl'
                      : 'border-broadcast-border bg-broadcast-darkest/80 hover:border-broadcast-borderLight'
                  }`}
                >
                  {/* Top Bar of Rule: Level & Category & Severity */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                        rule.level === 'general'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800/40'
                          : rule.level === 'client'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                      }`}>
                        {rule.level === 'general' ? 'General UNE' : rule.level === 'client' ? `Cliente: ${activeJob?.clientName || 'RTVE'}` : 'Específica Proyecto'}
                      </span>

                      <span className="text-broadcast-textMuted">•</span>

                      <span className="text-broadcast-textMuted uppercase">
                        {categoryLabels[rule.category] || rule.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {rule.hasAutoCheck && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-700/40 font-bold" title="Esta regla genera advertencias automáticas en el motor QC">
                          ✓ Auto QC
                        </span>
                      )}

                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                        rule.severity === 'bloqueante'
                          ? 'bg-red-950 text-red-400 border border-red-800/50'
                          : rule.severity === 'advertencia'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}>
                        {rule.severity}
                      </span>
                    </div>
                  </div>

                  {/* Title & Short Description */}
                  <h3 className="text-sm font-bold text-white mb-1 tracking-wide">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-broadcast-textPrimary font-sans leading-relaxed mb-3">
                    {rule.shortDescription}
                  </p>

                  {/* Examples (Correct / Incorrect) */}
                  {(rule.correctExample || rule.incorrectExample) && (
                    <div className="space-y-1.5 p-2.5 rounded bg-broadcast-darkest border border-broadcast-border text-xs font-mono">
                      {rule.correctExample && (
                        <div className="flex items-start gap-2 text-emerald-400">
                          <span className="font-bold flex-shrink-0">✓ Correcto:</span>
                          <span className="text-emerald-200 whitespace-pre-line">{rule.correctExample}</span>
                        </div>
                      )}
                      {rule.incorrectExample && (
                        <div className="flex items-start gap-2 text-red-400 pt-1 border-t border-broadcast-border/50">
                          <span className="font-bold flex-shrink-0">✗ Incorrecto:</span>
                          <span className="text-red-200 whitespace-pre-line">{rule.incorrectExample}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-broadcast-border bg-broadcast-darkest flex items-center justify-between text-[11px] font-mono text-broadcast-textMuted">
          <span>{filteredRules.length} reglas listadas</span>
          <span className="text-broadcast-accent">Sistema de Normativa PACUE</span>
        </div>
      </div>
    </div>
  );
};
