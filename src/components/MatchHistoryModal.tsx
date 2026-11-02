import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Calendar,
  Trash2,
  Filter,
  Users,
  Award,
  RotateCcw,
} from 'lucide-react';
import {
  getMatchHistory,
  clearMatchHistory,
  deleteMatchRecord,
  restoreDefaultDemoData,
  MatchHistoryRecord,
} from '../lib/matchHistory';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'teacher' | 'student' | null;
  currentStudentName?: string;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  userRole,
}) => {
  const [history, setHistory] = useState<MatchHistoryRecord[]>(() => getMatchHistory());
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  if (!isOpen) return null;

  const handleClearAllHistory = () => {
    clearMatchHistory();
    setHistory([]);
    setIsConfirmingClearAll(false);
    playBalatroSound('click');
  };

  const handleDeleteSingleRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteMatchRecord(id);
    setHistory(updated);
    setDeleteConfirmationId(null);
    playBalatroSound('click');
  };

  const handleRestoreDemoData = () => {
    const restored = restoreDefaultDemoData();
    setHistory(restored);
    playBalatroSound('deal');
  };

  const filteredHistory = history.filter((rec) => {
    if (selectedFilter === 'poker') return rec.gameType === 'poker_quimico';
    if (selectedFilter === 'escape') return rec.gameType === 'escape_room';
    if (selectedFilter === 'latinos') return rec.gameType === 'cien_latinos';
    if (selectedFilter === 'impostor') return rec.gameType === 'el_impostor';
    if (selectedFilter === 'geografia') return rec.gameType === 'geografia_3d';
    return true;
  });

  // Calculate statistically sound academic averages
  const totalMatches = filteredHistory.length;
  const approvedMatches = filteredHistory.filter((r) => (r.grade ?? 0) >= 60).length;
  const passRate = totalMatches > 0 ? Math.round((approvedMatches / totalMatches) * 100) : 0;

  const averageGrade =
    totalMatches > 0
      ? Math.round(
          filteredHistory.reduce((acc, r) => acc + (r.grade ?? 0), 0) / totalMatches
        )
      : 0;

  const totalAccumulatedScore = filteredHistory.reduce((acc, r) => acc + (r.score ?? 0), 0);

  const getEditorialGradeBadge = (grade: number) => {
    if (grade >= 90) {
      return {
        label: 'SOBRESALIENTE',
        classes: 'text-emerald-800 border-emerald-300 bg-emerald-50',
      };
    }
    if (grade >= 75) {
      return {
        label: 'NOTABLE',
        classes: 'text-sky-800 border-sky-300 bg-sky-50',
      };
    }
    if (grade >= 60) {
      return {
        label: 'APROBADO',
        classes: 'text-amber-800 border-amber-300 bg-amber-50',
      };
    }
    return {
      label: 'EN REFUERZO',
      classes: 'text-rose-800 border-rose-300 bg-rose-50',
    };
  };

  const avgBadge = getEditorialGradeBadge(averageGrade);

  return (
    <div className="relative w-full min-h-screen h-auto z-[120] flex items-start justify-center bg-[#0e0c15] py-6 px-3 sm:p-5 select-none font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 14 }}
        className="w-full max-w-5xl h-auto bg-[#f4f4f6] border-2 border-zinc-300 shadow-[0_28px_80px_rgba(0,0,0,0.45)] flex flex-col text-zinc-900"
      >
        {/* Top Bar — Refined Alabaster Stone Header */}
        <div className="px-5 sm:px-7 py-3 bg-[#eae9ec] border-b border-zinc-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <AulaPlayLogo size="sm" theme="light" />
            <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-zinc-600 hidden sm:inline">
              · BITÁCORA DE HISTORIAL Y ESTADÍSTICAS (0-100)
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            className="p-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 hover:text-zinc-900 border border-zinc-300 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X size={16} />
          </button>
        </div>

        {/* Alabaster Header Strip — Matching Campamento & Bitácora Silhouette Header */}
        <div className="relative bg-[#f0f0f2] text-zinc-900 px-6 py-5 text-center border-b border-zinc-300 shrink-0 h-auto">
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
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#9e1b24] tracking-[0.22em] leading-none">
              IV
            </div>
            <h2 className="font-serif text-lg sm:text-2xl tracking-[0.18em] uppercase text-zinc-900 font-bold mt-1">
              Historial de Partidas y Estadísticas
            </h2>

            {/* Diamond Divider (───◇───) */}
            <div className="flex items-center justify-center w-56 sm:w-72 mx-auto my-2">
              <div className="flex-1 h-px bg-zinc-400" />
              <div className="w-2 h-2 rotate-45 border border-zinc-600 bg-[#f0f0f2] mx-2" />
              <div className="flex-1 h-px bg-zinc-400" />
            </div>

            <p className="text-xs text-zinc-600 font-serif">
              {userRole === 'teacher'
                ? '👨‍🏫 BITÁCORA DOCENTE: Seguimiento académico, notas ponderadas (0-100) y desempeño de la clase.'
                : '🧑‍🎓 BITÁCORA ESTUDIANTE: Tu libreta de calificaciones, rachas y progreso por actividad.'}
            </p>
          </div>
        </div>

        {/* Modal Content Area in Unified Alabaster Palette */}
        <div className="p-5 sm:p-6 h-auto space-y-5 flex-1 bg-[#f4f4f6]">
          {/* Key Academic Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-zinc-300 shadow-sm p-3.5 text-center space-y-1">
              <span className="text-[10px] font-serif text-zinc-600 font-bold uppercase tracking-wider block">
                Partidas Evaluadas
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-zinc-900 block">
                {totalMatches}
              </span>
              <span className="text-[10px] font-serif text-zinc-500 block">
                {userRole === 'teacher' ? 'Sesiones registradas' : 'Participaciones'}
              </span>
            </div>

            <div className="bg-white border border-zinc-300 shadow-sm p-3.5 text-center space-y-1">
              <span className="text-[10px] font-serif text-zinc-600 font-bold uppercase tracking-wider block">
                Promedio (0-100)
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-[#9e1b24] block">
                {totalMatches > 0 ? `${averageGrade}/100` : '--/100'}
              </span>
              <span
                className={cn(
                  'text-[9px] font-serif font-bold px-2 py-0.5 inline-block border',
                  totalMatches > 0
                    ? avgBadge.classes
                    : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                )}
              >
                {totalMatches > 0 ? avgBadge.label : 'SIN REGISTROS'}
              </span>
            </div>

            <div className="bg-white border border-zinc-300 shadow-sm p-3.5 text-center space-y-1">
              <span className="text-[10px] font-serif text-zinc-600 font-bold uppercase tracking-wider block">
                Tasa de Aprobación
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-amber-700 block">
                {totalMatches > 0 ? `${passRate}%` : '0%'}
              </span>
              <span className="text-[10px] font-serif text-zinc-500 block">
                {totalMatches > 0
                  ? `${approvedMatches} de ${totalMatches} aprobadas (≥60)`
                  : '0 aprobadas'}
              </span>
            </div>

            <div className="bg-white border border-zinc-300 shadow-sm p-3.5 text-center space-y-1">
              <span className="text-[10px] font-serif text-zinc-600 font-bold uppercase tracking-wider block">
                Puntos Acumulados
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-[#0284c7] block">
                {totalAccumulatedScore.toLocaleString()}
              </span>
              <span className="text-[10px] font-serif text-zinc-500 block">
                Puntaje global de bitácora
              </span>
            </div>
          </div>

          {/* Filter Bar & Clear Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-300">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Filter size={13} className="text-[#9e1b24]" />
              <span className="text-zinc-600 font-serif text-[11px] uppercase tracking-wider mr-1">
                Filtrar:
              </span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'escape', label: '🗝️ Escape Room' },
                { id: 'latinos', label: '🎤 100 Latinos' },
                { id: 'impostor', label: '🕵️ El Impostor' },
                { id: 'geografia', label: '🌍 Globo 3D' },
                { id: 'poker', label: '🧪 Póker Químico' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    playBalatroSound('select');
                    setSelectedFilter(f.id);
                  }}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-serif font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-xs',
                    selectedFilter === f.id
                      ? 'bg-[#9e1b24] text-white border-[#9e1b24]'
                      : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {history.length > 0 ? (
                isConfirmingClearAll ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 p-1">
                    <span className="text-[11px] font-serif text-rose-800 font-bold px-1.5">
                      ¿Vaciar historial?
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="px-2.5 py-0.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-serif font-bold cursor-pointer transition-colors"
                    >
                      Sí, vaciar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClearAll(false)}
                      className="px-2 py-0.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-serif font-bold cursor-pointer transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      playBalatroSound('hover');
                      setIsConfirmingClearAll(true);
                    }}
                    className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Trash2 size={13} />
                    <span>Vaciar Historial</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleRestoreDemoData}
                  className="px-3 py-1 bg-white hover:bg-zinc-50 text-amber-800 border border-amber-400 text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Cargar registros de ejemplo para previsualizar estadísticas"
                >
                  <RotateCcw size={13} />
                  <span>Cargar Datos de Muestra</span>
                </button>
              )}
            </div>
          </div>

          {/* List of Date-Stamped Match Records */}
          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="p-10 text-center bg-white border-2 border-dashed border-zinc-300 space-y-2 shadow-xs">
                <div className="text-3xl">📭</div>
                <h3 className="font-serif text-base font-bold uppercase tracking-wider text-zinc-900">
                  Bitácora sin registros en este filtro
                </h3>
                <p className="text-xs text-zinc-600 max-w-md mx-auto font-serif">
                  Las partidas finalizadas en Escape Room, 100 Latinos Dicen, El Impostor, Globo 3D o Póker Químico se registran automáticamente con fecha y calificación (0-100).
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRestoreDemoData}
                    className="px-4 py-2 bg-[#9e1b24] hover:bg-[#80141b] text-white text-xs font-serif font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-xs"
                  >
                    Restaurar partidas de ejemplo
                  </button>
                </div>
              </div>
            ) : (
              filteredHistory.map((record) => {
                const isExpanded = expandedRecordId === record.id;
                const badge = getEditorialGradeBadge(record.grade);
                const isConfirmingDelete = deleteConfirmationId === record.id;

                return (
                  <div
                    key={record.id}
                    className="bg-white border border-zinc-300 hover:border-zinc-400 p-4 space-y-2.5 transition-all relative shadow-sm"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-200 pb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 border border-zinc-300 flex items-center justify-center text-xl shrink-0 shadow-xs">
                          {record.gameType === 'escape_room'
                            ? '🗝️'
                            : record.gameType === 'cien_latinos'
                            ? '🎤'
                            : record.gameType === 'el_impostor'
                            ? '🕵️'
                            : record.gameType === 'geografia_3d'
                            ? '🌍'
                            : '🧪'}
                        </div>
                        <div>
                          <h4 className="font-serif text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-900 leading-tight">
                            {record.gameTitle}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-serif text-zinc-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} className="text-[#9e1b24]" />
                              <span>{record.dateStr}</span>
                            </span>
                            {record.roomCode && (
                              <span>· PIN: {record.roomCode}</span>
                            )}
                            <span>
                              · {record.playerAvatar} <strong className="text-zinc-800">{record.playerName}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Grade, Descriptor Badge, Points, and Delete Button */}
                      <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm sm:text-base font-mono font-black text-zinc-900 bg-zinc-100 px-2.5 py-0.5 border border-zinc-300 shadow-xs">
                              NOTA {record.grade}/100
                            </span>
                            <span
                              className={cn(
                                'text-[10px] font-serif font-bold px-2 py-0.5 border shadow-xs',
                                badge.classes
                              )}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-serif text-zinc-600 font-bold mt-0.5">
                            {record.score.toLocaleString()} PTS
                          </span>
                        </div>

                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 p-1">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSingleRecord(record.id, e)}
                              className="px-2 py-0.5 bg-rose-700 hover:bg-rose-800 text-white text-[10px] font-serif font-bold cursor-pointer"
                            >
                              Borrar
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmationId(null);
                              }}
                              className="px-1.5 py-0.5 bg-zinc-200 text-zinc-800 text-[10px] font-serif font-bold cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playBalatroSound('hover');
                              setDeleteConfirmationId(record.id);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-300"
                            title="Eliminar este registro"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Status and Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-serif">
                      <span className="font-bold text-[#9e1b24] flex items-center gap-1.5">
                        <Award size={13} className="text-amber-600" />
                        <span>{record.statusText}</span>
                      </span>
                      <span className="text-zinc-600">{record.detailsText}</span>
                    </div>

                    {/* Teacher Breakdown Expandable Section */}
                    {userRole === 'teacher' && record.studentResults && record.studentResults.length > 0 && (
                      <div className="pt-2 border-t border-zinc-200">
                        <button
                          type="button"
                          onClick={() => {
                            playBalatroSound('click');
                            setExpandedRecordId(isExpanded ? null : record.id);
                          }}
                          className="text-xs font-serif font-bold text-zinc-800 hover:text-[#9e1b24] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Users size={13} />
                          <span>
                            {isExpanded
                              ? '▲ Ocultar Calificaciones de Estudiantes'
                              : `▼ Ver Calificaciones de la Clase (${record.studentResults.length} Alumnos Evaluados)`}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 bg-zinc-50 border border-zinc-200 p-3 space-y-2">
                            <span className="text-[10px] font-serif font-bold text-zinc-600 uppercase tracking-wider block">
                              Libreta de Calificaciones por Estudiante · {record.dateStr}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {record.studentResults.map((st) => {
                                const stBadge = getEditorialGradeBadge(st.grade);
                                return (
                                  <div
                                    key={st.id}
                                    className="bg-white p-2.5 border border-zinc-200 flex items-center justify-between text-xs font-serif gap-2 shadow-xs"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="text-base">{st.avatar}</span>
                                      <div className="truncate">
                                        <span className="font-bold truncate text-zinc-900 block">
                                          {st.name}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 truncate block">
                                          {st.details}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                      <span className="font-black font-mono text-xs bg-zinc-100 px-2 py-0.5 border border-zinc-300 text-zinc-900">
                                        {st.grade}/100
                                      </span>
                                      <span
                                        className={cn(
                                          'text-[9px] font-bold px-1.5 mt-0.5 border',
                                          stBadge.classes
                                        )}
                                      >
                                        {stBadge.label}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#eae9ec] border-t border-zinc-300 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] font-serif uppercase tracking-[0.14em] text-zinc-600">
            Sistema de evaluación y bitácora académica en base 100
          </span>
          <button
            type="button"
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            className="px-5 py-2 bg-[#9e1b24] hover:bg-[#80141b] text-white font-serif font-bold text-xs uppercase tracking-[0.16em] cursor-pointer transition-colors shadow-sm"
          >
            Cerrar Historial ▶
          </button>
        </div>
      </motion.div>
    </div>
  );
};
