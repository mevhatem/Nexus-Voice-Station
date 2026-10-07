import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { LeftPanel } from './components/LeftPanel';
import { VoiceStage } from './components/VoiceStage';
import { RightChatDrawer } from './components/RightChatDrawer';
import { FloatingControlDock } from './components/FloatingControlDock';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { ScreenShareModal } from './components/ScreenShareModal';
import { VoiceOverlay } from './components/VoiceOverlay';
import { useWebRTCVoice } from './hooks/useWebRTCVoice';
import { Friend, Message } from './types';
import { broadcastOverlayState, getOverlayChannel } from './utils/overlayChannel';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Friend>(() => {
    const saved = localStorage.getItem('nexus_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      id: `me-${Date.now()}`,
      name: '',
      avatar: DEFAULT_AVATAR,
      status: 'online',
    };
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(!currentUser.name);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isScreenShareModalOpen, setIsScreenShareModalOpen] = useState<boolean>(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState<boolean>(() => {
    const saved = localStorage.getItem('nexus_show_overlay');
    return saved !== null ? saved === 'true' : false;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState<boolean>(false);

  // System stats & RAM badge toggle
  const [realRamUsageMb, setRealRamUsageMb] = useState<number>(34.8);
  const [showRamBadge, setShowRamBadge] = useState<boolean>(() => {
    const saved = localStorage.getItem('nexus_show_ram');
    return saved !== null ? saved === 'true' : true;
  });
  const [useInAppOverlayFallback, setUseInAppOverlayFallback] = useState<boolean>(false);

  const handleToggleRamBadge = (val: boolean) => {
    setShowRamBadge(val);
    localStorage.setItem('nexus_show_ram', String(val));
  };

  const handleToggleVoiceOverlay = async (val: boolean) => {
    setShowVoiceOverlay(val);
    localStorage.setItem('nexus_show_overlay', String(val));
    try {
      const hasWindow = await invoke<boolean>('set_overlay_visible', { visible: val });
      if (!hasWindow) {
        setUseInAppOverlayFallback(val);
      } else {
        setUseInAppOverlayFallback(false);
      }
    } catch {
      setUseInAppOverlayFallback(val);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats: any = await invoke('get_system_stats');
        if (stats && typeof stats.ram_usage_mb === 'number') {
          setRealRamUsageMb(stats.ram_usage_mb);
        }
      } catch {
        // Fallback for standalone browser testing
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleReceiveMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
    if (!isChatOpen) {
      setHasUnreadMessages(true);
    }
  };

  // Real WebRTC P2P Voice, Room Lifecycle, PTT, Individual Volume & Chat
  const {
    inRoom,
    isHost,
    activeRoomCode,
    connectedPeers,
    isMuted,
    isDeafened,
    isSpeaking,
    audioLevel,
    connectionStatus,
    roomNotification,
    clearRoomNotification,
    createRoom,
    joinFriendRoom,
    leaveOrEndRoom,
    kickPeer,
    remoteMutePeer,
    sendChatMessage,
    toggleMute,
    toggleDeafen,
    // Push-to-Talk
    voiceInputMode,
    setVoiceInputMode,
    pttKeyConfig,
    setPttKeyConfig,
    isPttPressed,
    // Per-peer volume & local mute
    setPeerVolume,
    toggleLocalMutePeer,
    broadcastProfileUpdate,
    // Audio devices & filters
    inputDevices,
    outputDevices,
    selectedInputId,
    selectedOutputId,
    setSelectedInputId,
    changeOutputDevice,
    echoCancellation,
    setEchoCancellation,
    noiseSuppression,
    setNoiseSuppression,
    autoGainControl,
    setAutoGainControl,
    vadThreshold,
    setVadThreshold,
    // Screen share
    screenShareInfo,
    startScreenShare,
    stopScreenShare,
  } = useWebRTCVoice({
    currentUser,
    onReceiveMessage: handleReceiveMessage,
  });

  const handleSaveProfile = (newProfile: Friend) => {
    setCurrentUser(newProfile);
    localStorage.setItem('nexus_user_profile', JSON.stringify(newProfile));
    broadcastProfileUpdate(newProfile);
    setIsProfileModalOpen(false);
  };

  const handleSendMessage = (text: string, imageUrl?: string) => {
    const msg = sendChatMessage(text, imageUrl);
    if (msg) {
      setMessages((prev) => [...prev, msg]);
    }
  };

  const handleToggleChat = () => {
    setIsChatOpen((prev) => !prev);
    if (!isChatOpen) {
      setHasUnreadMessages(false);
    }
  };

  // Broadcast WebRTC & room state to desktop overlay window
  useEffect(() => {
    broadcastOverlayState({
      inRoom,
      activeRoomCode: activeRoomCode ?? '',
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        isMuted,
        isSpeaking,
        customStatus: currentUser.customStatus,
        isLocal: true,
      },
      participants: connectedPeers.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isSpeaking: p.isSpeaking,
        isMuted: p.isMuted,
        customStatus: p.customStatus,
        volume: p.volume,
        isLocallyMuted: p.isLocallyMuted,
        isLocal: false,
      })),
      audioLevel,
      voiceInputMode,
      isPttActive: isPttPressed,
      pttKeyLabel: pttKeyConfig.label,
    });
  }, [
    inRoom,
    activeRoomCode,
    currentUser,
    connectedPeers,
    isMuted,
    isSpeaking,
    audioLevel,
    voiceInputMode,
    isPttPressed,
    pttKeyConfig,
  ]);

  // Listen for commands from the desktop overlay window
  useEffect(() => {
    const channel = getOverlayChannel();
    const handleCommand = (e: MessageEvent) => {
      const data = e.data;
      if (data?.type === 'CMD_TOGGLE_MUTE') {
        toggleMute();
      } else if (data?.type === 'CMD_CLOSE') {
        handleToggleVoiceOverlay(false);
      } else if (data?.type === 'CMD_REQUEST_SYNC') {
        broadcastOverlayState({
          inRoom,
          activeRoomCode: activeRoomCode ?? '',
          currentUser: {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            isMuted,
            isSpeaking,
            customStatus: currentUser.customStatus,
            isLocal: true,
          },
          participants: connectedPeers.map((p) => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            isSpeaking: p.isSpeaking,
            isMuted: p.isMuted,
            customStatus: p.customStatus,
            volume: p.volume,
            isLocallyMuted: p.isLocallyMuted,
            isLocal: false,
          })),
          audioLevel,
          voiceInputMode,
          isPttActive: isPttPressed,
          pttKeyLabel: pttKeyConfig.label,
        });
      }
    };
    channel.addEventListener('message', handleCommand);
    return () => channel.removeEventListener('message', handleCommand);
  }, [
    toggleMute,
    inRoom,
    activeRoomCode,
    currentUser,
    connectedPeers,
    isMuted,
    isSpeaking,
    audioLevel,
    voiceInputMode,
    isPttPressed,
    pttKeyConfig,
  ]);

  return (
    <div className="flex h-screen w-screen bg-[#050608] text-cyber-textLight overflow-hidden font-sans relative select-none">
      {/* Subtle Background Glow Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyber-cyan/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyber-purple/15 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. Left Panel (Lobby / Active Room & Moderation & Per-User Volume) */}
      <LeftPanel
        inRoom={inRoom}
        isHost={isHost}
        activeRoomCode={activeRoomCode}
        connectedFriends={connectedPeers}
        onCreateRoom={createRoom}
        onJoinFriend={joinFriendRoom}
        onLeaveRoom={leaveOrEndRoom}
        onKickPeer={kickPeer}
        onRemoteMutePeer={remoteMutePeer}
        onSetPeerVolume={setPeerVolume}
        onToggleLocalMutePeer={toggleLocalMutePeer}
        connectionStatus={connectionStatus}
        showRamBadge={showRamBadge}
        realRamUsageMb={realRamUsageMb}
      />

      {/* 2. Main Central Voice / Lobby Stage */}
      <VoiceStage
        inRoom={inRoom}
        isHost={isHost}
        currentUser={currentUser}
        participants={connectedPeers}
        isMuted={isMuted}
        isDeafened={isDeafened}
        isSpeaking={isSpeaking}
        audioLevel={audioLevel}
        activeRoomCode={activeRoomCode}
        realRamUsageMb={realRamUsageMb}
        showRamBadge={showRamBadge}
        screenShareInfo={screenShareInfo}
        voiceInputMode={voiceInputMode}
        isPttPressed={isPttPressed}
        pttKeyLabel={pttKeyConfig.label}
        onSetPeerVolume={setPeerVolume}
        onToggleLocalMutePeer={toggleLocalMutePeer}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        showVoiceOverlay={showVoiceOverlay}
        onToggleVoiceOverlay={handleToggleVoiceOverlay}
        onStopScreenShare={stopScreenShare}
        onCreateRoom={createRoom}
        onJoinFriend={joinFriendRoom}
        onLeaveRoom={leaveOrEndRoom}
        roomNotification={roomNotification}
        onClearNotification={clearRoomNotification}
      />

      {/* 3. Right Collapsible Mini Chat Drawer */}
      <RightChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        currentUser={currentUser}
        onSendMessage={handleSendMessage}
      />

      {/* 4. Floating Glass Control Pill (Bottom Dock) */}
      <FloatingControlDock
        currentUser={currentUser}
        isMuted={isMuted}
        isDeafened={isDeafened}
        isSpeaking={isSpeaking}
        audioLevel={audioLevel}
        isChatOpen={isChatOpen}
        hasUnreadMessages={hasUnreadMessages}
        isScreenSharing={screenShareInfo.isSharing && screenShareInfo.sharerId === currentUser.id}
        voiceInputMode={voiceInputMode}
        isPttPressed={isPttPressed}
        pttKeyLabel={pttKeyConfig.label}
        showVoiceOverlay={showVoiceOverlay}
        onToggleVoiceOverlay={() => handleToggleVoiceOverlay(!showVoiceOverlay)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onToggleMute={toggleMute}
        onToggleDeafen={toggleDeafen}
        onToggleChat={handleToggleChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenScreenShare={() => {
          if (screenShareInfo.isSharing && screenShareInfo.sharerId === currentUser.id) {
            stopScreenShare();
          } else {
            setIsScreenShareModalOpen(true);
          }
        }}
        onLeaveVoice={inRoom ? leaveOrEndRoom : undefined}
      />

      {/* 5. Desktop Voice Overlay (In-App Fallback) */}
      <VoiceOverlay
        inRoom={inRoom}
        activeRoomCode={activeRoomCode}
        currentUser={currentUser}
        participants={connectedPeers}
        isMuted={isMuted}
        isSpeaking={isSpeaking}
        audioLevel={audioLevel}
        isOpen={showVoiceOverlay && useInAppOverlayFallback}
        onClose={() => handleToggleVoiceOverlay(false)}
      />

      {/* 6. Profile Setup / Edit Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        initialProfile={currentUser.name ? currentUser : null}
        onSave={handleSaveProfile}
        onClose={() => setIsProfileModalOpen(false)}
        isEditing={Boolean(currentUser.name)}
      />

      {/* 7. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        inputDevices={inputDevices}
        outputDevices={outputDevices}
        selectedInputId={selectedInputId}
        selectedOutputId={selectedOutputId}
        onSelectInputDevice={setSelectedInputId}
        onSelectOutputDevice={changeOutputDevice}
        echoCancellation={echoCancellation}
        noiseSuppression={noiseSuppression}
        autoGainControl={autoGainControl}
        onToggleEcho={setEchoCancellation}
        onToggleNoise={setNoiseSuppression}
        onToggleGain={setAutoGainControl}
        voiceInputMode={voiceInputMode}
        onVoiceInputModeChange={setVoiceInputMode}
        pttKeyConfig={pttKeyConfig}
        onPttKeyChange={setPttKeyConfig}
        vadSensitivity={vadThreshold}
        onSensitivityChange={setVadThreshold}
        audioLevel={audioLevel}
        isSpeaking={isSpeaking}
        showVoiceOverlay={showVoiceOverlay}
        onToggleVoiceOverlay={handleToggleVoiceOverlay}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        realRamUsageMb={realRamUsageMb}
        showRamBadge={showRamBadge}
        onToggleRamBadge={handleToggleRamBadge}
      />

      {/* 8. Screen Share Quality & Resolution Modal */}
      <ScreenShareModal
        isOpen={isScreenShareModalOpen}
        onClose={() => setIsScreenShareModalOpen(false)}
        onStartShare={startScreenShare}
      />
    </div>
  );
}
