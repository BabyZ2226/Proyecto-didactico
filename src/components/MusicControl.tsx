import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Disc, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  startMusic,
  stopMusic,
  toggleMusic,
  isMusicPlaying,
  setMusicVolume,
  getMusicVolume,
} from '../lib/musicEngine';
import {
  playBalatroSound,
  isSfxMuted,
  setSfxMuted,
  getSfxVolume,
  setSfxVolume,
} from '../lib/soundEffects';

export const MusicControl: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Music State
  const [playingMusic, setPlayingMusic] = useState(false);
  const [musicVol, setMusicVolState] = useState(0.35);

  // SFX State
  const [sfxMuted, setSfxMutedState] = useState(false);
  const [sfxVol, setSfxVolState] = useState(1.0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlayingMusic(isMusicPlaying());
    setMusicVolState(getMusicVolume());
    setSfxMutedState(isSfxMuted());
    setSfxVolState(getSfxVolume());

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleMusic = () => {
    playBalatroSound('click');
    const newState = toggleMusic();
    setPlayingMusic(newState);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVolState(val);
    setMusicVolume(val);
    if (val === 0 && playingMusic) {
      stopMusic();
      setPlayingMusic(false);
    } else if (val > 0 && !playingMusic) {
      startMusic();
      setPlayingMusic(true);
    }
  };

  const handleToggleSfx = () => {
    const nextMuted = !sfxMuted;
    setSfxMutedState(nextMuted);
    setSfxMuted(nextMuted);
    if (!nextMuted) {
      playBalatroSound('click');
    }
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVolState(val);
    setSfxVolume(val);
    setSfxMutedState(val === 0);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* UNIFIED SOUND BUTTON (Grimorio Medieval Wood Theme) */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          playBalatroSound('click');
          setIsMenuOpen(!isMenuOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#3b2311] hover:bg-[#4d2f17] border-2 border-[#1e1007] text-[#f4e0ba] shadow-[0_3px_0_0_#120904] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer select-none z-50 text-xs font-mono font-bold"
        title="Ajustes de Sonido y Música"
      >
        <div className="relative flex items-center justify-center w-4 h-4">
          {playingMusic ? (
            <Disc size={15} className="text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          ) : sfxMuted ? (
            <VolumeX size={15} className="text-stone-400" />
          ) : (
            <Volume2 size={15} className="text-amber-400" />
          )}
        </div>

        <span className="font-mono text-xs font-bold tracking-wide text-[#f4e0ba]">
          Sonido
        </span>

        {/* Equalizer Wave Badge when Music Playing */}
        {playingMusic && (
          <div className="flex items-end gap-0.5 h-3 px-0.5">
            <span className="w-0.5 h-2 bg-amber-400 rounded-full" />
            <span className="w-0.5 h-3 bg-amber-300 rounded-full" />
            <span className="w-0.5 h-1.5 bg-amber-400 rounded-full" />
          </div>
        )}
      </motion.button>

      {/* FLOATING AUDIO POPOVER MENU (Grimorio Wood & Parchment Theme) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-[#2b170c] border-2 border-[#54391b] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.95)] p-4 z-100 flex flex-col gap-4 text-left text-[#f4e0ba]"
          >
            {/* Header Title */}
            <div className="flex items-center justify-between border-b border-[#54391b] pb-2">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300">
                <Sliders size={14} className="text-amber-400" />
                <span>PANEL DE AUDIO</span>
              </div>
              <span className="text-[10px] font-mono text-amber-200/60 font-semibold">GRIMORIO</span>
            </div>

            {/* 1. SECCIÓN MÚSICA */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#f4e0ba] flex items-center gap-1.5">
                  <Music size={13} className="text-amber-400" />
                  Música Alquímica
                </span>
                <button
                  type="button"
                  onClick={handleToggleMusic}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer ${
                    playingMusic
                      ? 'bg-[#28632e] text-emerald-100 border border-[#1b431f] shadow-[0_2px_0_0_#0f2611]'
                      : 'bg-[#3b2311] text-amber-200/70 hover:text-white border border-[#1e1007]'
                  }`}
                >
                  {playingMusic ? 'PAUSAR' : 'PLAY'}
                </button>
              </div>

              {/* Music Volume Slider */}
              <div className="flex items-center gap-2">
                <VolumeX size={12} className="text-amber-200/50" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={playingMusic ? musicVol : 0}
                  onChange={handleMusicVolumeChange}
                  className="flex-1 h-1.5 bg-[#1b0e07] accent-amber-400 rounded-lg cursor-pointer"
                />
                <Volume2 size={12} className="text-amber-400" />
                <span className="text-[10px] font-mono text-amber-200/80 w-8 text-right font-bold">
                  {playingMusic ? `${Math.round(musicVol * 100)}%` : '0%'}
                </span>
              </div>
            </div>

            {/* 2. SECCIÓN EFECTOS DE SONIDO (SFX) */}
            <div className="flex flex-col gap-2 border-t border-[#54391b] pt-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#f4e0ba] flex items-center gap-1.5">
                  <Volume2 size={13} className="text-amber-400" />
                  Efectos (SFX)
                </span>
                <button
                  type="button"
                  onClick={handleToggleSfx}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer ${
                    !sfxMuted
                      ? 'bg-[#b45309] text-amber-100 border border-[#78350f] shadow-[0_2px_0_0_#451a03]'
                      : 'bg-[#3b2311] text-amber-200/70 hover:text-white border border-[#1e1007]'
                  }`}
                >
                  {!sfxMuted ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* SFX Volume Slider */}
              <div className="flex items-center gap-2">
                <VolumeX size={12} className="text-amber-200/50" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={!sfxMuted ? sfxVol : 0}
                  onChange={handleSfxVolumeChange}
                  className="flex-1 h-1.5 bg-[#1b0e07] accent-amber-400 rounded-lg cursor-pointer"
                />
                <Volume2 size={12} className="text-amber-400" />
                <span className="text-[10px] font-mono text-amber-200/80 w-8 text-right font-bold">
                  {!sfxMuted ? `${Math.round(sfxVol * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
