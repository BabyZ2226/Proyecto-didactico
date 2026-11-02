import React, { useState } from 'react';
import { X, Save, Shield, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';

const AVATARS = [
  { emoji: '👨‍🔬', label: 'Químico', title: 'Especialista Orgánico' },
  { emoji: '👩‍🔬', label: 'Científica', title: 'Física Cuántica' },
  { emoji: '🧪', label: 'Tubo Reactivo', title: 'Síntesis Ácida' },
  { emoji: '⚛️', label: 'Átomo Sp3', title: 'Hibridación Orbital' },
  { emoji: '⚡', label: 'Ion Libre', title: 'Carga Cinética' },
  { emoji: '🧬', label: 'ADN Enlace', title: 'Biopolímero' },
  { emoji: '💎', label: 'Cristal Iónico', title: 'Red Cristalina' },
  { emoji: '🔥', label: 'Exotérmico', title: 'Alta Entalpía' },
];

export function ProfileModal({
  onClose,
  onSaveProfile,
}: {
  onClose: () => void;
  onSaveProfile?: (name: string, avatar: string) => void;
}) {
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem('po_player_name') || 'Marie Curie'
  );
  const [avatar, setAvatar] = useState(
    () => localStorage.getItem('po_player_avatar') || '👨‍🔬'
  );

  const selectedAvatarData = AVATARS.find((a) => a.emoji === avatar) || AVATARS[0];

  const handleAvatarSelect = (emoji: string) => {
    playBalatroSound('select');
    setAvatar(emoji);
  };

  const handleSave = () => {
    playBalatroSound('play');
    const cleanName = playerName.trim() || 'Marie Curie';
    localStorage.setItem('po_player_name', cleanName);
    localStorage.setItem('po_player_avatar', avatar);
    if (onSaveProfile) {
      onSaveProfile(cleanName, avatar);
    }
    onClose();
  };

  return (
    <div className="relative w-full min-h-screen h-auto z-[120] flex items-start justify-center bg-[#0e0c15] py-8 px-3 sm:p-5 select-none font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 14 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl h-auto bg-[#f4f4f6] border-2 border-zinc-300 shadow-[0_28px_80px_rgba(0,0,0,0.45)] text-zinc-900"
      >
        {/* Top Bar — Refined Alabaster Stone Header */}
        <div className="px-5 sm:px-7 py-3 bg-[#eae9ec] border-b border-zinc-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AulaPlayLogo size="sm" theme="light" />
            <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-zinc-600 hidden sm:inline">
              · BITÁCORA DE IDENTIDAD CIENTÍFICA
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            title="Cerrar Perfil Científico"
            className="p-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 hover:text-zinc-900 border border-zinc-300 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Alabaster Header Strip — Matching Campamento & Bitácora Silhouette Header */}
        <div className="relative h-auto bg-[#f0f0f2] text-zinc-900 px-6 py-6 text-center border-b border-zinc-300">
          <svg
            className="absolute right-0 top-0 w-72 h-36 text-zinc-400/20 pointer-events-none"
            viewBox="0 0 400 200"
            fill="currentColor"
          >
            <polygon points="180,0 400,0 400,160 280,90" />
            <polygon points="240,0 400,0 400,90" className="text-zinc-500/20" />
            <circle cx="290" cy="48" r="14" className="text-zinc-700/20" />
          </svg>

          <div className="relative z-10 max-w-lg mx-auto">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#9e1b24] tracking-[0.22em] leading-none">
              III
            </div>
            <h2 className="font-serif text-xl sm:text-2xl tracking-[0.18em] uppercase text-zinc-900 font-bold mt-1">
              Perfil Científico & Credencial
            </h2>

            {/* Diamond Divider (───◇───) */}
            <div className="flex items-center justify-center w-56 sm:w-72 mx-auto my-2">
              <div className="flex-1 h-px bg-zinc-400" />
              <div className="w-2.5 h-2.5 rotate-45 border border-zinc-600 bg-[#f0f0f2] mx-2" />
              <div className="flex-1 h-px bg-zinc-400" />
            </div>

            <p className="text-xs text-zinc-600 font-serif">
              Configura tu nombre e insignia para las salas en vivo, tableros y cámaras de monitoreo.
            </p>
          </div>
        </div>

        {/* Main Workspace — Two-Column Bitácora Layout in Unified Palette */}
        <div className="p-5 sm:p-7 bg-[#f4f4f6] grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Live Credential Preview & Name Input */}
          <div className="md:col-span-5 bg-white border border-zinc-300 shadow-sm p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-[#9e1b24] font-bold">
                  CREDENCIAL ACTIVA ✕
                </span>
                <UserCheck size={15} className="text-[#9e1b24]" />
              </div>

              {/* Preview Badge */}
              <div className="bg-[#fafafb] border border-zinc-200 p-5 flex flex-col items-center text-center space-y-2">
                <div className="w-20 h-20 bg-white border-2 border-[#9e1b24] flex items-center justify-center text-5xl shadow-sm">
                  {avatar}
                </div>
                <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-zinc-900 pt-1">
                  {playerName || 'Sin Nombre'}
                </h3>
                <span className="text-[10px] font-serif uppercase tracking-[0.18em] text-zinc-600 font-semibold">
                  {selectedAvatarData.label} · {selectedAvatarData.title}
                </span>
              </div>

              {/* Name Input */}
              <div>
                <label className="text-[11px] font-serif font-bold uppercase tracking-[0.16em] text-zinc-700 block mb-1.5">
                  Nombre en Sala y Partida:
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={22}
                  className="w-full bg-white border border-zinc-300 focus:border-[#9e1b24] px-3.5 py-2.5 text-sm font-semibold text-zinc-900 focus:outline-none transition-colors"
                  placeholder="Ingresa tu nombre..."
                />
              </div>
            </div>

            <div className="p-2.5 bg-zinc-50 border border-zinc-200 text-[11px] font-serif text-zinc-600 flex items-center gap-2">
              <Shield size={14} className="text-[#9e1b24] shrink-0" />
              <span>Guardado permanente en tu bitácora local.</span>
            </div>
          </div>

          {/* Right Column: Avatar Selector Grid & Save Action */}
          <div className="md:col-span-7 bg-white border border-zinc-300 shadow-sm p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-zinc-800 font-bold">
                  SELECCIONA TU INSIGNIA DE CAMPO ✕
                </span>
                <span className="text-[10px] font-serif text-zinc-500">
                  8 ESPECIALIDADES
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVATARS.map((item) => {
                  const isSelected = avatar === item.emoji;
                  return (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={() => handleAvatarSelect(item.emoji)}
                      className={cn(
                        'p-3 border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer',
                        isSelected
                          ? 'bg-rose-50/70 border-[#9e1b24] text-zinc-900 shadow-sm'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-white'
                      )}
                    >
                      <span className="text-3xl mb-1.5">{item.emoji}</span>
                      <span className="text-[10px] font-serif font-bold uppercase tracking-wider truncate max-w-full">
                        {item.label}
                      </span>
                      <span className="text-[9px] text-zinc-500 truncate max-w-full mt-0.5 font-serif">
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  playBalatroSound('click');
                  onClose();
                }}
                className="px-4 py-2.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-xs font-serif font-bold uppercase tracking-wider text-zinc-700 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 px-5 bg-[#9e1b24] hover:bg-[#80141b] text-white font-serif font-bold text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-between cursor-pointer shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Save size={15} />
                  <span>Guardar en Bitácora</span>
                </span>
                <span>▶</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
