import React from 'react';
import { Friend, VoiceInputMode } from '../types';
import { Mic, MicOff, Headphones, Settings, MessageSquare, PhoneOff, Radio, Tv, Edit3, Layers, Keyboard } from 'lucide-react';
import { useLanguage } from '../i18n';

interface FloatingControlDockProps {
  currentUser: Friend;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  isChatOpen: boolean;
  hasUnreadMessages?: boolean;
  isScreenSharing?: boolean;
  voiceInputMode?: VoiceInputMode;
  isPttPressed?: boolean;
  pttKeyLabel?: string;
  showVoiceOverlay?: boolean;
  onToggleVoiceOverlay?: () => void;
  onOpenProfileModal?: () => void;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onToggleChat: () => void;
  onOpenSettings: () => void;
  onOpenScreenShare: () => void;
  onLeaveVoice?: () => void;
}

export const FloatingControlDock: React.FC<FloatingControlDockProps> = ({
  currentUser,
  isMuted,
  isDeafened,
  isSpeaking,
  audioLevel,
  isChatOpen,
  hasUnreadMessages,
  isScreenSharing = false,
  voiceInputMode = 'vad',
  isPttPressed = false,
  pttKeyLabel = 'Space',
  showVoiceOverlay = false,
  onToggleVoiceOverlay,
  onOpenProfileModal,
  onToggleMute,
  onToggleDeafen,
  onToggleChat,
  onOpenSettings,
  onOpenScreenShare,
  onLeaveVoice,
}) => {
  const { t } = useLanguage();
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 select-none">
      <div className="glass-pill px-4 py-2.5 rounded-full flex items-center gap-4 transition-all duration-300 hover:border-cyber-cyan/40 shadow-2xl">
        {/* Active User Avatar & VAD Ring (Click to Edit Profile) */}
        <div
          onClick={onOpenProfileModal}
          className="flex items-center gap-3 border-r border-white/10 pr-3 cursor-pointer group hover:opacity-95 transition-opacity"
          title={t('profile.title')}
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className={`w-9 h-9 rounded-full object-cover transition-all duration-200 ${
                isSpeaking && !isMuted
                  ? 'ring-2 ring-cyber-cyan scale-105 shadow-[0_0_15px_rgba(0,242,254,0.6)]'
                  : 'ring-1 ring-white/20 group-hover:ring-cyber-cyan'
              }`}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-cyber-bg" />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Edit3 className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white font-mono truncate max-w-[90px]">{currentUser.name}</span>
              <Edit3 className="w-2.5 h-2.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="flex items-center gap-1.5">
              {voiceInputMode === 'ptt' ? (
                <span
                  className={`text-[9px] font-mono flex items-center gap-1 ${
                    isPttPressed
                      ? 'text-cyber-purple font-bold animate-pulse'
                      : 'text-gray-400'
                  }`}
                >
                  <Keyboard className="w-2.5 h-2.5" />
                  {isPttPressed ? `PTT ${t('left.speaking')}` : `PTT [${pttKeyLabel}]`}
                </span>
              ) : isSpeaking && !isMuted ? (
                <span className="text-[10px] text-cyber-cyan font-mono flex items-center gap-1 animate-pulse">
                  <Radio className="w-3 h-3" /> {t('left.speaking')}
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  {/* Miniature Audio Level Bar */}
                  <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyber-cyan rounded-full transition-all duration-75"
                      style={{ width: `${Math.min(100, audioLevel)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Mute Mic */}
          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'hover:bg-white/10 text-gray-300 hover:text-white'
            }`}
            title={isMuted ? t('dock.micOn') : t('dock.micOff')}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Deafen */}
          <button
            onClick={onToggleDeafen}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              isDeafened
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'hover:bg-white/10 text-gray-300 hover:text-white'
            }`}
            title={isDeafened ? t('dock.deafenOn') : t('dock.deafenOff')}
          >
            <Headphones className="w-4 h-4" />
          </button>

          {/* Screen Share */}
          <button
            onClick={onOpenScreenShare}
            className={`p-2.5 rounded-full transition-all duration-200 relative ${
              isScreenSharing
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-400'
                : 'hover:bg-white/10 text-gray-300 hover:text-white'
            }`}
            title={isScreenSharing ? t('dock.stopShare') : t('dock.shareScreen')}
          >
            <Tv className="w-4 h-4" />
            {isScreenSharing && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          {/* Voice Overlay Toggle */}
          {onToggleVoiceOverlay && (
            <button
              onClick={onToggleVoiceOverlay}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                showVoiceOverlay
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-lg shadow-cyber-cyan/20'
                  : 'hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
              title={showVoiceOverlay ? t('overlay.close') : t('dock.overlay')}
            >
              <Layers className="w-4 h-4" />
            </button>
          )}

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200"
            title={t('dock.settings')}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mini Chat Toggle Panel */}
          <button
            onClick={onToggleChat}
            className={`p-2.5 rounded-full transition-all duration-200 relative ${
              isChatOpen
                ? 'bg-cyber-cyan text-black shadow-lg shadow-cyber-cyan/30'
                : 'hover:bg-white/10 text-gray-300 hover:text-white'
            }`}
            title={t('dock.chat')}
          >
            <MessageSquare className="w-4 h-4" />
            {hasUnreadMessages && !isChatOpen && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-cyber-pink animate-pulse" />
            )}
          </button>

          {/* Disconnect Voice */}
          {onLeaveVoice && (
            <button
              onClick={onLeaveVoice}
              className="p-2.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 border border-red-500/30"
              title={t('dock.leave')}
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
