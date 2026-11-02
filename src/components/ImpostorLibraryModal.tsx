import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Sparkles, Play, Heart, Globe, Loader2, ShieldAlert } from 'lucide-react';
import { ImpostorGamePack } from '../types';
import { SEED_IMPOSTOR_LIBRARY } from '../lib/impostorEngine';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';

interface ImpostorLibraryModalProps {
  isOpen: boolean;
  defaultAuthorName?: string;
  onClose: () => void;
  onSelectPack: (pack: ImpostorGamePack) => void;
}

const SUBJECTS = ['Todos', 'Química', 'Física y Matemáticas', 'Biología', 'Historia', 'Cultura General'];

export const ImpostorLibraryModal: React.FC<ImpostorLibraryModalProps> = ({
  isOpen,
  defaultAuthorName = 'Docente',
  onClose,
  onSelectPack,
}) => {
  const [packs, setPacks] = useState<ImpostorGamePack[]>(SEED_IMPOSTOR_LIBRARY);
  const [selectedSubject, setSelectedSubject] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'browse' | 'ai_create'>('browse');

  // AI Creation State
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState('Química');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      document.documentElement.classList.remove('library-open');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.classList.add('library-open');
    fetch('/api/impostor-library')
      .then((r) => r.json())
      .then((data) => {
        if (data?.packs && Array.isArray(data.packs) && data.packs.length > 0) {
          setPacks(data.packs);
        }
      })
      .catch(() => {
        setPacks(SEED_IMPOSTOR_LIBRARY);
      });
    return () => {
      document.documentElement.classList.remove('library-open');
    };
  }, [isOpen]);

  const filteredPacks = useMemo(() => {
    return packs.filter((p) => {
      const matchesSubject =
        selectedSubject === 'Todos' ||
        p.subject.toLowerCase().includes(selectedSubject.toLowerCase());
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesSubject && matchesSearch;
    });
  }, [packs, selectedSubject, searchQuery]);

  const handleGenerateAiPack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorMsg(null);
    playBalatroSound('select');

    try {
      const res = await fetch('/api/generate-impostor-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          subject: aiSubject,
          authorName: defaultAuthorName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.pack) {
        throw new Error(data?.error || 'No se pudo generar el pack de El Impostor');
      }
      if (Array.isArray(data.packs)) {
        setPacks(data.packs);
      } else {
        setPacks((prev) => [data.pack, ...prev]);
      }
      setAiTopic('');
      onSelectPack(data.pack);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al generar el reto con IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLikePack = async (packId: string) => {
    playBalatroSound('select');
    setPacks((prev) =>
      prev.map((p) => (p.id === packId ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p))
    );
    try {
      await fetch(`/api/impostor-library/${packId}/like`, { method: 'POST' });
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="relative w-full min-h-screen h-auto z-[120] flex items-start justify-center bg-[#0e0c15] py-6 px-3 sm:p-5 select-none font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-4xl h-auto bg-[#f4f4f6] border-2 border-zinc-300 shadow-[0_28px_80px_rgba(0,0,0,0.45)] flex flex-col text-zinc-900"
        >
          {/* Top Bar — Editorial Alabaster Strip */}
          <div className="px-5 sm:px-7 py-3 bg-[#eae9ec] border-b border-zinc-300 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <AulaPlayLogo size="sm" theme="dark" />
              <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-zinc-600 hidden sm:inline">
                · BIBLIOTECA INFINITA · EL IMPOSTOR
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
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
                VII · ARCHIVO DE INVESTIGACIÓN
              </div>
              <h2 className="font-serif text-lg sm:text-2xl tracking-[0.18em] uppercase text-zinc-900 font-bold mt-1">
                Biblioteca Didáctica · El Impostor
              </h2>

              {/* Diamond Divider (───◇───) */}
              <div className="flex items-center justify-center w-56 sm:w-72 mx-auto my-1.5">
                <div className="flex-1 h-px bg-zinc-400" />
                <div className="w-2 h-2 rotate-45 border border-zinc-600 bg-[#f0f0f2] mx-2" />
                <div className="flex-1 h-px bg-zinc-400" />
              </div>

              <p className="text-xs text-zinc-600 font-serif">
                Tres verdades y una mentira sutil: analiza cada afirmación de forma individual y vota para expulsar al impostor.
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="px-6 py-2.5 bg-[#eae9ec] border-b border-zinc-300 flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('browse')}
              className={cn(
                'px-4 py-2 text-xs font-serif font-bold uppercase tracking-wider border transition-all flex items-center gap-2 cursor-pointer shadow-xs',
                activeTab === 'browse'
                  ? 'bg-[#9e1b24] text-white border-[#9e1b24]'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
              )}
            >
              <Globe size={14} />
              <span>Biblioteca Comunitaria ({packs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai_create')}
              className={cn(
                'px-4 py-2 text-xs font-serif font-bold uppercase tracking-wider border transition-all flex items-center gap-2 cursor-pointer shadow-xs',
                activeTab === 'ai_create'
                  ? 'bg-[#9e1b24] text-white border-[#9e1b24]'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
              )}
            >
              <Sparkles size={14} />
              <span>Crear Reto de Impostor con IA</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 h-auto p-6 bg-[#f4f4f6]">
            {activeTab === 'browse' ? (
              <div className="space-y-5">
                {/* Filter & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-zinc-300 p-4 shadow-xs">
                  <div className="flex flex-wrap items-center gap-1.5 pb-1">
                    {SUBJECTS.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSelectedSubject(sub)}
                        className={cn(
                          'px-3 py-1.5 text-xs font-serif font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border',
                          selectedSubject === sub
                            ? 'bg-[#27272a] text-white border-[#27272a]'
                            : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-100'
                        )}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>

                  <div className="relative min-w-[230px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar tema o asignatura..."
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-none pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#9e1b24] font-serif"
                    />
                  </div>
                </div>

                {/* Packs Grid */}
                <div className="grid sm:grid-cols-2 gap-4 library-invisible-scroll max-h-[65vh] pr-1">
                  {filteredPacks.map((pack) => (
                    <div
                      key={pack.id}
                      className="bg-white border border-zinc-300 hover:border-zinc-400 p-5 flex flex-col justify-between transition-all shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-[#9e1b24] text-[10px] font-serif font-bold uppercase tracking-wider">
                            {pack.subject}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-serif">
                            {pack.rounds.length} Rondas de Debate
                          </span>
                        </div>

                        <h3 className="font-serif text-base font-bold text-zinc-900 leading-snug">
                          {pack.title}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed font-serif">
                          {pack.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-xs text-zinc-500 font-serif">
                          <span>Por {pack.authorName}</span>
                          <button
                            type="button"
                            onClick={() => handleLikePack(pack.id)}
                            className="flex items-center gap-1 text-[#9e1b24] hover:text-[#80141b] cursor-pointer"
                          >
                            <Heart size={13} className="fill-current" />
                            <span>{pack.likesCount || 1}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            playBalatroSound('play');
                            onSelectPack(pack);
                          }}
                          className="px-4 py-1.5 bg-[#27272a] hover:bg-[#18181b] text-white font-serif font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                        >
                          <Play size={13} className="fill-current" />
                          <span>Jugar este Pack</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateAiPack} className="max-w-xl mx-auto space-y-5 py-4">
                <div className="bg-white border border-zinc-300 p-6 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 text-[#9e1b24] text-xs font-serif font-bold uppercase tracking-wider">
                    <Sparkles size={15} />
                    <span>Generador Pedagógico de "El Impostor" con IA</span>
                  </div>

                  <p className="text-xs text-zinc-600 font-serif leading-relaxed">
                    Escribe el tema que acabas de explicar en clase (por ejemplo: <em>"Leyes de los Gases Ideales"</em>, <em>"Revolución Francesa"</em>, <em>"Ecuaciones Cuadráticas"</em> o <em>"Mitosis y Meiosis"</em>). La IA creará 5 rondas donde 3 afirmaciones son verdaderas y 1 tiene un error sutil para debatir en equipo.
                  </p>

                  <div>
                    <label className="text-xs font-serif font-bold uppercase tracking-wider text-zinc-800 block mb-1.5">
                      Tema o Concepto de la Clase:
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Ej. Enlaces Químicos, Segunda Guerra Mundial, Derivadas..."
                      required
                      className="w-full bg-zinc-50 border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#9e1b24] font-serif"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-serif font-bold uppercase tracking-wider text-zinc-800 block mb-1.5">
                      Asignatura:
                    </label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:border-[#9e1b24] font-serif"
                    >
                      <option value="Química">Química</option>
                      <option value="Física y Matemáticas">Física y Matemáticas</option>
                      <option value="Biología">Biología</option>
                      <option value="Historia">Historia</option>
                      <option value="Cultura General">Cultura General</option>
                    </select>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-300 text-xs text-rose-800 font-serif">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isGenerating || !aiTopic.trim()}
                    className="w-full py-3 bg-[#9e1b24] hover:bg-[#80141b] disabled:opacity-50 text-white font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Generando Rondas de Debate con IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Generar y Jugar Ahora</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
