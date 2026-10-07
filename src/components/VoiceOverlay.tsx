import React, { useState, useEffect } from 'react';
import { Friend } from '../types';
import { Move, X, Eye, EyeOff, Sun } from 'lucide-react';

interface VoiceOverlayProps {
  inRoom: boolean;
  activeRoomCode: string;
  currentUser: Friend;
  participants: Friend[];
  isMuted: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  isOpen: boolean;
  onClose: () => void;
}

const OPACITY_PRESETS = [0.35, 0.5, 0.75, 0.95];

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({
  inRoom,
  activeRoomCode,
  currentUser,
  participants,
  isMuted,
  isSpeaking,
  isOpen,
  onClose,
}) => {
  const [onlySpeaking, setOnlySpeaking] = useState<boolean>(false);
  const [opacityIndex, setOpacityIndex] = useState<number>(() => {
    const saved = localStorage.getItem('nexus_overlay_opacity_index');
    return saved !== null ? parseInt(saved, 10) : 1; // Default: 50%
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 24,
    posY: 24,
  });

  if (!isOpen || !inRoom) return null;

  const currentOpacity = OPACITY_PRESETS[opacityIndex] ?? 0.5;
  const dynamicOpacity = isHovered ? Math.min(1.0, currentOpacity + 0.25) : currentOpacity;

  const handleCycleOpacity = () => {
    const nextIndex = (opacityIndex + 1) % OPACITY_PRESETS.length;
    setOpacityIndex(nextIndex);
    localStorage.setItem('nexus_overlay_opacity_index', String(nextIndex));
  };

  const allMembers = [
    { ...currentUser, isSpeaking, isLocal: true },
    ...participants.map((p) => ({ ...p, isLocal: false })),
  ];

  const displayedMembers = onlySpeaking
    ? allMembers.filter((m) => m.isSpeaking && !(m.isLocal && isMuted))
    : allMembers;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, input, a')) return;
    setIsDragging(true);
    setDragStart({
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.startX;
      const dy = e.clientY - dragStart.startY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 220, dragStart.posX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 200, dragStart.posY + dy)),
      });
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed z-40 select-none animate-fadeIn pointer-events-auto"
    >
      <div
        style={{
          backgroundColor: `rgba(6, 9, 14, ${dynamicOpacity})`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        className="border border-white/10 rounded-2xl p-2.5 shadow-2xl min-w-[190px] max-w-[240px] flex flex-col gap-2 transition-all duration-200 hover:border-cyber-cyan/40"
      >
        {/* Overlay Titlebar & Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between pb-1.5 border-b border-white/10 cursor-move text-[11px] font-mono text-gray-400"
        >
          <div className="flex items-center gap-1.5 pointer-events-none">
            <Move className="w-3 h-3 text-cyber-cyan pointer-events-none" />
            <span className="font-bold text-white tracking-wide truncate max-w-[90px] pointer-events-none">#{activeRoomCode}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Opacity Cycler */}
            <button
              onClick={handleCycleOpacity}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-[9px] font-mono flex items-center gap-0.5"
              title={`Şeffaflık: %${Math.round(currentOpacity * 100)}`}
            >
              <Sun className="w-3 h-3" />
              <span>%{(currentOpacity * 100).toFixed(0)}</span>
            </button>

            {/* Speaking Filter */}
            <button
              onClick={() => setOnlySpeaking(!onlySpeaking)}
              className={`p-1 rounded hover:bg-white/10 transition-colors ${
                onlySpeaking ? 'text-cyber-cyan bg-cyber-cyan/15' : 'text-gray-400'
              }`}
              title={onlySpeaking ? 'Tüm üyeleri göster' : 'Sadece konuşanları göster'}
            >
              {onlySpeaking ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Katmanı Gizle"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Member list with live speaking indicators */}
        <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-0.5">
          {displayedMembers.length === 0 ? (
            <div className="py-2 text-center text-[10px] text-gray-500 font-mono">
              Kimse konuşmuyor
            </div>
          ) : (
            displayedMembers.map((member) => {
              const speaking = Boolean(member.isSpeaking && !(member.isLocal && isMuted));
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150 ${
                    speaking
                      ? 'bg-emerald-500/20 border border-emerald-400/35 shadow-[0_0_10px_rgba(52,211,153,0.15)]'
                      : 'opacity-70 hover:opacity-100 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {/* Avatar with glowing ring */}
                  <div className="relative shrink-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className={`w-6 h-6 rounded-full object-cover transition-all ${
                        speaking
                          ? 'ring-2 ring-emerald-400 scale-105 shadow-[0_0_10px_#34d399]'
                          : 'ring-1 ring-white/20'
                      }`}
                    />
                    {member.isLocal && isMuted && (
                      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 flex items-center justify-center text-[6px] text-white">
                        ✕
                      </span>
                    )}
                  </div>

                  {/* Name & Speaking Pulse */}
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span
                      className={`text-xs font-mono truncate ${
                        speaking ? 'text-white font-bold' : 'text-gray-300'
                      }`}
                    >
                      {member.name} {member.isLocal && '(Sen)'}
                    </span>

                    {speaking && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-1.5 shadow-[0_0_6px_#34d399]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
