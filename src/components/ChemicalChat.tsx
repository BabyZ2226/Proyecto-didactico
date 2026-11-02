import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';

interface ChemicalChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isChemical?: boolean) => void;
  currentUserId?: string;
}

const CHEMICAL_SHOUTS = [
  '🧪 ¡Tengo un Carbono!',
  '⚡ ¡Octeto Cerrado!',
  '🔥 ¡Reacción Exotérmica!',
  '⚛️ ¡Enlace Triple!',
  '💧 ¡Sinteticé Agua!',
  '💎 ¡Tetravalencia Perfecta!',
];

export function ChemicalChat({ messages, onSendMessage, currentUserId }: ChemicalChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(messages.length);

  useEffect(() => {
    if (!isOpen && messages.length > prevCountRef.current) {
      setUnreadCount(prev => prev + (messages.length - prevCountRef.current));
    }
    prevCountRef.current = messages.length;
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  const handleShout = (shout: string) => {
    onSendMessage(shout, true);
  };

  return (
    <div className="fixed bottom-[4.5rem] right-2 sm:bottom-20 sm:right-6 z-[60] flex flex-col items-end">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[260px] sm:w-80 h-auto bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col mb-2.5">
          {/* Header */}
          <div className="p-2.5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-200">
              <MessageSquare size={13} className="text-zinc-400" />
              <span>Chat de Sala</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800"
            >
              <X size={14} />
            </button>
          </div>

          {/* Quick Reaction Buttons */}
          <div className="p-1.5 bg-zinc-950/60 border-b border-zinc-800 flex flex-wrap gap-1">
            {CHEMICAL_SHOUTS.map((shout, i) => (
              <button
                key={i}
                onClick={() => handleShout(shout)}
                className="whitespace-nowrap px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono border border-zinc-700 transition-colors shrink-0"
              >
                {shout}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-2.5 h-auto space-y-2 text-xs font-mono">
            {messages.length === 0 ? (
              <div className="text-center text-zinc-500 py-10 text-xs">Sin mensajes aún.</div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const isSystem = msg.senderId === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-1">
                      <span className="inline-block bg-zinc-950 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded text-[10px]">
                        {msg.avatar} {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={cn('flex flex-col max-w-[85%]', isMe ? 'ml-auto items-end' : 'mr-auto items-start')}
                  >
                    <div className="flex items-center gap-1 text-[9px] text-zinc-500 mb-0.5 px-0.5">
                      <span>{msg.avatar}</span>
                      <span>{isMe ? 'Tú' : msg.senderName}</span>
                    </div>
                    <div
                      className={cn(
                        'p-2 rounded-lg text-xs break-words border',
                        isMe
                          ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                          : 'bg-zinc-950 text-zinc-300 border-zinc-800',
                        msg.isChemical && 'border-zinc-600 bg-zinc-900 text-zinc-200'
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-2 border-t border-zinc-800 bg-zinc-950 flex gap-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Mensaje..."
              maxLength={120}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-1.5 bg-zinc-100 hover:bg-white disabled:opacity-30 text-zinc-950 rounded transition-colors shrink-0"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={handleOpen}
        className={cn(
          'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-colors',
          isOpen
            ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
            : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
        )}
      >
        <MessageSquare size={13} />
        <span>Chat</span>
        {unreadCount > 0 && !isOpen && (
          <span className="w-4 h-4 rounded-full bg-zinc-100 text-zinc-950 text-[9px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
