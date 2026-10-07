import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { MediaConnection, DataConnection } from 'peerjs';
import {
  Friend,
  Message,
  ScreenQuality,
  ScreenFps,
  ScreenShareOptions,
  ScreenShareInfo,
  VoiceInputMode,
  PttKeyConfig,
} from '../types';

interface UseWebRTCVoiceProps {
  currentUser: Friend;
  onReceiveMessage?: (msg: Message) => void;
}

export interface AudioDevice {
  deviceId: string;
  label: string;
}

export function useWebRTCVoice({ currentUser, onReceiveMessage }: UseWebRTCVoiceProps) {
  // Room state
  const [inRoom, setInRoom] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [activeRoomCode, setActiveRoomCode] = useState<string>('');
  const [connectedPeers, setConnectedPeers] = useState<Friend[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Lobide (Boşta)');
  const [roomNotification, setRoomNotification] = useState<string | null>(null);

  // Audio controls
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDeafened, setIsDeafened] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Push-to-Talk (PTT) & Voice Input Mode
  const [voiceInputMode, setVoiceInputMode] = useState<VoiceInputMode>(() => {
    return (localStorage.getItem('nexus_voice_input_mode') as VoiceInputMode) || 'vad';
  });
  const [pttKeyConfig, setPttKeyConfig] = useState<PttKeyConfig>(() => {
    const saved = localStorage.getItem('nexus_ptt_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return { code: 'Space', label: 'Boşluk (Space)' };
  });
  const [isPttPressed, setIsPttPressed] = useState<boolean>(false);
  const isPttPressedRef = useRef<boolean>(false);
  const voiceInputModeRef = useRef<VoiceInputMode>(voiceInputMode);
  const pttKeyConfigRef = useRef<PttKeyConfig>(pttKeyConfig);

  // Individual Peer Volume (0-200%) & Local Mute
  const [peerVolumes, setPeerVolumes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('nexus_peer_volumes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });
  const [peerLocalMutes, setPeerLocalMutes] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('nexus_peer_mutes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map());

  // Screen sharing state
  const [screenShareInfo, setScreenShareInfo] = useState<ScreenShareInfo>({
    isSharing: false,
    sharerId: null,
    sharerName: null,
    resolution: '1080p',
    fps: 60,
    stream: null,
  });
  const localScreenStreamRef = useRef<MediaStream | null>(null);
  const screenCallsRef = useRef<Map<string, MediaConnection>>(new Map());

  // Device lists & Fine-tuning
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string>('default');
  const [selectedOutputId, setSelectedOutputId] = useState<string>('default');

  const [echoCancellation, setEchoCancellation] = useState<boolean>(true);
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true);
  const [autoGainControl, setAutoGainControl] = useState<boolean>(true);
  const [vadThreshold, setVadThreshold] = useState<number>(15);

  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callsRef = useRef<Map<string, MediaConnection>>(new Map());
  const dataConnsRef = useRef<Map<string, DataConnection>>(new Map());
  const remoteAudioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const isDeafenedRef = useRef<boolean>(false);

  // Audio Context & Analyser
  const audioContextRef = useRef<AudioContext | null>(null);
  const localAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Enumerate devices
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, idx) => ({ deviceId: d.deviceId, label: d.label || `Mikrofon ${idx + 1}` }));
      const outputs = devices
        .filter((d) => d.kind === 'audiooutput')
        .map((d, idx) => ({ deviceId: d.deviceId, label: d.label || `Hoparlör / Kulaklık ${idx + 1}` }));

      setInputDevices(inputs);
      setOutputDevices(outputs);
    } catch (e) {
      console.warn("Aygıt listesi alınamadı:", e);
    }
  }, []);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  useEffect(() => {
    isDeafenedRef.current = isDeafened;
    remoteAudioElementsRef.current.forEach((audio) => {
      audio.muted = isDeafened;
    });
  }, [isDeafened]);

  // Voice input mode & PTT sync
  useEffect(() => {
    voiceInputModeRef.current = voiceInputMode;
    localStorage.setItem('nexus_voice_input_mode', voiceInputMode);

    if (localStreamRef.current) {
      if (voiceInputMode === 'vad') {
        localStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = !isMuted;
        });
      } else {
        localStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = isPttPressedRef.current && !isMuted;
        });
      }
    }
  }, [voiceInputMode, isMuted]);

  useEffect(() => {
    pttKeyConfigRef.current = pttKeyConfig;
    localStorage.setItem('nexus_ptt_config', JSON.stringify(pttKeyConfig));
  }, [pttKeyConfig]);

  // Window key listener for Push-to-Talk (Bas-Konuş)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (voiceInputModeRef.current !== 'ptt') return;
      if (e.code !== pttKeyConfigRef.current.code) return;

      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        const isModifier = ['Control', 'Alt', 'Shift', 'CapsLock', 'Meta'].some((k) => e.code.includes(k)) || e.code.startsWith('F');
        if (!isModifier) return;
      }

      if (e.repeat) return;

      isPttPressedRef.current = true;
      setIsPttPressed(true);

      if (localStreamRef.current && !isMuted) {
        localStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = true;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (voiceInputModeRef.current !== 'ptt') return;
      if (e.code !== pttKeyConfigRef.current.code) return;

      isPttPressedRef.current = false;
      setIsPttPressed(false);

      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = false;
        });
      }
    };

    const handleBlur = () => {
      if (voiceInputModeRef.current === 'ptt' && isPttPressedRef.current) {
        isPttPressedRef.current = false;
        setIsPttPressed(false);
        if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach((t) => {
            t.enabled = false;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isMuted]);

  // Set Output Audio Sink Id if supported
  const changeOutputDevice = async (deviceId: string) => {
    setSelectedOutputId(deviceId);
    remoteAudioElementsRef.current.forEach(async (audio) => {
      if ('setSinkId' in audio) {
        try {
          await (audio as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> }).setSinkId(deviceId);
        } catch (e) {
          console.warn("Hoparlör aygıtı değiştirilemedi:", e);
        }
      }
    });
  };

  // Set peer volume (0 to 200%)
  const setPeerVolume = (peerId: string, volume: number) => {
    setPeerVolumes((prev) => {
      const updated = { ...prev, [peerId]: volume };
      localStorage.setItem('nexus_peer_volumes', JSON.stringify(updated));
      return updated;
    });

    const isLocallyMuted = peerLocalMutes[peerId] || false;
    const audio = remoteAudioElementsRef.current.get(peerId);
    if (audio) {
      audio.volume = isLocallyMuted ? 0 : Math.min(1.0, volume / 100);
      audio.muted = isLocallyMuted || isDeafenedRef.current;
    }
    const gainNode = gainNodesRef.current.get(peerId);
    if (gainNode) {
      gainNode.gain.value = isLocallyMuted ? 0 : volume / 100;
    }
  };

  // Toggle local mute for a specific peer
  const toggleLocalMutePeer = (peerId: string) => {
    setPeerLocalMutes((prev) => {
      const nextMuted = !prev[peerId];
      const updated = { ...prev, [peerId]: nextMuted };
      localStorage.setItem('nexus_peer_mutes', JSON.stringify(updated));

      const vol = peerVolumes[peerId] ?? 100;
      const audio = remoteAudioElementsRef.current.get(peerId);
      if (audio) {
        audio.muted = nextMuted || isDeafenedRef.current;
        audio.volume = nextMuted ? 0 : Math.min(1.0, vol / 100);
      }
      const gainNode = gainNodesRef.current.get(peerId);
      if (gainNode) {
        gainNode.gain.value = nextMuted ? 0 : vol / 100;
      }
      return updated;
    });
  };

  // Initialize or Re-initialize Local Audio Stream
  const initLocalAudio = useCallback(async () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: selectedInputId !== 'default' ? { exact: selectedInputId } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      // In PTT mode, start muted unless PTT key is held
      if (voiceInputModeRef.current === 'ptt') {
        stream.getAudioTracks().forEach((t) => {
          t.enabled = isPttPressedRef.current && !isMuted;
        });
      }

      // Update active calls with new stream audio track
      callsRef.current.forEach((call) => {
        const senders = call.peerConnection?.getSenders();
        const audioTrack = stream.getAudioTracks()[0];
        if (senders && audioTrack) {
          const audioSender = senders.find((s) => s.track?.kind === 'audio');
          if (audioSender) {
            audioSender.replaceTrack(audioTrack);
          }
        }
      });

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }
      const audioCtx = audioContextRef.current;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      localAnalyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Start local VAD / PTT analyzer loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      const checkVoice = () => {
        if (localAnalyserRef.current && !isMuted) {
          localAnalyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const level = Math.min(100, Math.round((avg / 128) * 100));
          setAudioLevel(level);

          if (voiceInputModeRef.current === 'ptt') {
            setIsSpeaking(isPttPressedRef.current && level > 5);
          } else {
            setIsSpeaking(level > vadThreshold);
          }
        } else {
          setAudioLevel(0);
          setIsSpeaking(false);
        }
        animationFrameRef.current = requestAnimationFrame(checkVoice);
      };
      checkVoice();

      refreshDevices();
      return stream;
    } catch (err) {
      console.warn("Mikrofon erişimi alınamadı:", err);
      return null;
    }
  }, [selectedInputId, echoCancellation, noiseSuppression, autoGainControl, vadThreshold, isMuted, refreshDevices]);

  // Handle incoming remote audio stream
  const handleIncomingStream = (peerId: string, remoteStream: MediaStream) => {
    let audio = remoteAudioElementsRef.current.get(peerId);
    if (!audio) {
      audio = new Audio();
      audio.autoplay = true;
      audio.muted = isDeafenedRef.current;
      remoteAudioElementsRef.current.set(peerId, audio);
    }
    audio.srcObject = remoteStream;

    // Apply saved peer volume and local mute
    const isLocallyMuted = peerLocalMutes[peerId] || false;
    const vol = peerVolumes[peerId] ?? 100;
    audio.volume = isLocallyMuted ? 0 : Math.min(1.0, vol / 100);
    audio.muted = isLocallyMuted || isDeafenedRef.current;

    if (selectedOutputId !== 'default' && 'setSinkId' in audio) {
      (audio as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> }).setSinkId(selectedOutputId).catch(() => {});
    }

    if (audioContextRef.current) {
      try {
        const friendAnalyser = audioContextRef.current.createAnalyser();
        friendAnalyser.fftSize = 256;
        const source = audioContextRef.current.createMediaStreamSource(remoteStream);
        source.connect(friendAnalyser);

        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = isLocallyMuted ? 0 : vol / 100;
        gainNodesRef.current.set(peerId, gainNode);

        const dataArr = new Uint8Array(friendAnalyser.frequencyBinCount);
        const pollFriendVad = () => {
          friendAnalyser.getByteFrequencyData(dataArr);
          let sum = 0;
          for (let i = 0; i < dataArr.length; i++) sum += dataArr[i];
          const speaking = (sum / dataArr.length) > 20;

          setConnectedPeers((prev) =>
            prev.map((p) => (p.id === peerId ? { ...p, isSpeaking: speaking } : p))
          );
          requestAnimationFrame(pollFriendVad);
        };
        pollFriendVad();
      } catch (e) {
        console.warn("Friend VAD monitor error:", e);
      }
    }
  };

  // Clean-up all calls, connections and reset to lobby
  const leaveOrEndRoom = useCallback(() => {
    if (isHost) {
      // Broadcast room closure to all participants
      dataConnsRef.current.forEach((conn) => {
        if (conn.open) {
          conn.send({ type: 'room_closed' });
        }
      });
    } else {
      // Notify host that we left
      dataConnsRef.current.forEach((conn) => {
        if (conn.open) {
          conn.send({ type: 'user_left' });
        }
      });
    }

    // Stop local screen sharing
    if (localScreenStreamRef.current) {
      localScreenStreamRef.current.getTracks().forEach((t) => t.stop());
      localScreenStreamRef.current = null;
    }
    screenCallsRef.current.forEach((sc) => sc.close());
    screenCallsRef.current.clear();
    setScreenShareInfo({
      isSharing: false,
      sharerId: null,
      sharerName: null,
      resolution: '1080p',
      fps: 60,
      stream: null,
    });

    // Close all voice calls
    callsRef.current.forEach((call) => call.close());
    callsRef.current.clear();

    // Close data connections
    dataConnsRef.current.forEach((conn) => conn.close());
    dataConnsRef.current.clear();

    // Destroy peer
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setInRoom(false);
    setIsHost(false);
    setActiveRoomCode('');
    setConnectedPeers([]);
    setIsConnected(false);
    setConnectionStatus('Lobide (Boşta)');
  }, [isHost]);

  // Setup data connection
  const setupDataConnection = useCallback((conn: DataConnection) => {
    dataConnsRef.current.set(conn.peer, conn);

    conn.on('open', () => {
      conn.send({
        type: 'profile_handshake',
        user: { ...currentUser, isHost },
      });

      if (localScreenStreamRef.current && peerRef.current) {
        const sc = peerRef.current.call(conn.peer, localScreenStreamRef.current, {
          metadata: {
            type: 'screen-share',
            resolution: screenShareInfo.resolution,
            fps: screenShareInfo.fps,
            sharerId: currentUser.id,
            sharerName: currentUser.name,
          },
        });
        screenCallsRef.current.set(conn.peer, sc);
      }
    });

    conn.on('data', (data: unknown) => {
      const payload = data as {
        type: string;
        user?: Friend;
        message?: Message;
        targetId?: string;
        sharerId?: string;
        sharerName?: string;
        resolution?: ScreenQuality;
        fps?: ScreenFps;
      };

      if (payload.type === 'profile_handshake' && payload.user) {
        setConnectedPeers((prev) => {
          const exists = prev.find((p) => p.id === conn.peer);
          if (exists) {
            return prev.map((p) => (p.id === conn.peer ? { ...p, ...payload.user!, id: conn.peer } : p));
          }
          return [...prev, { ...payload.user!, id: conn.peer }];
        });
      } else if (payload.type === 'profile_update' && payload.user) {
        setConnectedPeers((prev) =>
          prev.map((p) => (p.id === conn.peer ? { ...p, ...payload.user!, id: conn.peer } : p))
        );
      } else if (payload.type === 'room_closed') {
        leaveOrEndRoom();
        setRoomNotification('Oda yöneticisi odayı kapattı.');
      } else if (payload.type === 'kicked') {
        leaveOrEndRoom();
        setRoomNotification('Oda yöneticisi tarafından odadan çıkarıldınız.');
      } else if (payload.type === 'force_mute') {
        if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
        }
        setIsMuted(true);
        setRoomNotification('Oda yöneticisi mikrofonunuzu kapattı.');
      } else if (payload.type === 'user_left') {
        setConnectedPeers((prev) => prev.filter((p) => p.id !== conn.peer));
        callsRef.current.delete(conn.peer);
        dataConnsRef.current.delete(conn.peer);
        screenCallsRef.current.delete(conn.peer);
      } else if (payload.type === 'screen_share_stopped') {
        setScreenShareInfo({
          isSharing: false,
          sharerId: null,
          sharerName: null,
          resolution: '1080p',
          fps: 60,
          stream: null,
        });
      } else if (payload.type === 'chat_message' && payload.message) {
        if (onReceiveMessage) {
          onReceiveMessage(payload.message);
        }
      }
    });

    conn.on('close', () => {
      setConnectedPeers((prev) => prev.filter((p) => p.id !== conn.peer));
      callsRef.current.delete(conn.peer);
      dataConnsRef.current.delete(conn.peer);
      screenCallsRef.current.delete(conn.peer);
      setScreenShareInfo((prev) => {
        if (prev.sharerId === conn.peer) {
          return {
            isSharing: false,
            sharerId: null,
            sharerName: null,
            resolution: '1080p',
            fps: 60,
            stream: null,
          };
        }
        return prev;
      });
    });
  }, [currentUser, isHost, leaveOrEndRoom, onReceiveMessage, screenShareInfo.fps, screenShareInfo.resolution]);

  // Attach generic peer listeners
  const attachPeerListeners = useCallback((peer: Peer) => {
    peer.on('call', (call) => {
      const metadata = call.metadata as {
        type?: string;
        resolution?: ScreenQuality;
        fps?: ScreenFps;
        sharerId?: string;
        sharerName?: string;
      } | undefined;

      if (metadata?.type === 'screen-share') {
        call.answer();
        call.on('stream', (remoteStream) => {
          setScreenShareInfo({
            isSharing: true,
            sharerId: metadata.sharerId || call.peer,
            sharerName: metadata.sharerName || 'Arkadaşın',
            resolution: metadata.resolution || '1080p',
            fps: metadata.fps || 60,
            stream: remoteStream,
          });
        });
        call.on('close', () => {
          setScreenShareInfo((prev) => {
            if (prev.sharerId === (metadata.sharerId || call.peer)) {
              return {
                isSharing: false,
                sharerId: null,
                sharerName: null,
                resolution: '1080p',
                fps: 60,
                stream: null,
              };
            }
            return prev;
          });
        });
        return;
      }

      if (localStreamRef.current) {
        call.answer(localStreamRef.current);
      }

      call.on('stream', (remoteStream) => {
        handleIncomingStream(call.peer, remoteStream);
      });

      callsRef.current.set(call.peer, call);
    });

    peer.on('connection', (conn) => {
      setupDataConnection(conn);
    });
  }, [setupDataConnection]);

  // Create room on-demand (becomes Host)
  const createRoom = async () => {
    setConnectionStatus('Oda oluşturuluyor...');
    setRoomNotification(null);
    await initLocalAudio();

    if (peerRef.current) {
      peerRef.current.destroy();
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const hostPeerId = `nexus-${code}`;
    const peer = new Peer(hostPeerId, { debug: 1 });
    peerRef.current = peer;

    peer.on('open', (id) => {
      setMyPeerId(id);
      setActiveRoomCode(code);
      setIsHost(true);
      setInRoom(true);
      setIsConnected(true);
      setConnectionStatus(`Oda #${code} Açık (Host)`);
    });

    peer.on('error', (err) => {
      console.warn('Peer error:', err);
      setConnectionStatus('Bağlantı hatası, tekrar deneyin.');
    });

    attachPeerListeners(peer);
    return code;
  };

  // Join room on-demand (becomes Guest)
  const joinFriendRoom = async (code: string) => {
    const cleanCode = code.replace('#', '').trim();
    if (!cleanCode) return false;

    setConnectionStatus(`Odaya bağlanılıyor: #${cleanCode}...`);
    setRoomNotification(null);
    await initLocalAudio();

    if (peerRef.current) {
      peerRef.current.destroy();
    }

    const guestSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const guestPeerId = `nexus-g-${guestSuffix}`;
    const peer = new Peer(guestPeerId, { debug: 1 });
    peerRef.current = peer;

    peer.on('open', (myId) => {
      setMyPeerId(myId);
      setActiveRoomCode(cleanCode);
      setIsHost(false);
      setInRoom(true);
      setIsConnected(true);
      setConnectionStatus(`Odaya Bağlandı: #${cleanCode}`);

      const targetHost = `nexus-${cleanCode}`;
      const conn = peer.connect(targetHost);
      setupDataConnection(conn);

      if (localStreamRef.current) {
        const call = peer.call(targetHost, localStreamRef.current);
        call.on('stream', (remoteStream) => {
          handleIncomingStream(targetHost, remoteStream);
        });
        callsRef.current.set(targetHost, call);
      }
    });

    peer.on('error', (err) => {
      console.warn('Odaya katılma hatası:', err);
      setConnectionStatus('Odaya bağlanılamadı. Kodun doğruluğunu kontrol edin.');
    });

    attachPeerListeners(peer);
    return true;
  };

  // Host: Kick a participant
  const kickPeer = (peerId: string) => {
    if (!isHost) return;
    const conn = dataConnsRef.current.get(peerId);
    if (conn && conn.open) {
      conn.send({ type: 'kicked' });
    }
    const call = callsRef.current.get(peerId);
    if (call) call.close();
    callsRef.current.delete(peerId);

    const screenCall = screenCallsRef.current.get(peerId);
    if (screenCall) screenCall.close();
    screenCallsRef.current.delete(peerId);

    if (conn) conn.close();
    dataConnsRef.current.delete(peerId);

    setConnectedPeers((prev) => prev.filter((p) => p.id !== peerId));
  };

  // Host: Remote mute a participant
  const remoteMutePeer = (peerId: string) => {
    if (!isHost) return;
    const conn = dataConnsRef.current.get(peerId);
    if (conn && conn.open) {
      conn.send({ type: 'force_mute' });
    }
    setConnectedPeers((prev) =>
      prev.map((p) => (p.id === peerId ? { ...p, isMutedByHost: !p.isMutedByHost } : p))
    );
  };

  // Global clean-up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (peerRef.current) peerRef.current.destroy();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (localScreenStreamRef.current) {
        localScreenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const sendChatMessage = (content: string, imageUrl?: string) => {
    const msg: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      imageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    dataConnsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send({
          type: 'chat_message',
          message: msg,
        });
      }
    });

    return msg;
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  };

  const toggleDeafen = () => {
    setIsDeafened((prev) => !prev);
  };

  // Screen share methods
  const startScreenShare = async (options: ScreenShareOptions) => {
    try {
      const videoConstraints: MediaTrackConstraints = {
        frameRate: { ideal: options.fps, max: options.fps },
      };
      if (options.resolution === '720p') {
        videoConstraints.width = { ideal: 1280, max: 1280 };
        videoConstraints.height = { ideal: 720, max: 720 };
      } else if (options.resolution === '1080p') {
        videoConstraints.width = { ideal: 1920, max: 1920 };
        videoConstraints.height = { ideal: 1080, max: 1080 };
      } else {
        videoConstraints.width = { max: 1920 };
        videoConstraints.height = { max: 1080 };
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: videoConstraints,
        audio: options.includeAudio,
      });

      localScreenStreamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        // Crucial: 'detail' hint drastically cuts CPU usage for static screens & text
        videoTrack.contentHint = 'detail';
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      const newInfo: ScreenShareInfo = {
        isSharing: true,
        sharerId: currentUser.id,
        sharerName: currentUser.name,
        resolution: options.resolution,
        fps: options.fps,
        stream,
      };
      setScreenShareInfo(newInfo);

      dataConnsRef.current.forEach((_conn, peerId) => {
        if (peerRef.current) {
          const sc = peerRef.current.call(peerId, stream, {
            metadata: {
              type: 'screen-share',
              resolution: options.resolution,
              fps: options.fps,
              sharerId: currentUser.id,
              sharerName: currentUser.name,
            },
          });

          // Cap bitrate on the WebRTC sender to avoid CPU encoder lockup
          try {
            const pc = (sc as any).peerConnection as RTCPeerConnection | undefined;
            if (pc) {
              const senders = pc.getSenders?.() || [];
              senders.forEach((sender) => {
                if (sender.track?.kind === 'video') {
                  const params = sender.getParameters();
                  if (!params.encodings || params.encodings.length === 0) {
                    params.encodings = [{}];
                  }
                  params.encodings[0].maxBitrate = options.resolution === '720p' ? 2200000 : 4000000;
                  sender.setParameters(params).catch(() => {});
                }
              });
            }
          } catch {}

          screenCallsRef.current.set(peerId, sc);
        }
      });

      return true;
    } catch (err) {
      console.warn("Ekran paylaşımı başlatılamadı:", err);
      return false;
    }
  };

  const stopScreenShare = () => {
    if (localScreenStreamRef.current) {
      localScreenStreamRef.current.getTracks().forEach((t) => t.stop());
      localScreenStreamRef.current = null;
    }

    screenCallsRef.current.forEach((sc) => sc.close());
    screenCallsRef.current.clear();

    dataConnsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send({ type: 'screen_share_stopped' });
      }
    });

    setScreenShareInfo({
      isSharing: false,
      sharerId: null,
      sharerName: null,
      resolution: '1080p',
      fps: 60,
      stream: null,
    });
  };

  // Broadcast updated profile info to all peers
  const broadcastProfileUpdate = useCallback((updatedUser: Friend) => {
    dataConnsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send({
          type: 'profile_update',
          user: updatedUser,
        });
      }
    });
  }, []);

  // Enriched peers with their individual volume and local mute states
  const enrichedConnectedPeers = connectedPeers.map((p) => ({
    ...p,
    volume: peerVolumes[p.id] ?? 100,
    isLocallyMuted: !!peerLocalMutes[p.id],
  }));

  return {
    inRoom,
    isHost,
    myPeerId,
    activeRoomCode,
    connectedPeers: enrichedConnectedPeers,
    isConnected,
    isMuted,
    isDeafened,
    isSpeaking,
    audioLevel,
    connectionStatus,
    roomNotification,
    clearRoomNotification: () => setRoomNotification(null),
    createRoom,
    joinFriendRoom,
    leaveOrEndRoom,
    kickPeer,
    remoteMutePeer,
    sendChatMessage,
    toggleMute,
    toggleDeafen,
    // Push-to-Talk (Bas-Konuş) & Voice Input Mode
    voiceInputMode,
    setVoiceInputMode,
    pttKeyConfig,
    setPttKeyConfig,
    isPttPressed,
    // Per-peer Individual Volume & Local Mute
    peerVolumes,
    peerLocalMutes,
    setPeerVolume,
    toggleLocalMutePeer,
    // Broadcast updated profile
    broadcastProfileUpdate,
    // Screen sharing
    screenShareInfo,
    startScreenShare,
    stopScreenShare,
    // Device settings
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
    reinitAudio: initLocalAudio,
  };
}
