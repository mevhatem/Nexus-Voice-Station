import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import {
  Mic,
  MicOff,
  Move,
  X,
  Eye,
  EyeOff,
  Sun,
  Radio,
  Sliders,
} from 'lucide-react';
import {
  OverlaySyncPayload,
  getOverlayChannel,
  sendOverlayCommand,
  getCachedOverlayState,
} from '../utils/overlayChannel';
import { useLanguage } from '../i18n';

const OPACITY_PRESETS = [0.35, 0.5, 0.75, 0.95];

export const DesktopOverlayWindow: React.FC = () => {
  const { t } = useLanguage();
  const [syncState, setSyncState] = useState<OverlaySyncPayload | null>(() => getCachedOverlayState());
  const [onlySpeaking, setOnlySpeaking] = useState<boolean>(() => {
    return localStorage.getItem('nexus_overlay_only_speaking') === 'true';
  });
  const [opacityIndex, setOpacityIndex] = useState<number>(() => {
    const saved = localStorage.getItem('nexus_overlay_opacity_index');
    return saved !== null ? parseInt(saved, 10) : 1; // Default to 0.50 (50%)
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const currentOpacity = OPACITY_PRESETS[opacityIndex] ?? 0.5;

  // Listen to broadcast messages from main window
  useEffect(() => {
    const channel = getOverlayChannel();

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'SYNC_STATE' && e.data.payload) {
        setSyncState(e.data.payload);
      }
    };

    channel.addEventListener('message', handleMessage);
    // Request fresh state on mount
    sendOverlayCommand({ type: 'CMD_REQUEST_SYNC' });

    return () => {
      channel.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleStartDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, input, a')) return;

    try {
      getCurrentWindow().startDragging();
    } catch {
      invoke('start_dragging_window').catch(() => {});
    }
  };

  const handleClose = async () => {
    try {
      await invoke('set_overlay_visible', { visible: false });
    } catch {}
    sendOverlayCommand({ type: 'CMD_CLOSE' });
  };

  const handleToggleMute = () => {
    sendOverlayCommand({ type: 'CMD_TOGGLE_MUTE' });
  };

  const handleCycleOpacity = () => {
    const nextIndex = (opacityIndex + 1) % OPACITY_PRESETS.length;
    setOpacityIndex(nextIndex);
    localStorage.setItem('nexus_overlay_opacity_index', String(nextIndex));
  };

  const handleToggleOnlySpeaking = () => {
    const next = !onlySpeaking;
    setOnlySpeaking(next);
    localStorage.setItem('nexus_overlay_only_speaking', String(next));
  };

  const inRoom = syncState?.inRoom ?? false;
  const activeRoomCode = syncState?.activeRoomCode ?? '';
  const currentUser = syncState?.currentUser;
  const participants = syncState?.participants ?? [];

  const allMembers = [
    ...(currentUser ? [{ ...currentUser, isLocal: true }] : []),
    ...participants.map((p) => ({ ...p, isLocal: false })),
  ];

  const displayedMembers = onlySpeaking
    ? allMembers.filter((m) => m.isSpeaking && !(m.isLocal && m.isMuted))
    : allMembers;

  // Background opacity adjustment: Slightly more opaque on hover for clear visibility
  const dynamicOpacity = isHovered ? Math.min(1.0, currentOpacity + 0.25) : currentOpacity;

  return (
    <div
      className="w-full h-full p-2 select-none flex flex-col font-sans transition-opacity duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          backgroundColor: `rgba(6, 9, 14, ${dynamicOpacity})`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-full transition-all duration-200 hover:border-cyber-cyan/30"
      >
        {/* Drag Bar & Window Header */}
        <div
          data-tauri-drag-region
          onMouseDown={handleStartDrag}
          className="flex items-center justify-between px-3 py-2 border-b border-white/10 cursor-move bg-white/[0.03]"
        >
          <div className="flex items-center gap-1.5 pointer-events-none" data-tauri-drag-region>
            <Move className="w-3 h-3 text-cyber-cyan shrink-0 pointer-events-none" />
            <span className="font-mono text-xs font-bold text-white tracking-wider truncate max-w-[90px] pointer-events-none" data-tauri-drag-region>
              {inRoom ? `#${activeRoomCode}` : 'Nexus'}
            </span>
            {syncState?.voiceInputMode === 'ptt' && (
              <span className={`text-[8px] font-mono px-1 py-0.2 rounded border uppercase ${
                syncState.isPttActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}>
                PTT
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Opacity Preset Cycler */}
            <button
              onClick={handleCycleOpacity}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-[10px] font-mono flex items-center gap-0.5"
              title={t('overlay.opacityTooltip', { val: Math.round(currentOpacity * 100).toString() })}
            >
              <Sun className="w-3 h-3" />
              <span className="text-[9px]">%{(currentOpacity * 100).toFixed(0)}</span>
            </button>

            {/* Speaking Filter */}
            <button
              onClick={handleToggleOnlySpeaking}
              className={`p-1 rounded transition-colors ${
                onlySpeaking ? 'text-cyber-cyan bg-cyber-cyan/15' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={onlySpeaking ? t('overlay.allMembers') : t('overlay.speakingOnly')}
            >
              {onlySpeaking ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>

            {/* Quick Mic Mute Toggle */}
            <button
              onClick={handleToggleMute}
              className={`p-1 rounded transition-colors ${
                currentUser?.isMuted
                  ? 'text-red-400 bg-red-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={currentUser?.isMuted ? t('dock.micOn') : t('dock.micOff')}
            >
              {currentUser?.isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </button>

            {/* Close Overlay Window */}
            <button
              onClick={handleClose}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-red-500/20 hover:text-red-300 transition-colors"
              title={t('overlay.close')}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="p-2 flex flex-col gap-1.5 overflow-y-auto max-h-[300px]">
          {!inRoom ? (
            <div className="py-4 text-center text-xs text-gray-400 font-mono">
              {t('overlay.notConnected')}
            </div>
          ) : displayedMembers.length === 0 ? (
            <div className="py-3 text-center text-xs text-gray-500 font-mono">
              {t('overlay.noOneSpeaking')}
            </div>
          ) : (
            displayedMembers.map((member) => {
              const speaking = Boolean(member.isSpeaking && !(member.isLocal && member.isMuted));
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150 ${
                    speaking
                      ? 'bg-emerald-500/20 border border-emerald-400/40 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                      : 'opacity-75 hover:opacity-100 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {/* Avatar with dynamic speaking glow */}
                  <div className="relative shrink-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className={`w-6 h-6 rounded-full object-cover transition-all ${
                        speaking
                          ? 'ring-2 ring-emerald-400 shadow-[0_0_10px_#34d399] scale-105'
                          : 'ring-1 ring-white/20'
                      }`}
                    />
                    {member.isMuted && (
                      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 flex items-center justify-center text-[6px] text-white font-bold">
                        ✕
                      </span>
                    )}
                  </div>

                  {/* Nickname & Speaking status indicator */}
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-xs font-mono truncate leading-tight ${
                          speaking ? 'text-white font-bold' : 'text-gray-300'
                        }`}
                      >
                        {member.name} {member.isLocal && ` ${t('left.you')}`}
                      </span>
                      {member.customStatus && (
                        <span className="text-[9px] text-gray-400 truncate leading-none">
                          {member.customStatus}
                        </span>
                      )}
                    </div>

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
