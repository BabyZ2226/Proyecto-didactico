import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, Share2 } from 'lucide-react';

interface QRCodeModalProps {
  roomCode: string;
  onClose: () => void;
}

export function QRCodeModal({ roomCode, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const joinUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  return (
    <div className="absolute inset-x-0 top-0 min-h-full h-auto z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm py-10 px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 max-w-sm w-full relative flex flex-col items-center text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 mb-3">
          <QrCode size={18} />
        </div>

        <h3 className="text-base font-semibold text-zinc-100 tracking-tight mb-1">
          Unirse a la Mesa
        </h3>
        <p className="text-xs text-zinc-400 mb-4 max-w-xs font-mono">
          Escanea el código QR o comparte el enlace para jugar en la misma mesa.
        </p>

        {/* QR Code Container */}
        <div className="bg-white p-3 rounded-lg border border-zinc-700 mb-4">
          <QRCodeSVG
            value={joinUrl}
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Room Code Badge */}
        <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 mb-3 flex items-center justify-between">
          <div className="text-left pl-1">
            <span className="text-[9px] uppercase font-mono text-zinc-500 block">Código</span>
            <span className="font-mono text-base font-bold text-zinc-200">{roomCode}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded border border-zinc-700 transition-colors"
          >
            {copiedCode ? <Check size={13} className="text-zinc-200" /> : <Copy size={13} />}
            <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>

        {/* Copy Link Action */}
        <button
          onClick={handleCopyUrl}
          className="w-full py-2 px-3 bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          <span>{copied ? 'Enlace copiado' : 'Copiar Enlace'}</span>
        </button>
      </div>
    </div>
  );
}
