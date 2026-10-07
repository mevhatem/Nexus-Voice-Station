import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceVADProps {
  initialSensitivity?: number; // Volume threshold 0.01 - 0.1
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export function useVoiceVAD({ initialSensitivity = 0.035, onSpeakingChange }: UseVoiceVADProps = {}) {
  const [isMicConnected, setIsMicConnected] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDeafened, setIsDeafened] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0); // 0 to 100
  const [sensitivity, setSensitivity] = useState<number>(initialSensitivity);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(isMuted);

  // Sync ref with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Start microphone monitoring
  const startAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceNodeRef.current = source;

      setIsMicConnected(true);
      setPermissionError(null);

      // Start VAD Loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const analyzeFrame = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average amplitude
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalizedLevel = Math.min(100, Math.round((average / 128) * 100));

        setAudioLevel(normalizedLevel);

        // Check against threshold if not muted
        const speakingNow = !isMutedRef.current && (average / 255) > sensitivity;

        if (speakingNow !== isSpeakingRef.current) {
          isSpeakingRef.current = speakingNow;
          setIsSpeaking(speakingNow);
          if (onSpeakingChange) {
            onSpeakingChange(speakingNow);
          }
        }

        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
      };

      analyzeFrame();
    } catch (err: unknown) {
      console.warn("Mikrofon erişim hatası veya izin verilmedi:", err);
      const message = err instanceof Error ? err.message : 'Mikrofon izni alınamadı';
      setPermissionError(message);
      setIsMicConnected(false);
    }
  }, [sensitivity, onSpeakingChange]);

  const stopAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsMicConnected(false);
    setIsSpeaking(false);
    setAudioLevel(0);
  }, []);

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach(track => {
          track.enabled = !next;
        });
      }
      return next;
    });
  };

  const toggleDeafen = () => {
    setIsDeafened(prev => {
      const next = !prev;
      if (next && !isMuted) {
        toggleMute();
      }
      return next;
    });
  };

  useEffect(() => {
    startAudio();
    return () => {
      stopAudio();
    };
  }, [startAudio, stopAudio]);

  return {
    isMicConnected,
    isMuted,
    isDeafened,
    isSpeaking,
    audioLevel,
    sensitivity,
    setSensitivity,
    toggleMute,
    toggleDeafen,
    permissionError,
    restartAudio: startAudio,
  };
}
