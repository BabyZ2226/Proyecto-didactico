import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Download, Printer, RefreshCw, X, ArrowLeft } from 'lucide-react';

export interface StudentGradeResult {
  id: string;
  name: string;
  avatar: string;
  grade: number; // 0 to 100
  questionsAnswered: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeRemainingSecs: number;
  totalTimeSecs: number;
  escaped: boolean;
  score: number;
}

interface TeacherGradeSummaryModalProps {
  onClose: () => void;
  results: StudentGradeResult[];
  roomCode?: string;
  gameTitle?: string;
  onRestartMatch?: () => void;
  onReturnToLobby?: () => void;
}

export const TeacherGradeSummaryModal: React.FC<TeacherGradeSummaryModalProps> = ({
  onClose,
  results,
  roomCode = '191440',
  gameTitle = 'Escape Room Didáctico: Persecución en la Mazmorra',
  onRestartMatch,
  onReturnToLobby,
}) => {
  const [copiedText, setCopiedText] = useState(false);

  // Calculate course averages
  const totalStudents = results.length;
  const averageGrade = totalStudents > 0
    ? Math.round(results.reduce((acc, r) => acc + r.grade, 0) / totalStudents)
    : 0;

  const passedStudents = results.filter((r) => r.grade >= 70).length;
  const needsHelpStudents = totalStudents - passedStudents;

  const getPerformanceBadge = (grade: number) => {
    if (grade >= 90) return { label: 'Sobresaliente 🌟', color: 'bg-emerald-950 text-emerald-300 border-emerald-500/50' };
    if (grade >= 70) return { label: 'Aprobado 👍', color: 'bg-blue-950 text-blue-300 border-blue-500/50' };
    if (grade >= 50) return { label: 'En Desarrollo ⚠️', color: 'bg-amber-950 text-amber-300 border-amber-500/50' };
    return { label: 'Necesita Refuerzo 📚', color: 'bg-red-950 text-red-300 border-red-500/50' };
  };

  const handleCopyReport = async () => {
    let report = `REPORTE DE NOTAS DOCENTE - ESCALA PROPORCIONAL (0 - 100 PTS)\n`;
    report += `Actividad: ${gameTitle}\n`;
    report += `Código de Sala: ${roomCode}\n`;
    report += `Promedio General del Curso: ${averageGrade} / 100 pts\n`;
    report += `Alumnos Aprobados (≥70 pts): ${passedStudents} de ${totalStudents}\n\n`;
    report += `ID,Estudiante,Nota (0-100),Desempeño,Aciertos,Total Preguntas,Fallos,Estado\n`;
    results.forEach((r, idx) => {
      const badge = getPerformanceBadge(r.grade).label.replace(/[🌟👍⚠️📚]/g, '').trim();
      report += `${idx + 1},"${r.name}",${r.grade},"${badge}",${r.correctAnswers},${r.totalQuestions},${r.incorrectAnswers},"${r.escaped ? 'Escapó' : 'Atrapado'}"\n`;
    });

    try {
      await navigator.clipboard.writeText(report);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="absolute inset-x-0 top-0 min-h-full h-auto z-[120] flex items-start justify-center bg-zinc-950/95 py-6 px-3 sm:p-6 font-sans">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#120a1f] border-2 border-fuchsia-500/60 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl text-zinc-100 relative my-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-purple-800 flex items-center justify-center text-2xl shadow-lg border border-fuchsia-400/30">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-medieval text-xl sm:text-2xl font-bold text-amber-300">
                  Resumen de Calificaciones (Docente)
                </h2>
                <span className="bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  Escala 0 - 100 pts
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {gameTitle} • Sala: <strong className="text-amber-400">{roomCode}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar resumen de calificaciones"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#1a0e2e] border border-fuchsia-500/30 p-4 rounded-2xl text-center">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
              Promedio General
            </span>
            <div className="text-3xl font-black font-mono text-amber-300">
              {averageGrade} <span className="text-sm font-normal text-zinc-400">/ 100</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 mt-1 block">
              Nota media del curso
            </span>
          </div>

          <div className="bg-[#1a0e2e] border border-emerald-500/30 p-4 rounded-2xl text-center">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
              Alumnos Aprobados
            </span>
            <div className="text-3xl font-black font-mono text-emerald-400">
              {passedStudents} <span className="text-sm font-normal text-zinc-400">/ {totalStudents}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80 mt-1 block font-bold">
              ≥ 70 pts requeridos
            </span>
          </div>

          <div className="bg-[#1a0e2e] border border-amber-500/30 p-4 rounded-2xl text-center">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
              En Riesgo / Refuerzo
            </span>
            <div className="text-3xl font-black font-mono text-amber-400">
              {needsHelpStudents} <span className="text-sm font-normal text-zinc-400">alumnos</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400/80 mt-1 block font-bold">
              &lt; 70 pts
            </span>
          </div>
        </div>

        {/* Student Grade Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span>Resultados Individuales por Estudiante ({totalStudents}):</span>
            <span className="text-[11px] text-zinc-400 font-bold text-amber-300/80">
              Ponderación proporcional: {(100 / (results[0]?.totalQuestions || 4)).toFixed(0)} pts por pregunta
            </span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl h-auto">
            {results.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs">
                No hay resultados registrados aún en esta sesión.
              </div>
            ) : (
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1e1133] text-zinc-400 border-b border-zinc-800 text-[11px]">
                    <th className="py-2.5 px-3">Estudiante</th>
                    <th className="py-2.5 px-3 text-center">Nota (0-100)</th>
                    <th className="py-2.5 px-3 text-center">Desempeño</th>
                    <th className="py-2.5 px-3 text-center">Preguntas</th>
                    <th className="py-2.5 px-3 text-center">Estado Escape</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {results.map((r, idx) => {
                    const badge = getPerformanceBadge(r.grade);
                    return (
                      <tr key={r.id || idx} className="hover:bg-white/5 transition-colors">
                        {/* Student Name & Avatar */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{r.avatar}</span>
                            <div>
                              <strong className="text-zinc-100 font-bold block">{r.name}</strong>
                              <span className="text-[10px] text-zinc-500">Puntos: {r.score}</span>
                            </div>
                          </div>
                        </td>

                        {/* Grade 0-100 */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-xl font-black ${
                              r.grade >= 90 ? 'text-emerald-400' :
                              r.grade >= 70 ? 'text-blue-400' :
                              r.grade >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {r.grade}
                            </span>
                            <span className="text-[9px] text-zinc-500">/ 100</span>
                          </div>
                        </td>

                        {/* Performance Badge */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Questions Correct/Incorrect */}
                        <td className="py-3 px-3 text-center text-zinc-300">
                          <div className="font-bold">
                            {r.correctAnswers} / {r.totalQuestions}
                          </div>
                          {r.incorrectAnswers > 0 && (
                            <span className="text-[10px] text-red-400 font-normal">
                              ({r.incorrectAnswers} fallos)
                            </span>
                          )}
                        </td>

                        {/* Escape Status */}
                        <td className="py-3 px-3 text-center">
                          {r.escaped ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                              <CheckCircle2 size={14} /> Escapó
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 text-[11px] font-bold">
                              <XCircle size={14} /> Atrapado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2 bg-[#251540] hover:bg-[#341d59] border border-fuchsia-500/30 text-zinc-200 text-xs font-mono font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Download size={14} className="text-fuchsia-400" />
              <span>{copiedText ? '¡Reporte Copiado!' : 'Copiar Reporte CSV'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-[#251540] hover:bg-[#341d59] border border-fuchsia-500/30 text-zinc-200 text-xs font-mono font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Printer size={14} className="text-amber-400" />
              <span>Imprimir Notas</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onReturnToLobby && (
              <button
                onClick={onReturnToLobby}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Volver a la Sala ({roomCode})</span>
              </button>
            )}

            {onRestartMatch && (
              <button
                onClick={onRestartMatch}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-zinc-950 font-medieval font-bold text-xs rounded-xl cursor-pointer shadow-lg transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Nueva Partida en esta Sala</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
