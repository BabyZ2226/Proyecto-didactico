import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sparkles,
  Heart,
  Play,
  Plus,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Flame,
  Clock,
  Wand2,
  Edit3,
} from 'lucide-react';
import { LatinoGamePack, LatinoRoundQuestion } from '../types';
import { SEED_LATINOS_LIBRARY, filterAndSortLibrary } from '../lib/cienLatinosEngine';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';

interface LatinosLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackId?: string;
  onSelectPack: (pack: LatinoGamePack) => void;
  defaultAuthorName?: string;
}

const SUBJECTS = [
  'Todos',
  'Cultura General',
  'Química',
  'Biología',
  'Física',
  'Matemáticas',
  'Historia',
];

export const LatinosLibraryModal: React.FC<LatinosLibraryModalProps> = ({
  isOpen,
  onClose,
  selectedPackId,
  onSelectPack,
  defaultAuthorName = 'Profesor AulaPlay',
}) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'ai' | 'manual'>('explore');
  const [packs, setPacks] = useState<LatinoGamePack[]>(SEED_LATINOS_LIBRARY);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Todos');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'likes'>('popular');
  const [previewPackId, setPreviewPackId] = useState<string | null>(null);
  const [likedPackIds, setLikedPackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('po_liked_latinos_packs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI Creation states
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState('Cultura General');
  const [aiAuthor, setAiAuthor] = useState(defaultAuthorName);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessBanner, setAiSuccessBanner] = useState<string | null>(null);

  // Manual Creation states
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubject, setManualSubject] = useState('Cultura General');
  const [manualPrompt, setManualPrompt] = useState('');
  const [manualAns1, setManualAns1] = useState('');
  const [manualAns2, setManualAns2] = useState('');
  const [manualAns3, setManualAns3] = useState('');
  const [manualAns4, setManualAns4] = useState('');
  const [manualAns5, setManualAns5] = useState('');
  const [manualRounds, setManualRounds] = useState<LatinoRoundQuestion[]>([]);
  const [isSavingManual, setIsSavingManual] = useState(false);

  const fetchLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await fetch('/api/latinos-library');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.packs) && data.packs.length > 0) {
          setPacks(data.packs);
          localStorage.setItem('po_cached_latinos_library', JSON.stringify(data.packs));
        }
      }
    } catch {
      try {
        const cached = localStorage.getItem('po_cached_latinos_library');
        if (cached) setPacks(JSON.parse(cached));
      } catch {}
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLibrary();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.classList.add('library-open');
    } else {
      document.documentElement.classList.remove('library-open');
    }
    return () => {
      document.documentElement.classList.remove('library-open');
    };
  }, [isOpen]);

  const filteredPacks = useMemo(() => {
    return filterAndSortLibrary(packs, searchQuery, selectedSubject, sortBy);
  }, [packs, searchQuery, selectedSubject, sortBy]);

  const handleLikePack = async (packId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedPackIds.includes(packId)) return;
    playBalatroSound('select');

    const nextLiked = [...likedPackIds, packId];
    setLikedPackIds(nextLiked);
    localStorage.setItem('po_liked_latinos_packs', JSON.stringify(nextLiked));

    setPacks((prev) =>
      prev.map((p) => (p.id === packId ? { ...p, likesCount: p.likesCount + 1 } : p))
    );

    try {
      await fetch(`/api/latinos-library/${packId}/like`, { method: 'POST' });
    } catch {}
  };

  const handleUsePack = async (pack: LatinoGamePack) => {
    playBalatroSound('play');
    try {
      fetch(`/api/latinos-library/${pack.id}/play`, { method: 'POST' }).catch(() => {});
    } catch {}
    onSelectPack(pack);
    onClose();
  };

  const handleGenerateWithAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim() || isGeneratingAi) return;

    setIsGeneratingAi(true);
    setAiSuccessBanner(null);
    playBalatroSound('bubble');

    try {
      const res = await fetch('/api/generate-latinos-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          subject: aiSubject,
          authorName: aiAuthor.trim() || defaultAuthorName,
          roundsCount: 4,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.packs)) {
          setPacks(data.packs);
          localStorage.setItem('po_cached_latinos_library', JSON.stringify(data.packs));
        } else if (data.pack) {
          setPacks((prev) => [data.pack, ...prev]);
        }

        if (data.pack) {
          playBalatroSound('play');
          setAiTopic('');
          setAiSuccessBanner(
            `¡Pack "${data.pack.title}" creado con IA y guardado en la Biblioteca Infinita para todo el mundo!`
          );
          setActiveTab('explore');
          setSortBy('recent');
          setSelectedSubject('Todos');
        }
      }
    } catch (err) {
      console.error('Error generating AI pack:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddManualRound = () => {
    if (!manualPrompt.trim() || !manualAns1.trim() || !manualAns2.trim()) return;
    playBalatroSound('select');

    const newRound: LatinoRoundQuestion = {
      id: `mr_${Date.now()}_${manualRounds.length + 1}`,
      prompt: manualPrompt.trim(),
      subject: manualSubject,
      multiplier: manualRounds.length === 2 ? 2 : manualRounds.length >= 3 ? 3 : 1,
      answers: [
        { text: manualAns1.trim(), points: 35, synonyms: [manualAns1.trim().toLowerCase()] },
        { text: manualAns2.trim(), points: 25, synonyms: [manualAns2.trim().toLowerCase()] },
        {
          text: manualAns3.trim() || 'Respuesta Popular 3',
          points: 18,
          synonyms: [manualAns3.trim().toLowerCase()].filter(Boolean),
        },
        {
          text: manualAns4.trim() || 'Respuesta Popular 4',
          points: 12,
          synonyms: [manualAns4.trim().toLowerCase()].filter(Boolean),
        },
        {
          text: manualAns5.trim() || 'Respuesta Popular 5',
          points: 10,
          synonyms: [manualAns5.trim().toLowerCase()].filter(Boolean),
        },
      ],
    };

    setManualRounds((prev) => [...prev, newRound]);
    setManualPrompt('');
    setManualAns1('');
    setManualAns2('');
    setManualAns3('');
    setManualAns4('');
    setManualAns5('');
  };

  const handleSaveManualPack = async () => {
    if (!manualTitle.trim() || manualRounds.length === 0 || isSavingManual) return;
    setIsSavingManual(true);
    playBalatroSound('play');

    try {
      const res = await fetch('/api/latinos-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualTitle.trim(),
          description: `Pack comunitario de ${manualRounds.length} rondas sobre ${manualTitle.trim()}.`,
          subject: manualSubject,
          authorName: aiAuthor.trim() || defaultAuthorName,
          tags: [manualSubject.toLowerCase(), manualTitle.trim().toLowerCase()],
          rounds: manualRounds,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.packs)) {
          setPacks(data.packs);
        }
        setManualTitle('');
        setManualRounds([]);
        setAiSuccessBanner(`¡Pack "${data.pack?.title}" publicado en la Biblioteca Infinita!`);
        setActiveTab('explore');
        setSortBy('recent');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingManual(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative w-full min-h-screen h-auto z-[110] flex items-start justify-center bg-[#0e0c15] py-6 px-3 sm:p-5 select-none font-sans">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl bg-[#f4f4f6] border-2 border-zinc-300 shadow-[0_28px_80px_rgba(0,0,0,0.45)] flex flex-col h-auto text-zinc-900"
      >
        {/* Top Bar — Editorial Alabaster Strip */}
        <div className="px-5 sm:px-7 py-3 bg-[#eae9ec] border-b border-zinc-300 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <AulaPlayLogo size="sm" theme="dark" />
            <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-zinc-600 hidden sm:inline">
              · BIBLIOTECA INFINITA · 100 LATINOS DICEN
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            aria-label="Cerrar biblioteca"
            className="p-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 hover:text-zinc-900 border border-zinc-300 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Alabaster Header Strip — Matching Campamento & Bitácora Silhouette Header */}
        <div className="relative bg-[#f0f0f2] text-zinc-900 px-6 py-4 text-center border-b border-zinc-300 shrink-0 h-auto">
          <svg
            className="absolute right-0 top-0 w-72 h-32 text-zinc-400/20 pointer-events-none"
            viewBox="0 0 400 200"
            fill="currentColor"
          >
            <polygon points="180,0 400,0 400,160 280,90" />
            <polygon points="240,0 400,0 400,90" className="text-zinc-500/20" />
            <circle cx="290" cy="48" r="14" className="text-zinc-700/20" />
          </svg>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="font-serif text-lg sm:text-xl font-bold text-[#9e1b24] tracking-[0.22em] leading-none">
              VI · ARCHIVO DE ENCUESTAS
            </div>
            <h2 className="font-serif text-lg sm:text-2xl tracking-[0.18em] uppercase text-zinc-900 font-bold mt-1">
              Biblioteca Didáctica · 100 Latinos Dicen
            </h2>

            {/* Diamond Divider (───◇───) */}
            <div className="flex items-center justify-center w-56 sm:w-72 mx-auto my-1.5">
              <div className="flex-1 h-px bg-zinc-400" />
              <div className="w-2 h-2 rotate-45 border border-zinc-600 bg-[#f0f0f2] mx-2" />
              <div className="flex-1 h-px bg-zinc-400" />
            </div>

            <p className="text-xs text-zinc-600 font-serif">
              Busca y reutiliza tableros por equipos creados por docentes e IA para cualquier asignatura.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-7 py-2.5 bg-[#eae9ec] border-b border-zinc-300 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playBalatroSound('select');
                setActiveTab('explore');
              }}
              className={cn(
                'px-4 py-2 font-serif text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer shadow-xs',
                activeTab === 'explore'
                  ? 'bg-[#9e1b24] text-white border-[#9e1b24]'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
              )}
            >
              <Globe size={14} />
              <span>Explorar Biblioteca ({packs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playBalatroSound('select');
                setActiveTab('ai');
              }}
              className={cn(
                'px-4 py-2 font-serif text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer shadow-xs',
                activeTab === 'ai'
                  ? 'bg-[#9e1b24] text-white border-[#9e1b24]'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
              )}
            >
              <Wand2 size={14} />
              <span>Crear con IA</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playBalatroSound('select');
                setActiveTab('manual');
              }}
              className={cn(
                'px-4 py-2 font-serif text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer shadow-xs',
                activeTab === 'manual'
                  ? 'bg-[#9e1b24] text-white border-[#9e1b24]'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
              )}
            >
              <Edit3 size={14} />
              <span>Crear Manualmente</span>
            </button>
          </div>
        </div>

        {/* Success notification banner */}
        {aiSuccessBanner && (
          <div className="mx-6 mt-3 px-4 py-2.5 bg-emerald-50 border border-emerald-300 rounded-none flex items-center justify-between gap-2 text-xs text-emerald-800 font-serif">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>{aiSuccessBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setAiSuccessBanner(null)}
              className="text-emerald-700 hover:text-emerald-950 text-xs cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: EXPLORE INFINITE LIBRARY */}
        {activeTab === 'explore' && (
          <div className="flex-1 h-auto p-5 sm:p-6 space-y-5 bg-[#f4f4f6]">
            {/* Search, Subject Filter & Sort Bar */}
            <div className="bg-white border border-zinc-300 p-4 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por tema, asignatura, pregunta o autor (ej. Tabla Periódica, Célula, Planetas)..."
                    className="w-full bg-zinc-50 border border-zinc-300 focus:border-[#9e1b24] rounded-none pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none font-serif"
                  />
                </div>

                {/* Sort Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {[
                    { id: 'popular', label: 'Más Jugados', icon: Flame },
                    { id: 'recent', label: 'Recientes', icon: Clock },
                    { id: 'likes', label: 'Favoritos', icon: Heart },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = sortBy === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSortBy(item.id as any)}
                        className={cn(
                          'px-3 py-2 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 border cursor-pointer transition-all',
                          active
                            ? 'bg-[#9e1b24] text-white border-[#9e1b24]'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                        )}
                      >
                        <Icon size={13} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Filter Chips */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-200 flex-wrap">
                <div className="flex flex-wrap items-center gap-1.5 py-0.5">
                  {SUBJECTS.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        playBalatroSound('select');
                        setSelectedSubject(sub);
                      }}
                      className={cn(
                        'px-3 py-1 text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border',
                        selectedSubject === sub
                          ? 'bg-[#27272a] text-white border-[#27272a]'
                          : 'bg-white text-zinc-600 hover:bg-zinc-100 border-zinc-300'
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('ai')}
                  className="px-3 py-1 bg-white hover:bg-zinc-50 border border-[#9e1b24] text-[#9e1b24] text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles size={13} className="text-[#9e1b24]" />
                  <span>¿No encuentras tu tema? Créalo con IA</span>
                </button>
              </div>
            </div>

            {/* Library Packs Grid */}
            {isLoadingLibrary && packs.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 font-serif text-sm">
                Cargando Biblioteca Comunitaria...
              </div>
            ) : filteredPacks.length === 0 ? (
              <div className="text-center py-12 bg-white border border-dashed border-zinc-300 p-6 space-y-3">
                <p className="text-sm text-zinc-800 font-serif font-bold">
                  No se encontraron packs con "{searchQuery}".
                </p>
                <p className="text-xs text-zinc-600 font-serif">
                  ¡Puedes generarlo ahora mismo con IA y quedará guardado en la Biblioteca Infinita para todos!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAiTopic(searchQuery);
                    setActiveTab('ai');
                  }}
                  className="px-5 py-2.5 bg-[#9e1b24] hover:bg-[#80141b] text-white font-serif font-bold uppercase tracking-wider text-xs cursor-pointer inline-flex items-center gap-2 shadow-xs"
                >
                  <Wand2 size={15} />
                  <span>Generar "{searchQuery || 'Nuevo Tema'}" con IA</span>
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 library-invisible-scroll max-h-[65vh] pr-1">
                {filteredPacks.map((pack) => {
                  const isSelected = pack.id === selectedPackId;
                  const isPreviewOpen = previewPackId === pack.id;
                  const isLiked = likedPackIds.includes(pack.id);

                  return (
                    <div
                      key={pack.id}
                      className={cn(
                        'bg-white border p-5 flex flex-col justify-between transition-all shadow-xs',
                        isSelected
                          ? 'border-2 border-[#9e1b24] ring-2 ring-[#9e1b24]/20'
                          : 'border-zinc-300 hover:border-zinc-400'
                      )}
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-[#9e1b24] font-serif text-[10px] font-bold uppercase tracking-wider">
                              {pack.subject}
                            </span>
                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 font-mono text-[11px] border border-zinc-200">
                              {pack.rounds.length} Rondas
                            </span>
                            {pack.isAiGenerated && (
                              <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 font-serif text-[10px] flex items-center gap-1 font-bold">
                                <Sparkles size={10} />
                                <span>IA</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-serif text-zinc-500">
                            <span title="Partidas jugadas por la comunidad">
                              🎮 {pack.playsCount}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleLikePack(pack.id, e)}
                              className={cn(
                                'px-2 py-0.5 border flex items-center gap-1 cursor-pointer transition-colors',
                                isLiked
                                  ? 'bg-rose-50 border-rose-300 text-[#9e1b24]'
                                  : 'bg-white border-zinc-300 text-zinc-600 hover:text-[#9e1b24]'
                              )}
                            >
                              <Heart size={12} className={isLiked ? 'fill-[#9e1b24] text-[#9e1b24]' : ''} />
                              <span>{pack.likesCount}</span>
                            </button>
                          </div>
                        </div>

                        <h3 className="font-serif text-base sm:text-lg font-bold text-zinc-900 leading-snug">
                          {pack.title}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-serif">
                          {pack.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] font-serif text-zinc-500 mt-2.5">
                          <span>👤 Por: {pack.authorName}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPackId(isPreviewOpen ? null : pack.id)
                            }
                            className="text-[#9e1b24] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                          >
                            {isPreviewOpen ? <EyeOff size={13} /> : <Eye size={13} />}
                            <span>{isPreviewOpen ? 'Ocultar preguntas' : 'Ver preguntas'}</span>
                          </button>
                        </div>

                        {/* Expandable Preview of Rounds */}
                        <AnimatePresence>
                          {isPreviewOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-3 pt-3 border-t border-zinc-200 space-y-2 library-invisible-scroll max-h-52"
                            >
                              {pack.rounds.map((r, rIdx) => (
                                <div
                                  key={r.id || rIdx}
                                  className="bg-zinc-50 border border-zinc-200 p-2.5 text-xs"
                                >
                                  <div className="font-serif font-bold text-zinc-900 mb-1">
                                    Ronda {rIdx + 1}: {r.prompt}
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {r.answers.map((ans, aIdx) => (
                                      <span
                                        key={aIdx}
                                        className="px-2 py-0.5 bg-white border border-zinc-300 text-[11px] text-zinc-700 font-serif"
                                      >
                                        #{aIdx + 1} {ans.text} ({ans.points} pts)
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Select / Play Button */}
                      <button
                        type="button"
                        onClick={() => handleUsePack(pack)}
                        className={cn(
                          'mt-4 w-full py-2.5 font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs',
                          isSelected
                            ? 'bg-[#27272a] text-white'
                            : 'bg-[#9e1b24] hover:bg-[#80141b] text-white'
                        )}
                      >
                        <Play size={15} className="fill-current" />
                        <span>
                          {isSelected
                            ? '✓ Pack Activo · Jugar con este Pack'
                            : 'Seleccionar y Jugar este Pack'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI PACK GENERATOR (AUTO-SAVES TO INFINITE LIBRARY) */}
        {activeTab === 'ai' && (
          <div className="flex-1 h-auto p-6 sm:p-8 bg-[#f4f4f6]">
            <form onSubmit={handleGenerateWithAi} className="max-w-xl mx-auto space-y-5 bg-white border border-zinc-300 p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-50 border border-rose-200 flex items-center justify-center text-[#9e1b24]">
                  <Wand2 size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-zinc-900">
                    Generador IA con Guardado Permanente
                  </h3>
                  <p className="text-xs text-zinc-600 font-serif">
                    Escribe cualquier tema y la IA creará un pack de 4 rondas estilo "100 Latinos Dicen" y lo guardará automáticamente en la Biblioteca Infinita para toda la comunidad.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-serif font-bold uppercase tracking-wider text-zinc-800 block mb-1.5">
                  Tema o Contenido de tu Clase:
                </label>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ej. Sistema Solar, Segunda Guerra Mundial, Enlaces Químicos, Mitología Griega..."
                  className="w-full bg-zinc-50 border border-zinc-300 focus:border-[#9e1b24] px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none font-serif"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-serif font-bold uppercase tracking-wider text-zinc-800 block mb-1.5">
                    Asignatura / Categoría:
                  </label>
                  <select
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#9e1b24] font-serif"
                  >
                    {SUBJECTS.filter((s) => s !== 'Todos').map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-serif font-bold uppercase tracking-wider text-zinc-800 block mb-1.5">
                    Tu Nombre (Autor en la Biblioteca):
                  </label>
                  <input
                    type="text"
                    value={aiAuthor}
                    onChange={(e) => setAiAuthor(e.target.value)}
                    placeholder="Ej. Prof. García"
                    className="w-full bg-zinc-50 border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#9e1b24] font-serif"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isGeneratingAi || !aiTopic.trim()}
                className="w-full py-3.5 bg-[#9e1b24] hover:bg-[#80141b] disabled:opacity-50 text-white font-serif font-bold uppercase tracking-wider text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles size={18} />
                <span>
                  {isGeneratingAi
                    ? 'Generando Encuestas y Guardando en Biblioteca...'
                    : 'Generar Pack con IA y Guardar en Biblioteca Infinita'}
                </span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MANUAL PACK CREATOR */}
        {activeTab === 'manual' && (
          <div className="flex-1 h-auto p-5 sm:p-6 bg-[#f4f4f6]">
            <div className="max-w-2xl mx-auto space-y-4 bg-white border border-zinc-300 p-5 shadow-xs">
              <h3 className="font-serif text-base font-bold text-zinc-900">
                Crear Pack Personalizado y Publicar en la Biblioteca Infinita
              </h3>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-serif font-bold text-zinc-800 block mb-1">
                    Título del Pack:
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ej. Repaso Final de Biología"
                    className="w-full bg-zinc-50 border border-zinc-300 px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 font-serif focus:outline-none focus:border-[#9e1b24]"
                  />
                </div>
                <div>
                  <label className="text-xs font-serif font-bold text-zinc-800 block mb-1">
                    Asignatura:
                  </label>
                  <select
                    value={manualSubject}
                    onChange={(e) => setManualSubject(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 px-3 py-2 text-xs text-zinc-900 font-serif focus:outline-none focus:border-[#9e1b24]"
                  >
                    {SUBJECTS.filter((s) => s !== 'Todos').map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Round Sub-form */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-3">
                <label className="text-xs font-serif font-bold text-[#9e1b24] uppercase tracking-wider block">
                  Añadir Ronda #{manualRounds.length + 1} (5 Respuestas Populares = 100 Pts):
                </label>
                <input
                  type="text"
                  value={manualPrompt}
                  onChange={(e) => setManualPrompt(e.target.value)}
                  placeholder="Pregunta de encuesta (ej. Menciona un gas noble de la tabla periódica...)"
                  className="w-full bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 font-serif focus:outline-none focus:border-[#9e1b24]"
                />

                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={manualAns1}
                    onChange={(e) => setManualAns1(e.target.value)}
                    placeholder="#1 Respuesta más popular (35 pts)"
                    className="bg-white border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 font-serif placeholder:text-zinc-400 focus:outline-none focus:border-[#9e1b24]"
                  />
                  <input
                    type="text"
                    value={manualAns2}
                    onChange={(e) => setManualAns2(e.target.value)}
                    placeholder="#2 Segunda respuesta (25 pts)"
                    className="bg-white border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 font-serif placeholder:text-zinc-400 focus:outline-none focus:border-[#9e1b24]"
                  />
                  <input
                    type="text"
                    value={manualAns3}
                    onChange={(e) => setManualAns3(e.target.value)}
                    placeholder="#3 Tercera respuesta (18 pts)"
                    className="bg-white border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 font-serif placeholder:text-zinc-400 focus:outline-none focus:border-[#9e1b24]"
                  />
                  <input
                    type="text"
                    value={manualAns4}
                    onChange={(e) => setManualAns4(e.target.value)}
                    placeholder="#4 Cuarta respuesta (12 pts)"
                    className="bg-white border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 font-serif placeholder:text-zinc-400 focus:outline-none focus:border-[#9e1b24]"
                  />
                  <input
                    type="text"
                    value={manualAns5}
                    onChange={(e) => setManualAns5(e.target.value)}
                    placeholder="#5 Quinta respuesta (10 pts)"
                    className="bg-white border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 font-serif placeholder:text-zinc-400 focus:outline-none focus:border-[#9e1b24] sm:col-span-2"
                  />
                </div>

                <button
                  type="button"
                  disabled={!manualPrompt.trim() || !manualAns1.trim() || !manualAns2.trim()}
                  onClick={handleAddManualRound}
                  className="px-4 py-2 bg-[#27272a] hover:bg-[#18181b] disabled:opacity-40 text-white font-serif font-bold text-xs uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus size={14} />
                  <span>Añadir Ronda al Pack ({manualRounds.length} añadidas)</span>
                </button>
              </div>

              {manualRounds.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveManualPack}
                  disabled={!manualTitle.trim() || isSavingManual}
                  className="w-full py-3 bg-[#9e1b24] hover:bg-[#80141b] disabled:opacity-40 text-white font-serif font-bold uppercase tracking-wider text-xs sm:text-sm cursor-pointer shadow-xs"
                >
                  Guardar Pack ({manualRounds.length} Rondas) en la Biblioteca Infinita
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
