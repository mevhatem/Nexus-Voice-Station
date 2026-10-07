export interface OverlayParticipant {
  id: string;
  name: string;
  avatar: string;
  isSpeaking?: boolean;
  isMuted?: boolean;
  customStatus?: string;
  volume?: number;
  isLocallyMuted?: boolean;
  isLocal?: boolean;
}

export interface OverlaySyncPayload {
  inRoom: boolean;
  activeRoomCode: string;
  currentUser: OverlayParticipant;
  participants: OverlayParticipant[];
  audioLevel: number;
  voiceInputMode?: 'vad' | 'ptt';
  isPttActive?: boolean;
  pttKeyLabel?: string;
}

export type OverlayCommandMessage =
  | { type: 'CMD_TOGGLE_MUTE' }
  | { type: 'CMD_CLOSE' }
  | { type: 'CMD_LEAVE_ROOM' }
  | { type: 'CMD_REQUEST_SYNC' };

const CHANNEL_NAME = 'nexus_voice_overlay_channel';
const CACHE_KEY = 'nexus_overlay_sync_cache';

let channelInstance: BroadcastChannel | null = null;

export function getOverlayChannel(): BroadcastChannel {
  if (!channelInstance) {
    channelInstance = new BroadcastChannel(CHANNEL_NAME);
  }
  return channelInstance;
}

export function broadcastOverlayState(payload: OverlaySyncPayload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {}

  try {
    const ch = getOverlayChannel();
    ch.postMessage({ type: 'SYNC_STATE', payload });
  } catch (err) {
    console.warn('Failed to broadcast overlay state:', err);
  }
}

export function sendOverlayCommand(cmd: OverlayCommandMessage) {
  try {
    const ch = getOverlayChannel();
    ch.postMessage(cmd);
  } catch (err) {
    console.warn('Failed to send overlay command:', err);
  }
}

export function getCachedOverlayState(): OverlaySyncPayload | null {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return null;
}
