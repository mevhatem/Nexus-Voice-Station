import React, { useRef, useEffect, useState } from 'react';
import { Friend, ScreenShareInfo } from '../types';
import {
  Radio,
  MicOff,
  Headphones,
  ShieldCheck,
  Zap,
  Activity,
  UserPlus,
  Tv,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Crown,
  Sparkles,
  PhoneOff,
  PlusCircle,
  AlertCircle,
  X,
  Edit3,
  Layers,
  Sliders,
  Keyboard,
} from 'lucide-react';
import { VoiceInputMode } from '../types';

interface VoiceStageProps {
  inRoom: boolean;
  isHost: boolean;
  currentUser: Friend;
  participants: Friend[];
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  activeRoomCode: string;
  realRamUsageMb: number;
  showRamBadge: boolean;
  screenShareInfo: ScreenShareInfo;
  voiceInputMode?: VoiceInputMode;
  isPttPressed?: boolean;
  pttKeyLabel?: string;
  onSetPeerVolume?: (peerId: string, volume: number) => void;
  onToggleLocalMutePeer?: (peerId: string) => void;
  onOpenProfileModal?: () => void;
  showVoiceOverlay?: boolean;
  onToggleVoiceOverlay?: (val: boolean) => void;
  onStopScreenShare: () => void;
  onCreateRoom: () => void;
  onJoinFriend: (roomCode: string) => void;
  onLeaveRoom: () => void;
  roomNotification: string | null;
  onClearNotification: () => void;
}

