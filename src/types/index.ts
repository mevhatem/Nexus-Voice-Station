export interface Room {
  id: string;
  name: string;
  category: string;
  activeCount: number;
  icon?: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  customStatus?: string;
  game?: string;
  isSpeaking?: boolean;
  isHost?: boolean;
  isMuted?: boolean;
  isMutedByHost?: boolean;
  isLocallyMuted?: boolean;
  volume?: number; // 0 to 200, default 100
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
}

export type VoiceInputMode = 'vad' | 'ptt';

export interface PttKeyConfig {
  code: string;
  label: string;
}

export interface VoiceState {
  currentRoomId: string | null;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  audioLevel: number;
}

export type ScreenQuality = '720p' | '1080p' | 'source';
export type ScreenFps = 30 | 60;

export interface ScreenShareOptions {
  resolution: ScreenQuality;
  fps: ScreenFps;
  includeAudio: boolean;
}

export interface ScreenShareInfo {
  isSharing: boolean;
  sharerId: string | null;
  sharerName: string | null;
  resolution: ScreenQuality;
  fps: ScreenFps;
  stream: MediaStream | null;
}


