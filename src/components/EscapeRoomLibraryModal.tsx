import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sparkles,
  BookOpen,
  Heart,
  Play,
  Plus,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Edit3,
  DoorOpen,
} from 'lucide-react';
import { EscapeRoomPack, EscapeRoomQuestion } from '../types';
import { SEED_ESCAPE_ROOM_LIBRARY, filterAndSortEscapeLibrary } from '../lib/escapeRoomEngine';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';

interface EscapeRoomLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackId?: string;
  onSelectPack: (pack: EscapeRoomPack) => void;
  defaultAuthorName?: string;
}

const SUBJECTS = [
  'Todos',
  'Multidisciplinar',
  'Química',
  'Biología',
  'Física',
  'Matemáticas',
  'Historia',
];

export const EscapeRoomLibraryModal: React.FC<EscapeRoomLibraryModalProps> = ({
  isOpen,
  onClose,
  selectedPackId,
  onSelectPack,
  defaultAuthorName = 'Profesor AulaPlay',
}) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'ai' | 'manual'>('explore');
  const [packs, setPacks] = useState<EscapeRoomPack[]>(SEED_ESCAPE_ROOM_LIBRARY);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Todos');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'likes'>('popular');
  const [previewPackId, setPreviewPackId] = useState<string | null>(null);
  const [likedPackIds, setLikedPackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('po_liked_escape_packs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI Creation states (10 Chambers)
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState('Multidisciplinar');
  const [aiAuthor, setAiAuthor] = useState(defaultAuthorName);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessBanner, setAiSuccessBanner] = useState<string | null>(null);

  // Manual Creation states
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubject, setManualSubject] = useState('Multidisciplinar');
  const [manualDescription, setManualDescription] = useState('');
  const [manualChambers, setManualChambers] = useState<EscapeRoomQuestion[]>([]);
  const [curQText, setCurQText] = useState('');
  const [curOpt0, setCurOpt0] = useState('');
  const [curOpt1, setCurOpt1] = useState('');
  const [curOpt2, setCurOpt2] = useState('');
  const [curOpt3, setCurOpt3] = useState('');
  const [curCorrectIdx, setCurCorrectIdx] = useState(0);
  const [curLockCode, setCurLockCode] = useState('');
  const [isSavingManual, setIsSavingManual] = useState(false);

  const fetchLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await fetch('/api/escape-room-library');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.packs) && data.packs.length > 0) {
          setPacks(data.packs);
          localStorage.setItem('po_cached_escape_library', JSON.stringify(data.packs));
        }
      }
    } catch {
      try {
        const cached = localStorage.getItem('po_cached_escape_library');
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
    return filterAndSortEscapeLibrary(packs, selectedSubject, searchQuery, sortBy);
  }, [packs, searchQuery, selectedSubject, sortBy]);

  const handleLikePack = async (packId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedPackIds.includes(packId)) return;
    playBalatroSound('select');

    const nextLiked = [...likedPackIds, packId];
    setLikedPackIds(nextLiked);
    localStorage.setItem('po_liked_escape_packs', JSON.stringify(nextLiked));

    setPacks((prev) =>
      prev.map((p) => (p.id === packId ? { ...p, likesCount: p.likesCount + 1 } : p))
    );

    try {
      await fetch(`/api/escape-room-library/${packId}/like`, { method: 'POST' });
    } catch {}
  };

  const handleUsePack = async (pack: EscapeRoomPack) => {
    playBalatroSound('play');
    try {
      fetch(`/api/escape-room-library/${pack.id}/play`, { method: 'POST' }).catch(() => {});
    } catch {}
    onSelectPack(pack);
  };

  const handleGenerateAiPack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setIsGeneratingAi(true);
    setAiSuccessBanner(null);
    playBalatroSound('bubble');

    try {
      const res = await fetch('/api/generate-escape-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          subject: aiSubject,
          authorName: aiAuthor.trim() || 'Profesor con IA',
        }),
      });

      if (!res.ok) throw new Error('Error generando pack');
      const data = await res.json();
      if (data.pack) {
        setPacks((prev) => [data.pack, ...prev.filter((p) => p.id !== data.pack.id)]);
        setAiSuccessBanner(`¡Escape Room "${data.pack.title}" (10 Cámaras) generado y guardado en la Biblioteca Infinita!`);
        playBalatroSound('deal');
        setTimeout(() => {
          setActiveTab('explore');
          setPreviewPackId(data.pack.id);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      alert('Hubo un error al generar con IA. Inténtalo de nuevo.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddManualChamber = () => {
    if (!curQText.trim() || !curOpt0.trim() || !curOpt1.trim()) {
      alert('Por favor ingresa la pregunta y al menos las 2 primeras opciones.');
      return;
    }
    const options = [curOpt0.trim(), curOpt1.trim(), curOpt2.trim(), curOpt3.trim()].filter(Boolean);
    const chamberNum = manualChambers.length + 1;
    const newQ: EscapeRoomQuestion = {
      id: `q_${Date.now()}_${chamberNum}`,
      chamberTitle: `Cámara ${chamberNum}: Enigma #${chamberNum}`,
      question: curQText.trim(),
      options,
      correctOptionIndex: Math.min(curCorrectIdx, options.length - 1),
      lockCode: curLockCode.trim() || `L${chamberNum * 10}`,
      subject: manualSubject,
      hint: `Resuelve la Cámara ${chamberNum}.`,
    };

    setManualChambers((prev) => [...prev, newQ]);
    setCurQText('');
    setCurOpt0('');
    setCurOpt1('');
    setCurOpt2('');
    setCurOpt3('');
    setCurLockCode('');
    setCurCorrectIdx(0);
    playBalatroSound('click');
  };

  const handleSaveManualPack = async () => {
    if (!manualTitle.trim()) {
      alert('Por favor ingresa el título del Escape Room.');
      return;
    }
    if (manualChambers.length < 2) {
      alert('Agrega al menos 2 cámaras (recomendado 10 cámaras para un escape completo).');
      return;
    }

    setIsSavingManual(true);
    playBalatroSound('deal');
    try {
      const res = await fetch('/api/escape-room-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualTitle.trim(),
          description: manualDescription.trim() || `Escape Room de ${manualChambers.length} cámaras creado por el docente.`,
          subject: manualSubject,
          authorName: defaultAuthorName,
          tags: [manualSubject.toLowerCase(), `${manualChambers.length} cámaras`, 'manual'],
          chambers: manualChambers,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar');
      const data = await res.json();
      if (data.pack) {
        setPacks((prev) => [data.pack, ...prev]);
        setActiveTab('explore');
        setPreviewPackId(data.pack.id);
        setManualTitle('');
        setManualDescription('');
        setManualChambers([]);
        playBalatroSound('play');
      }
    } catch {
      alert('No se pudo guardar en la biblioteca.');
    } finally {
      setIsSavingManual(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative w-full min-h-screen h-auto z-50 flex items-start justify-center py-6 px-3 sm:p-5 bg-[#0e0c15] select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="w-full max-w-5xl h-auto bg-[#f4f4f6] border-2 border-zinc-300 shadow-[0_28px_80px_rgba(0,0,0,0.45)] flex flex-col text-zinc-900"
      >
        {/* Top Bar — Refined Alabaster Stone Header */}
        <div className="px-5 sm:px-7 py-3 bg-[#eae9ec] border-b border-zinc-300 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <AulaPlayLogo size="sm" theme="light" />
            <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-zinc-600 hidden sm:inline">
              · BIBLIOTECA INFINITA · ESCAPE ROOM (10 CÁMARAS)
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            className="p-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 hover:text-zinc-900 border border-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar biblioteca"
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
              V · ARCHIVO DE CÁMARAS
            </div>
            <h2 className="font-serif text-lg sm:text-2xl tracking-[0.18em] uppercase text-zinc-900 font-bold mt-1">
              Biblioteca Didáctica · Escape Room
            </h2>

            {/* Diamond Divider (───◇───) */}
            <div className="flex items-center justify-center w-56 sm:w-72 mx-auto my-1.5">
              <div className="flex-1 h-px bg-zinc-400" />
              <div className="w-2 h-2 rotate-45 border border-zinc-600 bg-[#f0f0f2] mx-2" />
              <div className="flex-1 h-px bg-zinc-400" />
            </div>

            <p className="text-xs text-zinc-600 font-serif">
              Explora o genera mazmorras académicas de 10 cámaras con IA para proyectar en tus salas de clase.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-7 py-2.5 bg-[#eae9ec] border-b border-zinc-300 flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              playBalatroSound('select');
              setActiveTab('explore');
            }}
            className={cn(
              'px-4 py-2 text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border shadow-xs',
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
              'px-4 py-2 text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border shadow-xs',
              activeTab === 'ai'
                ? 'bg-[#9e1b24] text-white border-[#9e1b24]'
                : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
            )}
          >
            <Sparkles size={14} />
            <span>Crear con IA (10 Cámaras)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playBalatroSound('select');
              setActiveTab('manual');
            }}
            className={cn(
              'px-4 py-2 text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border shadow-xs',
              activeTab === 'manual'
                ? 'bg-[#9e1b24] text-white border-[#9e1b24]'
                : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
            )}
          >
            <Edit3 size={14} />
            <span>Crear Manualmente</span>
          </button>
        </div>

        {/* Tab 1: Explore Community Library in Unified Alabaster Palette */}
        {activeTab === 'explore' && (
          <div className="flex-1 h-auto p-4 sm:p-6 space-y-4 bg-[#f4f4f6]">
            {/* Search Bar & Sorters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 border border-zinc-300 shadow-sm">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por tema, materia, pregunta o autor (ej. Leyes de Newton, Célula, Álgebra, Egipto)..."
                  className="w-full bg-zinc-50 border border-zinc-300 pl-9 pr-4 py-2 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#9e1b24] font-serif"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-zinc-500 font-serif font-medium hidden lg:inline">Ordenar:</span>
                <button
                  type="button"
                  onClick={() => setSortBy('popular')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-serif font-semibold cursor-pointer transition-colors border shadow-xs',
                    sortBy === 'popular'
                      ? 'bg-[#27272a] text-white border-[#27272a]'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                  )}
                >
                  Más Jugados
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('recent')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-serif font-semibold cursor-pointer transition-colors border shadow-xs',
                    sortBy === 'recent'
                      ? 'bg-[#27272a] text-white border-[#27272a]'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                  )}
                >
                  Recientes
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('likes')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-serif font-semibold cursor-pointer transition-colors border shadow-xs',
                    sortBy === 'likes'
                      ? 'bg-[#27272a] text-white border-[#27272a]'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                  )}
                >
                  Favoritos
                </button>
              </div>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      playBalatroSound('select');
                      setSelectedSubject(sub);
                    }}
                    className={cn(
                      'px-3 py-1 text-xs font-serif font-bold whitespace-nowrap cursor-pointer transition-all border shadow-xs',
                      selectedSubject === sub
                        ? 'bg-[#9e1b24] text-white border-[#9e1b24]'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {isLoadingLibrary && (
                <span className="text-xs text-[#9e1b24] animate-pulse font-serif font-semibold whitespace-nowrap">
                  Actualizando biblioteca...
                </span>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className="text-xs text-[#9e1b24] hover:text-[#80141b] underline font-serif font-semibold whitespace-nowrap cursor-pointer shrink-0 ml-2"
              >
                ¿No encuentras tu tema? Créalo con IA
              </button>
            </div>

            {/* Packs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 library-invisible-scroll max-h-[65vh] pr-1">
              {filteredPacks.length === 0 ? (
                <div className="col-span-full py-16 text-center text-zinc-500 space-y-3 bg-white border border-zinc-300 shadow-sm">
                  <div className="text-4xl">🔐</div>
                  <p className="text-base font-serif font-bold text-zinc-800">No se encontraron Escape Rooms con esos filtros</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai')}
                    className="px-4 py-2 bg-[#9e1b24] text-white font-serif font-bold text-xs hover:bg-[#80141b] cursor-pointer shadow-md inline-flex items-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>Crear este tema con IA (10 Cámaras)</span>
                  </button>
                </div>
              ) : (
                filteredPacks.map((pack) => {
                  const isPreview = previewPackId === pack.id;
                  const isLiked = likedPackIds.includes(pack.id);
                  const isSelected = selectedPackId === pack.id;

                  return (
                    <motion.div
                      key={pack.id}
                      layout
                      className={cn(
                        'bg-white border p-4 sm:p-5 flex flex-col justify-between transition-all relative h-auto shadow-sm text-zinc-900',
                        isSelected
                          ? 'border-[#9e1b24] ring-1 ring-[#9e1b24] bg-rose-50/20'
                          : 'border-zinc-300 hover:border-zinc-400'
                      )}
                    >
                      <div className="space-y-2.5">
                        {/* Badges & Stats */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 text-[11px] font-serif font-bold bg-zinc-100 text-zinc-800 border border-zinc-300">
                              {pack.subject}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-serif font-semibold bg-sky-50 text-sky-800 border border-sky-300">
                              {pack.chambers.length} Cámaras
                            </span>
                            {pack.isAiGenerated && (
                              <span className="px-1.5 py-0.5 text-[10px] font-serif font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <Sparkles size={10} />
                                <span>IA</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-serif text-zinc-500" title="Partidas jugadas por la comunidad">
                              🎮 {pack.playsCount}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleLikePack(pack.id, e)}
                              className={cn(
                                'flex items-center gap-1 text-[11px] font-serif px-2 py-0.5 border transition-all cursor-pointer shadow-xs',
                                isLiked
                                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-rose-600'
                              )}
                              title="Me gusta este Escape Room"
                            >
                              <Heart size={12} className={isLiked ? 'fill-rose-600 text-rose-600' : ''} />
                              <span>{pack.likesCount}</span>
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base font-serif font-bold text-zinc-900 tracking-tight leading-snug">
                            {pack.title}
                          </h3>
                          <p className="text-xs text-zinc-600 line-clamp-2 mt-1 leading-relaxed font-serif">
                            {pack.description}
                          </p>
                        </div>

                        {/* Author & Preview toggle */}
                        <div className="flex items-center justify-between text-[11px] font-serif text-zinc-500 pt-1">
                          <span>👤 Por: <strong className="text-zinc-800">{pack.authorName}</strong></span>
                          <button
                            type="button"
                            onClick={() => setPreviewPackId(isPreview ? null : pack.id)}
                            className="text-[#9e1b24] hover:text-[#80141b] font-serif font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {isPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                            <span>{isPreview ? 'Ocultar cámaras' : `Ver ${pack.chambers.length} cámaras`}</span>
                          </button>
                        </div>

                        {/* Chambers Drawer Preview */}
                        <AnimatePresence>
                          {isPreview && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="h-auto pt-2 border-t border-zinc-200 space-y-2"
                            >
                              <div className="library-invisible-scroll max-h-52 space-y-2 pr-1">
                                {pack.chambers.map((chamber, cIdx) => (
                                  <div
                                    key={chamber.id || cIdx}
                                    className="p-2.5 bg-zinc-50 border border-zinc-200 text-xs space-y-1 shadow-xs"
                                  >
                                    <div className="flex items-center justify-between font-serif font-bold text-[#9e1b24]">
                                      <span className="flex items-center gap-1">
                                        <DoorOpen size={13} />
                                        <span>{chamber.chamberTitle || `Cámara ${cIdx + 1}`}</span>
                                      </span>
                                      <span className="font-mono text-[10px] text-zinc-800 bg-zinc-200 px-1.5 py-0.5 border border-zinc-300">
                                        PIN: {chamber.lockCode}
                                      </span>
                                    </div>
                                    <p className="text-zinc-700 text-[11px] leading-snug font-serif">
                                      {chamber.question}
                                    </p>
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                      {chamber.options.map((opt, oIdx) => (
                                        <span
                                          key={oIdx}
                                          className={cn(
                                            'text-[10px] px-1.5 py-0.5 border font-serif',
                                            oIdx === chamber.correctOptionIndex
                                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                                              : 'bg-white text-zinc-600 border-zinc-200'
                                          )}
                                        >
                                          {opt}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Select & Play Button */}
                      <div className="pt-4 mt-2 border-t border-zinc-200">
                        <button
                          type="button"
                          onClick={() => handleUsePack(pack)}
                          className="w-full py-2.5 bg-[#27272a] hover:bg-[#18181b] text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play size={14} className="fill-white" />
                          <span>Seleccionar este Escape Room ({pack.chambers.length} Cámaras)</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Create with AI and Auto-Save in Unified Alabaster Palette */}
        {activeTab === 'ai' && (
          <div className="flex-1 h-auto p-4 sm:p-8 max-w-2xl mx-auto w-full space-y-6 bg-[#f4f4f6]">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-serif font-bold bg-white text-[#9e1b24] border border-zinc-300 shadow-xs">
                <Sparkles size={14} />
                <span>Generador IA Permanente · 10 Cámaras</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-wider text-zinc-900">
                Crea un Escape Room de 10 Cámaras con IA
              </h3>
              <p className="text-xs text-zinc-600 max-w-md mx-auto font-serif">
                Escribe cualquier materia o tema. La IA creará 10 cámaras pedagógicas completas y las guardará automáticamente en la Biblioteca Infinita comunitaria.
              </p>
            </div>

            {aiSuccessBanner && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-serif shadow-xs">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>{aiSuccessBanner}</span>
              </div>
            )}

            <form onSubmit={handleGenerateAiPack} className="bg-white border border-zinc-300 shadow-sm p-5 sm:p-6 space-y-4">
              <div>
                <label className="text-xs font-serif font-bold text-zinc-800 uppercase tracking-wide block mb-1.5">
                  Tema o Contenido de la Clase:
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ej. Sistema Solar, Tabla Periódica, Mitosis Celular, Revolución Francesa, Leyes de Newton..."
                  className="w-full bg-zinc-50 border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#9e1b24] font-serif"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-serif font-bold text-zinc-800 uppercase tracking-wide block mb-1.5">
                    Asignatura / Categoría:
                  </label>
                  <select
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-[#9e1b24] font-serif cursor-pointer"
                  >
                    {SUBJECTS.filter((s) => s !== 'Todos').map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-serif font-bold text-zinc-800 uppercase tracking-wide block mb-1.5">
                    Nombre del Autor / Docente:
                  </label>
                  <input
                    type="text"
                    value={aiAuthor}
                    onChange={(e) => setAiAuthor(e.target.value)}
                    placeholder="Ej. Prof. García"
                    className="w-full bg-zinc-50 border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#9e1b24] font-serif"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 flex items-center gap-2 font-serif">
                <Globe size={15} className="text-[#9e1b24] shrink-0" />
                <span>Al generar, este Escape Room de 10 cámaras quedará guardado para siempre en la Biblioteca Infinita para que tú y otros docentes o alumnos puedan jugarlo sin necesidad de usar IA nuevamente.</span>
              </div>

              <button
                type="submit"
                disabled={isGeneratingAi || !aiTopic.trim()}
                className="w-full py-3 bg-[#9e1b24] hover:bg-[#80141b] text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Diseñando 10 Cámaras con IA y Guardando en Biblioteca...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generar Escape Room (10 Cámaras) y Guardar en Biblioteca</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Create Manually in Unified Alabaster Palette */}
        {activeTab === 'manual' && (
          <div className="flex-1 h-auto p-4 sm:p-6 space-y-5 bg-[#f4f4f6]">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white p-4 sm:p-5 border border-zinc-300 shadow-sm space-y-3">
                <h3 className="text-sm font-serif font-bold text-zinc-900 uppercase tracking-wide flex items-center gap-2">
                  <Edit3 size={15} className="text-[#9e1b24]" />
                  <span>Datos Generales del Escape Room</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-700 font-serif font-semibold block mb-1">Título del Escape Room:</label>
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="Ej. Desafío de Genética y ADN"
                      className="w-full bg-zinc-50 border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-[#9e1b24] font-serif"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-700 font-serif font-semibold block mb-1">Asignatura:</label>
                    <select
                      value={manualSubject}
                      onChange={(e) => setManualSubject(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 px-3 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-[#9e1b24] font-serif cursor-pointer"
                    >
                      {SUBJECTS.filter((s) => s !== 'Todos').map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-700 font-serif font-semibold block mb-1">Descripción pedagógica:</label>
                  <input
                    type="text"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="Breve explicación para los estudiantes..."
                    className="w-full bg-zinc-50 border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-[#9e1b24] font-serif"
                  />
                </div>
              </div>

              {/* Form to add a chamber */}
              <div className="bg-white p-4 sm:p-5 border border-zinc-300 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <h4 className="text-xs font-serif font-bold text-[#9e1b24] uppercase tracking-wider flex items-center gap-1.5">
                    <DoorOpen size={14} />
                    <span>Añadir Cámara #{manualChambers.length + 1} (Objetivo: 10 Cámaras)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {manualChambers.length} / 10 creadas
                  </span>
                </div>

                <div>
                  <label className="text-xs text-zinc-700 font-serif font-semibold block mb-1">Pregunta o Acertijo:</label>
                  <textarea
                    rows={2}
                    value={curQText}
                    onChange={(e) => setCurQText(e.target.value)}
                    placeholder="Escribe el desafío que los alumnos deberán resolver para abrir la puerta..."
                    className="w-full bg-zinc-50 border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#9e1b24] font-serif"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-zinc-600 block mb-0.5 font-serif">Opción 1 (A):</label>
                    <input
                      type="text"
                      value={curOpt0}
                      onChange={(e) => setCurOpt0(e.target.value)}
                      placeholder="Opción 1"
                      className="w-full bg-zinc-50 border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none font-serif"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-600 block mb-0.5 font-serif">Opción 2 (B):</label>
                    <input
                      type="text"
                      value={curOpt1}
                      onChange={(e) => setCurOpt1(e.target.value)}
                      placeholder="Opción 2"
                      className="w-full bg-zinc-50 border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none font-serif"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-600 block mb-0.5 font-serif">Opción 3 (C) (Opcional):</label>
                    <input
                      type="text"
                      value={curOpt2}
                      onChange={(e) => setCurOpt2(e.target.value)}
                      placeholder="Opción 3"
                      className="w-full bg-zinc-50 border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none font-serif"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-600 block mb-0.5 font-serif">Opción 4 (D) (Opcional):</label>
                    <input
                      type="text"
                      value={curOpt3}
                      onChange={(e) => setCurOpt3(e.target.value)}
                      placeholder="Opción 4"
                      className="w-full bg-zinc-50 border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-900 focus:outline-none font-serif"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-zinc-700 font-serif font-semibold block mb-1">Opción Correcta:</label>
                    <select
                      value={curCorrectIdx}
                      onChange={(e) => setCurCorrectIdx(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-800 cursor-pointer font-serif"
                    >
                      <option value={0}>Opción 1 (A)</option>
                      <option value={1}>Opción 2 (B)</option>
                      <option value={2}>Opción 3 (C)</option>
                      <option value={3}>Opción 4 (D)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-700 font-serif font-semibold block mb-1">Código PIN de la Cámara:</label>
                    <input
                      type="text"
                      value={curLockCode}
                      onChange={(e) => setCurLockCode(e.target.value.toUpperCase())}
                      placeholder="Ej. 4610 o CLAVE1"
                      className="w-full bg-zinc-50 border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-900 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddManualChamber}
                  className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-serif font-bold text-xs uppercase tracking-wider border border-zinc-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2 shadow-xs"
                >
                  <Plus size={14} />
                  <span>Añadir Cámara a la Lista</span>
                </button>
              </div>

              {/* Chambers list created so far */}
              {manualChambers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-serif font-bold text-zinc-800 block">
                    Cámaras añadidas ({manualChambers.length}):
                  </span>
                  <div className="space-y-1.5 h-auto pr-1">
                    {manualChambers.map((ch, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white border border-zinc-300 flex items-center justify-between text-xs shadow-xs"
                      >
                        <div className="truncate mr-2 font-serif">
                          <span className="font-bold text-[#9e1b24] mr-2">#{idx + 1}</span>
                          <span className="text-zinc-800">{ch.question}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setManualChambers((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-700 hover:text-rose-800 font-serif font-bold text-[11px] cursor-pointer shrink-0"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveManualPack}
                    disabled={isSavingManual || manualChambers.length === 0}
                    className="w-full py-2.5 bg-[#9e1b24] hover:bg-[#80141b] text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    <BookOpen size={15} />
                    <span>Guardar Escape Room en la Biblioteca Comunitaria</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