export const VoiceStage: React.FC<VoiceStageProps> = ({
  inRoom,
  isHost,
  currentUser,
  participants,
  isMuted,
  isDeafened,
  isSpeaking,
  audioLevel,
  activeRoomCode,
  realRamUsageMb,
  showRamBadge,
  screenShareInfo,
  voiceInputMode = 'vad',
  isPttPressed = false,
  pttKeyLabel = 'Space',
  onSetPeerVolume,
  onToggleLocalMutePeer,
  onOpenProfileModal,
  showVoiceOverlay = false,
  onToggleVoiceOverlay,
  onStopScreenShare,
  onCreateRoom,
  onJoinFriend,
  onLeaveRoom,
  roomNotification,
  onClearNotification,
}) => {
  const allParticipants = [
    { ...currentUser, isSpeaking, isLocal: true },
    ...participants.map((p) => ({ ...p, isLocal: false })),
  ];

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStreamAudioMuted, setIsStreamAudioMuted] = useState(false);
  const [lobbyInputCode, setLobbyInputCode] = useState('');
  const [volumeMenuPeerId, setVolumeMenuPeerId] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current && screenShareInfo.stream) {
      videoRef.current.srcObject = screenShareInfo.stream;
      videoRef.current.play().catch(() => {});
    }
  }, [screenShareInfo.stream]);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleStreamAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isStreamAudioMuted;
      setIsStreamAudioMuted(!isStreamAudioMuted);
    }
  };

  const handleLobbyJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lobbyInputCode.trim()) return;
    onJoinFriend(lobbyInputCode.trim());
    setLobbyInputCode('');
  };

  return (
    <main className="flex-1 h-full flex flex-col justify-between p-6 overflow-hidden relative select-none">
      {/* Top Floating Glass Header */}
      <header className="glass-panel px-5 py-3 rounded-2xl flex items-center justify-between shadow-xl z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide font-mono">
                {inRoom ? `Canlı Oda #${activeRoomCode}` : 'Nexus Lobi İstasyonu'}
              </h2>
              {inRoom && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-mono flex items-center gap-1 ${
                    isHost
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30'
                  }`}
                >
                  {isHost ? (
                    <>
                      <Crown className="w-3 h-3" /> Host
                    </>
                  ) : (
                    'Katılımcı'
                  )}
                </span>
              )}
            </div>
            <p className="text-[11px] text-cyber-textMuted">
              {inRoom
                ? screenShareInfo.isSharing
                  ? `Ekran Yayını Aktif (${screenShareInfo.resolution.toUpperCase()} ${screenShareInfo.fps} FPS)`
                  : 'Doğrudan Cihazdan Cihaza (P2P) / 48kHz Opus'
                : 'Bağlantı Bekleniyor — Oda oluştur veya odaya katıl'}
            </p>
          </div>
        </div>

        {/* Stats Badges & Actions */}
        <div className="flex items-center gap-3 text-xs font-mono">
          {voiceInputMode === 'ptt' && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all ${
                isPttPressed
                  ? 'bg-cyber-purple text-white border-cyber-purple shadow-lg shadow-cyber-purple/40 animate-pulse'
                  : 'bg-cyber-purple/10 border-cyber-purple/30 text-cyber-purple'
              }`}
              title="Bas-Konuş Modu (Tuşa basılı tutarak konuşun)"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>PTT: {pttKeyLabel} {isPttPressed ? '(Aktif)' : ''}</span>
            </div>
          )}

          {inRoom && onToggleVoiceOverlay && (
            <button
              onClick={() => onToggleVoiceOverlay(!showVoiceOverlay)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all ${
                showVoiceOverlay
                  ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-md shadow-cyber-cyan/20'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
              title={showVoiceOverlay ? "Masaüstü Oyun Katmanını (Overlay) Gizle" : "Masaüstü Oyun Katmanını (Overlay) Göster"}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Overlay</span>
            </button>
          )}

          {inRoom && (
            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/40 transition-all font-bold"
              title={isHost ? 'Odayı Kapat' : 'Odadan Ayrıl'}
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>{isHost ? 'Odayı Sonlandır' : 'Ayrıl'}</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-cyber-cyan">
            <Zap className="w-3.5 h-3.5 fill-cyber-cyan" />
            <span>&lt; 20 ms P2P</span>
          </div>

          {showRamBadge && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RAM: {realRamUsageMb > 0 ? `${realRamUsageMb} MB` : '~35 MB'}</span>
            </div>
          )}
        </div>
      </header>

      {/* Notification Banner (Kick / Room Closed Alerts) */}
      {roomNotification && (
        <div className="mt-3 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between text-amber-300 text-xs font-mono z-20 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{roomNotification}</span>
          </div>
          <button
            onClick={onClearNotification}
            className="p-1 rounded-lg hover:bg-white/10 text-amber-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. LOBBY STAGE (When not in any room) */}
      {!inRoom ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 z-0 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyber-cyan/20 to-cyber-purple/30 border border-cyber-cyan/40 shadow-2xl shadow-cyber-cyan/20 mb-2">
              <Sparkles className="w-8 h-8 text-cyber-cyan" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-mono tracking-wider">
              NEXUS <span className="text-cyber-cyan">LOBİ</span>
            </h1>
            <p className="text-xs text-cyber-textMuted max-w-md mx-auto leading-relaxed">
              Oda kodları artık otomatik verilmez. Sen yeni bir oda kurarak **Host** olabilir veya arkadaşının verdiği 4 haneli koda katılabilirsin.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            {/* Card 1: Create Room */}
            <div className="glass-panel p-6 rounded-3xl border border-cyber-cyan/30 bg-cyber-cyan/5 flex flex-col justify-between hover:border-cyber-cyan transition-all group shadow-xl">
              <div className="space-y-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-cyber-cyan/15 flex items-center justify-center text-cyber-cyan mb-3">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-mono uppercase">Yeni Oda Oluştur</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Odanın yöneticisi olursun. Katılımcıları susturma, odadan atma ve 60 FPS ekran paylaşma yetkilerine sahip olursun.
                </p>
              </div>

              <button
                onClick={onCreateRoom}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyber-cyan to-cyber-teal text-black font-mono font-extrabold text-xs shadow-lg shadow-cyber-cyan/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                Oda Başlat (Host Ol)
              </button>
            </div>

            {/* Card 2: Join Room */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-white/30 transition-all shadow-xl">
              <div className="space-y-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-cyber-purple/15 flex items-center justify-center text-cyber-purple mb-3">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white font-mono uppercase">Arkadaşın Odasına Katıl</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Arkadaşın oda kurup sana 4 haneli oda kodunu verdiğinde buradan anında sese ve yayına bağlanabilirsin.
                </p>
              </div>

              <form onSubmit={handleLobbyJoin} className="space-y-2">
                <div className="glass-panel p-1.5 rounded-2xl flex items-center gap-2 border border-white/10 focus-within:border-cyber-cyan">
                  <input
                    type="text"
                    value={lobbyInputCode}
                    onChange={(e) => setLobbyInputCode(e.target.value)}
                    placeholder="Oda Kodu (Örn: 4819)"
                    className="bg-transparent flex-1 text-xs text-white placeholder-gray-500 outline-none px-3 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={!lobbyInputCode.trim()}
                    className="px-4 py-2 bg-cyber-cyan text-black font-mono font-bold text-xs rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Katıl
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Mic Test Preview in Lobby */}
          <div className="mt-8 flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 font-mono text-xs text-cyber-textMuted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Profilin: <strong className="text-white">{currentUser.name || 'İsimsiz'}</strong>
            </span>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
              <span>Mikrofon:</span>
              <div className="w-20 h-1.5 bg-black/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyber-cyan transition-all duration-75"
                  style={{ width: `${Math.min(100, audioLevel)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. IN-ROOM STAGE (Screen Share OR Avatar Circles) */
        screenShareInfo.isSharing && screenShareInfo.stream ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden gap-3 py-3 z-0">
            {/* Cinema Screen Video Player */}
            <div
              ref={containerRef}
              className="flex-1 relative rounded-3xl overflow-hidden glass-panel border border-cyber-cyan/30 bg-black/95 flex items-center justify-center shadow-2xl group min-h-0"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isStreamAudioMuted || screenShareInfo.sharerId === currentUser.id}
                className="w-full h-full object-contain max-h-[calc(100vh-230px)]"
              />

              {/* Top Stream Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity pointer-events-auto">
                <div className="flex items-center gap-2.5 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-lg">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> CANLI
                  </span>
                  <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-cyber-cyan" />
                    {screenShareInfo.sharerId === currentUser.id ? 'Senin Yayının' : `${screenShareInfo.sharerName} Yayını`}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-cyber-cyan">
                    {screenShareInfo.resolution.toUpperCase()} • {screenShareInfo.fps} FPS
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 shadow-lg">
                  {screenShareInfo.sharerId !== currentUser.id && (
                    <button
                      onClick={toggleStreamAudio}
                      className="p-1.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      title={isStreamAudioMuted ? 'Yayın Sesini Aç' : 'Yayın Sesini Sustur'}
                    >
                      {isStreamAudioMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}

                  <button
                    onClick={handleToggleFullscreen}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                    title="Tam Ekran Modu"
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  {screenShareInfo.sharerId === currentUser.id && (
                    <button
                      onClick={onStopScreenShare}
                      className="px-3 py-1 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 text-[11px] font-mono font-bold transition-all ml-1 shadow-md shadow-red-500/20"
                    >
                      Yayını Durdur
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Speaking Participants Bar while Watching Stream */}
            <div className="flex items-center justify-center gap-3 overflow-x-auto py-1 px-4 shrink-0">
              {allParticipants.map((user) => {
                const userSpeaking = user.isSpeaking && !(user.isLocal && isMuted);
                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-panel border transition-all ${
                      userSpeaking
                        ? 'border-cyber-cyan bg-cyber-cyan/10 shadow-md shadow-cyber-cyan/20 scale-105'
                        : 'border-white/5 bg-black/50 hover:border-white/20'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className={`w-7 h-7 rounded-full object-cover ${
                          userSpeaking ? 'ring-2 ring-cyber-cyan' : 'ring-1 ring-white/10'
                        }`}
                      />
                      {user.isLocal && isMuted && (
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-red-500 flex items-center justify-center text-[7px] text-white">
                          ✕
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono font-bold text-white truncate max-w-[100px]">
                        {user.name} {user.isLocal && '(Sen)'}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {userSpeaking ? (
                          <span className="text-cyber-cyan animate-pulse">Konuşuyor</span>
                        ) : (
                          'Dinliyor'
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Regular Audio Avatar Grid */
          <div className="flex-1 flex flex-col items-center justify-center py-6 z-0">
            {participants.length === 0 ? (
              <div className="flex flex-col items-center gap-6">
                {/* Solo Card (You) */}
                <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center relative min-w-[240px] transition-all duration-300 border-white/10 group">
                  {/* Edit profile button */}
                  {onOpenProfileModal && (
                    <button
                      onClick={onOpenProfileModal}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-xl bg-white/5 hover:bg-cyber-cyan hover:text-black text-gray-400 transition-all opacity-70 group-hover:opacity-100"
                      title="Profilimi Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className={`relative mb-4 ${isSpeaking && !isMuted ? 'speaking-aura' : ''}`}>
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className={`w-24 h-24 rounded-full object-cover transition-all duration-300 relative z-10 ${
                        isSpeaking && !isMuted
                          ? 'ring-4 ring-cyber-cyan scale-105 shadow-2xl shadow-cyber-cyan/50'
                          : 'ring-2 ring-white/10'
                      }`}
                    />
                    {isMuted && (
                      <div className="absolute -bottom-1 -right-1 bg-red-500/90 text-white p-1.5 rounded-full border-2 border-cyber-bg z-20 shadow-lg">
                        <MicOff className="w-4 h-4" />
                      </div>
                    )}
                    {isDeafened && (
                      <div className="absolute -bottom-1 -left-1 bg-red-500/90 text-white p-1.5 rounded-full border-2 border-cyber-bg z-20 shadow-lg">
                        <Headphones className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-1">
                    <h3 className="text-base font-bold text-white flex items-center justify-center gap-2 font-mono">
                      {currentUser.name}
                      <span className="text-[10px] text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/20">
                        {isHost ? 'Oda Sahibi' : 'Sen'}
                      </span>
                    </h3>
                    {currentUser.customStatus && (
                      <p className="text-[10px] text-cyber-purple font-mono truncate max-w-[180px]">
                        {currentUser.customStatus}
                      </p>
                    )}
                    <p className="text-xs text-cyber-textMuted">
                      {isSpeaking && !isMuted ? (
                        <span className="text-cyber-cyan font-mono animate-pulse flex items-center justify-center gap-1">
                          <Activity className="w-3 h-3" /> Konuşuyor...
                        </span>
                      ) : (
                        'Seste Bekliyor'
                      )}
                    </p>
                  </div>

                  {/* Dynamic Equalizer */}
                  {isSpeaking && !isMuted && (
                    <div className="w-28 h-1.5 bg-black/40 rounded-full mt-3 overflow-hidden p-0.5 relative z-10">
                      <div
                        className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-teal rounded-full transition-all duration-75"
                        style={{ width: `${Math.max(25, audioLevel)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Waiting for friends message */}
                <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-3 border border-white/5 text-cyber-textMuted max-w-md text-center">
                  <UserPlus className="w-5 h-5 text-cyber-cyan shrink-0 animate-bounce" />
                  <p className="text-xs leading-relaxed">
                    {isHost ? (
                      <>
                        Oda hazır! Arkadaşına <span className="text-cyber-cyan font-mono font-bold">#{activeRoomCode}</span> kodunu vererek odaya davet et.
                      </>
                    ) : (
                      <>
                        Odaya katıldın! Diğer arkadaşların da <span className="text-cyber-cyan font-mono font-bold">#{activeRoomCode}</span> koduyla katılabilir.
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-5xl justify-center">
                {allParticipants.map((user) => {
                  const userSpeaking = user.isSpeaking && !(user.isLocal && isMuted);
                  const isMenuOpen = volumeMenuPeerId === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`glass-panel p-6 rounded-3xl flex flex-col items-center justify-center relative transition-all duration-300 group ${
                        userSpeaking
                          ? 'border-cyber-cyan shadow-[0_0_35px_rgba(0,242,254,0.35)] scale-105 bg-cyber-cyan/5'
                          : 'hover:border-white/20 hover:scale-[1.02]'
                      }`}
                    >
                      {/* Top-Right Control: Edit Profile for Local, Individual Volume for Peers */}
                      {user.isLocal ? (
                        onOpenProfileModal && (
                          <button
                            onClick={onOpenProfileModal}
                            className="absolute top-3.5 right-3.5 p-1.5 rounded-xl bg-white/5 hover:bg-cyber-cyan hover:text-black text-gray-400 transition-all opacity-70 group-hover:opacity-100"
                            title="Profilimi Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )
                      ) : (
                        <div className="absolute top-3.5 right-3.5 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setVolumeMenuPeerId(isMenuOpen ? null : user.id);
                            }}
                            className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                              user.isLocallyMuted
                                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                : (user.volume ?? 100) !== 100
                                ? 'bg-cyber-cyan/20 border-cyber-cyan/40 text-cyber-cyan font-bold font-mono'
                                : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                            title={`Kullanıcı Sesini Ayarla (%${user.volume ?? 100})`}
                          >
                            {user.isLocallyMuted ? (
                              <VolumeX className="w-3.5 h-3.5 text-red-400" />
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                {(user.volume ?? 100) !== 100 && (
                                  <span className="text-[9px] font-mono">%{user.volume ?? 100}</span>
                                )}
                              </>
                            )}
                          </button>

                          {/* Individual User Volume Popover */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-9 z-30 bg-[#0d1017]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl min-w-[210px] flex flex-col gap-2.5 animate-fadeIn"
                            >
                              <div className="flex items-center justify-between text-[11px] font-mono text-gray-300">
                                <span className="font-bold flex items-center gap-1">
                                  <Volume2 className="w-3 h-3 text-cyber-cyan" /> Kullanıcı Sesi
                                </span>
                                <span className="text-cyber-cyan font-bold">
                                  {user.isLocallyMuted ? 'Sessiz' : `%${user.volume ?? 100}`}
                                </span>
                              </div>

                              {/* Volume Slider: 0% to 200% */}
                              <input
                                type="range"
                                min="0"
                                max="200"
                                step="5"
                                value={user.isLocallyMuted ? 0 : (user.volume ?? 100)}
                                onChange={(e) =>
                                  onSetPeerVolume && onSetPeerVolume(user.id, parseInt(e.target.value))
                                }
                                className="w-full accent-cyber-cyan bg-white/10 cursor-pointer h-1.5 rounded-lg"
                              />

                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                                <button
                                  onClick={() => onSetPeerVolume && onSetPeerVolume(user.id, 100)}
                                  className="text-[10px] font-mono text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                  %100 Sıfırla
                                </button>

                                <button
                                  onClick={() => onToggleLocalMutePeer && onToggleLocalMutePeer(user.id)}
                                  className={`text-[10px] font-mono px-2 py-1 rounded font-bold transition-all ${
                                    user.isLocallyMuted
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                      : 'bg-white/5 text-gray-300 hover:text-red-400'
                                  }`}
                                >
                                  {user.isLocallyMuted ? 'Sesi Aç' : 'Bana Sustur'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`relative mb-4 ${userSpeaking ? 'speaking-aura' : ''}`}>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className={`w-20 h-20 rounded-full object-cover transition-all duration-300 relative z-10 ${
                            userSpeaking ? 'ring-4 ring-cyber-cyan scale-105' : 'ring-2 ring-white/10'
                          }`}
                        />

                        {user.isLocal && isMuted && (
                          <div className="absolute -bottom-1 -right-1 bg-red-500/90 text-white p-1.5 rounded-full border-2 border-cyber-bg z-20 shadow-lg">
                            <MicOff className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {user.isLocal && isDeafened && (
                          <div className="absolute -bottom-1 -left-1 bg-red-500/90 text-white p-1.5 rounded-full border-2 border-cyber-bg z-20 shadow-lg">
                            <Headphones className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="text-center space-y-1">
                        <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5 font-mono">
                          {user.name}
                          {user.isLocal ? (
                            <span className="text-[10px] text-cyber-cyan font-normal bg-cyber-cyan/10 px-1.5 py-0.5 rounded border border-cyber-cyan/20">
                              {isHost ? 'Host' : 'Sen'}
                            </span>
                          ) : (
                            user.isHost && (
                              <span className="text-[10px] text-amber-400 font-normal bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                Host
                              </span>
                            )
                          )}
                        </h3>
                        {user.customStatus && (
                          <p className="text-[10px] text-cyber-purple font-mono truncate max-w-[150px]">
                            {user.customStatus}
                          </p>
                        )}
                        <p className="text-[11px] text-cyber-textMuted">
                          {userSpeaking ? (
                            <span className="text-cyber-cyan font-mono animate-pulse flex items-center justify-center gap-1">
                              <Activity className="w-3 h-3" /> Konuşuyor...
                            </span>
                          ) : (
                            'Dinliyor'
                          )}
                        </p>
                      </div>

                      {userSpeaking && (
                        <div className="w-24 h-1.5 bg-black/40 rounded-full mt-3 overflow-hidden p-0.5 relative z-10">
                          <div
                            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-teal rounded-full transition-all duration-75"
                            style={{
                              width: `${Math.max(25, user.isLocal ? audioLevel || 75 : 70)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      )}
    </main>
  );
};
