import React from 'react';
import { motion } from 'motion/react';
import { Play, Users, X } from 'lucide-react';
import { createBotPlayer } from '../data/bots';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';

interface BalatroPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  soloBotCount: number;
  onSelectBotCount: (count: number) => void;
  onStartSolo: (botCount: number) => void;
  onOpenMultiplayer: () => void;
}

export const BalatroPlayModal: React.FC<BalatroPlayModalProps> = ({
  isOpen,
  onClose,
  soloBotCount,
  onSelectBotCount,
  onStartSolo,
  onOpenMultiplayer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 select-none">
      
      {/* Overhead Light Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-60">
        <div className="w-1.5 h-6 bg-slate-700/80 shadow-md" />
        <div className="w-14 h-5 bg-gradient-to-b from-slate-600 via-slate-800 to-amber-900/60 rounded-t-full border-t-2 border-slate-400/60 shadow-lg relative flex items-center justify-center">
          <div className="w-6 h-1.5 bg-amber-300 rounded-full shadow-[0_0_12px_#f59e0b] animate-pulse" />
        </div>
        <div className="w-[500px] sm:w-[800px] h-[800px] bg-gradient-to-b from-amber-400/10 via-amber-300/5 to-transparent blur-2xl -mt-1 rounded-full pointer-events-none" />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl flex items-center justify-center"
      >
        {/* Left Bookmark Tab (Coral Red / Play) */}
        <div className="absolute -left-9 sm:-left-12 top-14 flex flex-col gap-2 z-40">
          <div className="w-10 sm:w-14 h-10 sm:h-12 bg-[#c94a4a] border-2 border-r-0 border-[#8b2323] rounded-l-md text-white flex items-center justify-center shadow-md shadow-[0_4px_0_0_#5c1414] -translate-x-1 sm:-translate-x-2">
            <Play size={18} className="fill-white" />
          </div>
        </div>

        {/* Right Bookmark Tab (Close) */}
        <div className="absolute -right-9 sm:-right-12 top-14 z-40">
          <button
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            title="Cerrar"
            className="w-10 sm:w-14 h-10 sm:h-12 bg-[#8b2335] hover:bg-[#a62c41] border-2 border-l-0 border-[#5e1220] rounded-r-md text-white flex items-center justify-center cursor-pointer shadow-md shadow-[0_4px_0_0_#420b15] transition-all hover:translate-x-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* The Open Book Frame */}
        <div className="w-full bg-[#832334] border-[5px] border-[#571420] rounded-xl sm:rounded-2xl p-2 sm:p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_2px_0_rgba(255,255,255,0.2)] relative h-auto">
          
          <div className="w-full bg-[#f1ddb6] border-2 border-[#b89559] rounded-lg sm:rounded-xl shadow-[inset_0_4px_16px_rgba(0,0,0,0.35)] relative flex flex-col lg:flex-row min-h-[480px] h-auto">
            
            {/* Center Crease */}
            <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-[#70522a]/30 to-transparent pointer-events-none z-30" />
            <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#96723e]/50 pointer-events-none z-30" />

            {/* LEFT PAGE: Solo Configuration */}
            <div className="flex-1 p-5 sm:p-7 bg-[#f4e0ba] text-[#2c1d10] border-b-2 lg:border-b-0 lg:border-r-2 border-[#c8a56b] h-auto relative flex flex-col justify-between">
              
              <div className="absolute inset-2 border border-[#d6b783]/70 rounded pointer-events-none" />

              <div className="space-y-4">
                <div>
                  <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
                    Modo Solitario
                  </h2>
                  <p className="text-xs font-mono text-[#745028]">
                    Duelo contra la Inteligencia Alquímica
                  </p>
                </div>

                {/* Medieval Filigree Divider */}
                <div className="flex items-center justify-center gap-2 py-0.5 opacity-70">
                  <span className="text-[#a57f49] text-xs">❧ ──────</span>
                  <span className="text-sm">⚔️</span>
                  <span className="text-[#a57f49] text-xs">────── ☙</span>
                </div>

                {/* Opponents Selection Slots */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#54391b] block">
                    Científicos Rivales en Mesa:
                  </label>

                  <div className="grid grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((count) => {
                      const isSelected = soloBotCount === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => {
                            playBalatroSound('select');
                            onSelectBotCount(count);
                          }}
                          className={cn(
                            'h-12 rounded-lg border-2 flex flex-col items-center justify-center font-medieval font-bold transition-all cursor-pointer',
                            isSelected
                              ? 'bg-[#407a38] text-white border-[#244f1f] shadow-[0_3px_0_0_#173314] scale-105'
                              : 'bg-[#e5caa0] border-[#ba9663] text-[#4d3215] hover:bg-[#d9b889]'
                          )}
                        >
                          <span className="text-base">{count}</span>
                          <span className="text-[9px] font-mono -mt-1 opacity-90">{count === 1 ? 'Bot' : 'Bots'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bot Roster Display */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-mono font-bold text-[#67441e] uppercase block">
                    Alineación de Mesa ({soloBotCount + 1} Jugadores):
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="p-1.5 rounded-lg bg-[#ddbf91] border border-[#ba9663] flex items-center gap-1 text-xs font-mono font-bold text-[#322010]">
                      <span>👨‍🔬</span>
                      <span className="truncate">Tú</span>
                    </div>
                    {Array.from({ length: soloBotCount }).map((_, i) => {
                      const bot = createBotPlayer(i);
                      return (
                        <div
                          key={bot.id}
                          className="p-1.5 rounded-lg bg-[#ddbf91] border border-[#ba9663] flex items-center gap-1 text-xs font-mono text-[#322010]"
                        >
                          <span>{bot.avatar}</span>
                          <span className="truncate text-[11px]">{bot.name.split(' ')[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#d8bc8c] flex items-center justify-between text-[11px] font-mono font-bold text-[#7d5f34] mt-4">
                <span>SELECCIÓN DE MODO</span>
                <span>PAG. I</span>
              </div>
            </div>

            {/* RIGHT PAGE: Table Parameters & Action Button */}
            <div className="flex-1 p-5 sm:p-7 bg-[#f2deb7] text-[#2c1d10] h-auto relative flex flex-col justify-between">
              
              <div className="absolute inset-2 border border-[#d6b783]/70 rounded pointer-events-none" />

              <div className="space-y-4">
                <div>
                  <h2 className="font-medieval text-2xl sm:text-3xl text-[#3b2311] font-bold tracking-wide">
                    Mesa de Reacciones
                  </h2>
                  <p className="text-xs font-mono text-[#745028]">
                    Parámetros Alquímicos
                  </p>
                </div>

                {/* Pixel Stat Bars */}
                <div className="space-y-2.5 pt-1 font-mono text-xs text-[#4d3215]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">BOTE INICIAL</span>
                    <span className="font-bold text-[#3b7e2e]">1,000 $</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">CIEGAS</span>
                    <span>10 $ / 20 $</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">BARAJA ATÓMICA</span>
                    <span>52 Cartas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">DIFICULTAD</span>
                    <span>IA Adaptativa</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      playBalatroSound('play');
                      onStartSolo(soloBotCount);
                    }}
                    className="w-full py-3 bg-[#3d7a36] hover:bg-[#488e40] text-white font-medieval text-lg font-bold rounded-lg border-2 border-[#1f471a] shadow-[0_4px_0_0_#143011] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play size={18} className="fill-white" />
                    <span>INICIAR PARTIDA ({soloBotCount} BOTS)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playBalatroSound('click');
                      onClose();
                      onOpenMultiplayer();
                    }}
                    className="w-full py-2 bg-[#d6b785] hover:bg-[#cbab77] text-[#3d2712] font-mono text-xs font-bold rounded-lg border-2 border-[#a6824a] shadow-[0_3px_0_0_#7d5c2c] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Users size={14} />
                    <span>O ir a Salas Multijugador Online</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#d8bc8c] flex items-center justify-between text-[11px] font-mono font-bold text-[#7d5f34] mt-4">
                <span>LABORATORIO</span>
                <span>PAG. II</span>
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
};
