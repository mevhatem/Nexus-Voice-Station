import React, { useState } from 'react';
import { Friend } from '../types';
import {
  Users,
  Copy,
  Check,
  UserPlus,
  Radio,
  Cpu,
  Sparkles,
  Crown,
  PhoneOff,
  UserX,
  MicOff,
  Mic,
  PlusCircle,
  Shield,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface LeftPanelProps {
  inRoom: boolean;
  isHost: boolean;
  activeRoomCode: string;
  connectedFriends: Friend[];
  onCreateRoom: () => void;
  onJoinFriend: (roomCode: string) => void;
  onLeaveRoom: () => void;
  onKickPeer: (peerId: string) => void;
  onRemoteMutePeer: (peerId: string) => void;
  onSetPeerVolume?: (peerId: string, volume: number) => void;
  onToggleLocalMutePeer?: (peerId: string) => void;
  connectionStatus: string;
  showRamBadge?: boolean;
  realRamUsageMb?: number;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  inRoom,
  isHost,
  activeRoomCode,
  connectedFriends,
  onCreateRoom,
  onJoinFriend,
  onLeaveRoom,
  onKickPeer,
  onRemoteMutePeer,
  onSetPeerVolume,
  onToggleLocalMutePeer,
  connectionStatus,
  showRamBadge = true,
  realRamUsageMb = 35.2,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [volumeMenuPeerId, setVolumeMenuPeerId] = useState<string | null>(null);

  const handleCopyCode = () => {
    if (!activeRoomCode) return;
    navigator.clipboard.writeText(activeRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    onJoinFriend(inputCode.trim());
    setInputCode('');
  };

  return (
    <aside className="w-[300px] h-full glass-panel flex flex-col justify-between p-4 select-none shrink-0 z-10 border-r border-white/5">
      <div className="space-y-4 overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyber-cyan to-cyber-purple flex items-center justify-center text-black shadow-lg shadow-cyber-cyan/30">
              <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider text-white uppercase font-mono">
                NEXUS<span className="text-cyber-cyan">VOICE</span>
              </h1>
              <p className="text-[10px] text-cyber-textMuted font-mono">
                {inRoom ? (isHost ? 'Oda Yöneticisi' : 'Katılımcı') : 'Lobi Modu'}
              </p>
            </div>
          </div>
          <span className="flex h-2 w-2 relative" title={connectionStatus}>
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                inRoom ? 'bg-emerald-400' : 'bg-cyber-cyan'
              } opacity-75`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                inRoom ? 'bg-emerald-400' : 'bg-cyber-cyan'
              }`}
            />
          </span>
        </div>

        {/* 1. LOBBY VIEW (When NOT in a room) */}
        {!inRoom ? (
          <div className="space-y-4">
            {/* Create Room Button Card */}
            <div className="glass-panel p-4 rounded-2xl border border-cyber-cyan/30 bg-cyber-cyan/5 space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-xs font-mono font-bold text-white uppercase">Yeni Oda Başlat</h3>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Sen oda sahibi (Host) olursun. Katılımcıları susturabilir veya odadan çıkarabilirsin.
              </p>
              <button
                onClick={onCreateRoom}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-cyber-cyan to-cyber-teal text-black font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyber-cyan/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Oda Oluştur
              </button>
            </div>

            {/* Join Room Form */}
            <form onSubmit={handleJoin} className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
              <label className="text-xs font-mono font-bold text-cyber-textMuted uppercase flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-cyber-teal" /> Arkadaşın Odasına Katıl
              </label>
              <div className="glass-panel p-1.5 rounded-xl flex items-center gap-2 border border-white/10 focus-within:border-cyber-cyan">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Oda Kodu Gir (Örn: 4819)"
                  className="bg-transparent flex-1 text-xs text-white placeholder-gray-500 outline-none px-2 font-mono"
                />
                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="px-3 py-1.5 bg-cyber-cyan text-black font-mono font-bold text-xs rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Katıl
                </button>
              </div>
              <p className="text-[10px] text-gray-500">
                Arkadaşının verdiği 4 haneli kodu yazarak anında odasına bağlan.
              </p>
            </form>
          </div>
        ) : (
          /* 2. IN-ROOM VIEW */
          <div className="space-y-4">
            {/* Active Room Code Card */}
            <div className="glass-panel p-3.5 rounded-2xl border border-cyber-cyan/30 bg-cyber-cyan/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-cyber-cyan uppercase flex items-center gap-1.5 font-bold">
                  {isHost ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-amber-400" /> Oda Kodu (Host)
                    </>
                  ) : (
                    <>
                      <Radio className="w-3.5 h-3.5 text-cyber-teal" /> Oda Kodu
                    </>
                  )}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Canlı
                </span>
              </div>

              <div className="flex items-center justify-between bg-black/50 p-2 rounded-xl border border-white/10 font-mono">
                <span className="text-base font-extrabold tracking-widest text-white px-1">
                  #{activeRoomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-cyber-cyan hover:text-black transition-all text-gray-300"
                  title="Kodu Kopyala"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[10px] text-cyber-textMuted leading-relaxed">
                {isHost
                  ? 'Arkadaşına bu kodu ver. Odaya katıldığında otomatik bağlanacaktır.'
                  : 'Bu odadasın. İstediğin an odadan ayrılabilirsin.'}
              </p>
            </div>

            {/* Connected Friends List & Host Moderation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-cyber-textMuted uppercase px-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyber-teal" /> Odadakiler
                </span>
                <span>{connectedFriends.length} Kişi</span>
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {connectedFriends.length === 0 ? (
                  <div className="text-center py-5 px-2 border border-dashed border-white/10 rounded-2xl space-y-1">
                    <Users className="w-5 h-5 mx-auto text-gray-600" />
                    <p className="text-[11px] text-gray-400">Henüz başka kimse yok</p>
                    <p className="text-[10px] text-gray-500">Arkadaşın #{activeRoomCode} ile katılabilir</p>
                  </div>
                ) : (
                  connectedFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 hover:border-cyber-cyan/30 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative">
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className={`w-7 h-7 rounded-full object-cover transition-all ${
                              friend.isSpeaking
                                ? 'ring-2 ring-cyber-cyan scale-105 shadow-md shadow-cyber-cyan/40'
                                : 'ring-1 ring-white/10'
                            }`}
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-cyber-bg" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-white font-mono truncate max-w-[100px]">
                            {friend.name}
                          </span>
                          {friend.customStatus ? (
                            <span className="text-[8px] text-cyber-purple font-mono truncate max-w-[100px]">
                              {friend.customStatus}
                            </span>
                          ) : (
                            <span className="text-[9px] text-gray-400 font-mono">
                              {friend.isMutedByHost ? (
                                <span className="text-amber-400">Susturuldu</span>
                              ) : friend.isSpeaking ? (
                                <span className="text-cyber-cyan">Konuşuyor</span>
                              ) : (
                                'Bağlı'
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Participant Controls: Volume for everyone, Kick/Mute for Host */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity relative">
                        {/* Individual Volume Button & Popover */}
                        <button
                          onClick={() => setVolumeMenuPeerId(volumeMenuPeerId === friend.id ? null : friend.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            friend.isLocallyMuted
                              ? 'bg-red-500/20 text-red-400 border-red-500/40'
                              : (friend.volume ?? 100) !== 100
                              ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/40 font-bold'
                              : 'hover:bg-white/10 text-gray-400 hover:text-white border-transparent'
                          }`}
                          title={`Ses Düzeyi: %${friend.volume ?? 100}`}
                        >
                          {friend.isLocallyMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Inline Volume Popover */}
                        {volumeMenuPeerId === friend.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 z-30 bg-[#0d1017]/95 backdrop-blur-xl border border-white/15 rounded-xl p-2.5 shadow-2xl min-w-[180px] flex flex-col gap-2 animate-fadeIn"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono text-gray-300">
                              <span className="font-bold flex items-center gap-1">
                                <Volume2 className="w-3 h-3 text-cyber-cyan" /> Ses Düzeyi
                              </span>
                              <span className="text-cyber-cyan font-bold">
                                {friend.isLocallyMuted ? 'Sessiz' : `%${friend.volume ?? 100}`}
                              </span>
                            </div>

                            <input
                              type="range"
                              min="0"
                              max="200"
                              step="5"
                              value={friend.isLocallyMuted ? 0 : (friend.volume ?? 100)}
                              onChange={(e) =>
                                onSetPeerVolume && onSetPeerVolume(friend.id, parseInt(e.target.value))
                              }
                              className="w-full accent-cyber-cyan bg-white/10 cursor-pointer h-1.5 rounded-lg"
                            />

                            <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10 text-[9px] font-mono">
                              <button
                                onClick={() => onSetPeerVolume && onSetPeerVolume(friend.id, 100)}
                                className="text-gray-400 hover:text-white px-1.5 py-0.5 rounded bg-white/5"
                              >
                                %100
                              </button>
                              <button
                                onClick={() => onToggleLocalMutePeer && onToggleLocalMutePeer(friend.id)}
                                className={`px-1.5 py-0.5 rounded font-bold ${
                                  friend.isLocallyMuted
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-white/5 text-gray-300 hover:text-red-400'
                                }`}
                              >
                                {friend.isLocallyMuted ? 'Aç' : 'Sustur'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Host Moderation Controls (Kick & Mute) */}
                        {isHost && (
                          <>
                            <button
                              onClick={() => onRemoteMutePeer(friend.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                friend.isMutedByHost
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                  : 'hover:bg-white/10 text-gray-400 hover:text-white border-transparent'
                              }`}
                              title={friend.isMutedByHost ? 'Susturmayı Kaldır' : 'Oda Genelinde Sustur'}
                            >
                              {friend.isMutedByHost ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onKickPeer(friend.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-colors"
                              title="Odadan Çıkar (Kick)"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* End Room / Leave Room Button */}
            <div className="pt-2">
              <button
                onClick={onLeaveRoom}
                className="w-full py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/10"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                {isHost ? 'Odayı Sonlandır (Kapat)' : 'Odadan Ayrıl'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* System Footer Badge */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-cyber-textMuted font-mono shrink-0">
        {showRamBadge ? (
          <span className="flex items-center gap-1 text-emerald-400">
            <Cpu className="w-3.5 h-3.5" /> {realRamUsageMb ? `${realRamUsageMb.toFixed(1)} MB RAM` : 'RAM İzleniyor'}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-cyber-textMuted">
            <Cpu className="w-3.5 h-3.5" /> Ultra Hafif Mod
          </span>
        )}
        <span className="text-cyber-cyan/80">P2P Encrypted</span>
      </div>
    </aside>
  );
};
