import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  Volume2,
  Sliders,
  Cpu,
  ShieldCheck,
  Sparkles,
  Check,
  ToggleLeft,
  ToggleRight,
  Radio,
  Keyboard,
  User as UserIcon,
  Layers,
} from 'lucide-react';
import { AudioDevice } from '../hooks/useWebRTCVoice';
import { VoiceInputMode, PttKeyConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Audio devices
  inputDevices: AudioDevice[];
  outputDevices: AudioDevice[];
  selectedInputId: string;
  selectedOutputId: string;
  onSelectInputDevice: (id: string) => void;
  onSelectOutputDevice: (id: string) => void;
  // Filters
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  onToggleEcho: (val: boolean) => void;
  onToggleNoise: (val: boolean) => void;
  onToggleGain: (val: boolean) => void;
  // Push-to-Talk (PTT) & Input Mode
  voiceInputMode: VoiceInputMode;
  onVoiceInputModeChange: (mode: VoiceInputMode) => void;
  pttKeyConfig: PttKeyConfig;
  onPttKeyChange: (config: PttKeyConfig) => void;
  // VAD & Live test
  vadSensitivity: number;
  onSensitivityChange: (val: number) => void;
  audioLevel: number;
  isSpeaking: boolean;
  // Overlay & Profile
  showVoiceOverlay: boolean;
  onToggleVoiceOverlay: (val: boolean) => void;
  onOpenProfileModal: () => void;
  // System RAM monitor
  realRamUsageMb: number;
  showRamBadge: boolean;
  onToggleRamBadge: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  inputDevices,
  outputDevices,
  selectedInputId,
  selectedOutputId,
  onSelectInputDevice,
  onSelectOutputDevice,
  echoCancellation,
  noiseSuppression,
  autoGainControl,
  onToggleEcho,
  onToggleNoise,
  onToggleGain,
  voiceInputMode,
  onVoiceInputModeChange,
  pttKeyConfig,
  onPttKeyChange,
  vadSensitivity,
  onSensitivityChange,
  audioLevel,
  isSpeaking,
  showVoiceOverlay,
  onToggleVoiceOverlay,
  onOpenProfileModal,
  realRamUsageMb,
  showRamBadge,
  onToggleRamBadge,
}) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'overlay' | 'system'>('audio');
  const [isRecordingPtt, setIsRecordingPtt] = useState(false);

  // Key recording listener for Push-to-Talk
  useEffect(() => {
    if (!isRecordingPtt) return;

    const handleKeyRecord = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      let label = e.key;
      if (e.code === 'Space') label = 'Boşluk (Space)';
      else if (e.code === 'CapsLock') label = 'Caps Lock';
      else if (e.code === 'ControlLeft' || e.code === 'ControlRight') label = 'Ctrl Tuşu';
      else if (e.code === 'AltLeft' || e.code === 'AltRight') label = 'Alt Tuşu';
      else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') label = 'Shift Tuşu';
      else if (e.code.startsWith('Key')) label = `${e.code.replace('Key', '')} Tuşu`;
      else if (e.code.startsWith('Digit')) label = `${e.code.replace('Digit', '')}`;
      else label = e.code;

      onPttKeyChange({ code: e.code, label });
      setIsRecordingPtt(false);
    };

    window.addEventListener('keydown', handleKeyRecord, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyRecord, { capture: true });
    };
  }, [isRecordingPtt, onPttKeyChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
      <div className="glass-panel border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5 font-bold text-base text-white font-mono">
            <Sliders className="w-5 h-5 text-cyber-cyan" />
            <span>NEXUS SES & SİSTEM AYARLARI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-cyber-textMuted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/20 px-6 pt-2 gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('audio')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all font-semibold ${
              activeTab === 'audio'
                ? 'border-cyber-cyan text-cyber-cyan'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" /> Ses & Bas-Konuş
          </button>
          <button
            onClick={() => setActiveTab('overlay')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all font-semibold ${
              activeTab === 'overlay'
                ? 'border-cyber-cyan text-cyber-cyan'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Overlay & Profil
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all font-semibold ${
              activeTab === 'system'
                ? 'border-cyber-cyan text-cyber-cyan'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" /> Performans & RAM
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {activeTab === 'audio' ? (
            <div className="space-y-6">
              {/* Input Mode: VAD vs Push-to-Talk */}
              <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyber-cyan" /> Ses Giriş Modu
                  </h4>
                  <span className="text-[10px] font-mono text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/20">
                    {voiceInputMode === 'ptt' ? 'Bas-Konuş Aktif' : 'Ses Etkinliği Aktif'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Voice Activity Card */}
                  <div
                    onClick={() => onVoiceInputModeChange('vad')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      voiceInputMode === 'vad'
                        ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-lg shadow-cyber-cyan/10'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono">Ses Etkinliği (Otomatik)</span>
                      {voiceInputMode === 'vad' && <Check className="w-4 h-4 text-cyber-cyan" />}
                    </div>
                    <span className="text-[10px] text-cyber-textMuted leading-relaxed">
                      Konuştuğunuzda mikrofon otomatik olarak sesi iletir
                    </span>
                  </div>

                  {/* Push-to-Talk Card */}
                  <div
                    onClick={() => onVoiceInputModeChange('ptt')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      voiceInputMode === 'ptt'
                        ? 'bg-cyber-purple/15 border-cyber-purple text-white shadow-lg shadow-cyber-purple/10'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono">Bas-Konuş (Push-to-Talk)</span>
                      {voiceInputMode === 'ptt' && <Check className="w-4 h-4 text-cyber-purple" />}
                    </div>
                    <span className="text-[10px] text-cyber-textMuted leading-relaxed">
                      Yalnızca atadığınız tuşa basılı tuttuğunuzda ses gider
                    </span>
                  </div>
                </div>

                {/* Key Binding Configurator when PTT is active */}
                {voiceInputMode === 'ptt' && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                        <Keyboard className="w-3.5 h-3.5 text-cyber-purple" /> Bas-Konuş Tuşu
                      </span>
                      <p className="text-[10px] text-cyber-textMuted">
                        Tuşa basılı tuttuğunuzda konuşursunuz, bırakınca sessize geçer.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-cyber-purple/20 text-cyber-purple font-mono font-bold text-xs rounded-lg border border-cyber-purple/40">
                        {pttKeyConfig.label}
                      </span>
                      <button
                        onClick={() => setIsRecordingPtt(true)}
                        className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                          isRecordingPtt
                            ? 'bg-amber-500 text-black animate-pulse'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {isRecordingPtt ? 'Tuşa Basın...' : 'Tuş Değiştir'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Device Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input Mic */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-cyber-textMuted uppercase flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-cyber-cyan" /> Giriş Aygıtı (Mikrofon)
                  </label>
                  <select
                    value={selectedInputId}
                    onChange={(e) => onSelectInputDevice(e.target.value)}
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyber-cyan font-mono"
                  >
                    <option value="default">Varsayılan Sistem Mikrofonu</option>
                    {inputDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Output Speaker */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-cyber-textMuted uppercase flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-cyber-teal" /> Çıkış Aygıtı (Kulaklık/Hoparlör)
                  </label>
                  <select
                    value={selectedOutputId}
                    onChange={(e) => onSelectOutputDevice(e.target.value)}
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyber-cyan font-mono"
                  >
                    <option value="default">Varsayılan Sistem Hoparlörü</option>
                    {outputDevices.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Audio Processing Toggles */}
              <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
                <h4 className="text-xs font-mono font-bold text-white uppercase">
                  Donanım Seviyesi Akıllı Ses Filtreleme
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Noise Suppression */}
                  <div
                    onClick={() => onToggleNoise(!noiseSuppression)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      noiseSuppression
                        ? 'bg-cyber-cyan/10 border-cyber-cyan/40 text-white'
                        : 'bg-white/5 border-white/5 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono">Gürültü Engelleme</span>
                      {noiseSuppression ? <Check className="w-4 h-4 text-cyber-cyan" /> : null}
                    </div>
                    <span className="text-[10px] text-cyber-textMuted">Arka plan seslerini filtreler</span>
                  </div>

                  {/* Echo Cancellation */}
                  <div
                    onClick={() => onToggleEcho(!echoCancellation)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      echoCancellation
                        ? 'bg-cyber-cyan/10 border-cyber-cyan/40 text-white'
                        : 'bg-white/5 border-white/5 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono">Yankı İptali</span>
                      {echoCancellation ? <Check className="w-4 h-4 text-cyber-cyan" /> : null}
                    </div>
                    <span className="text-[10px] text-cyber-textMuted">Hoparlör yankısını önler</span>
                  </div>

                  {/* Auto Gain Control */}
                  <div
                    onClick={() => onToggleGain(!autoGainControl)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      autoGainControl
                        ? 'bg-cyber-cyan/10 border-cyber-cyan/40 text-white'
                        : 'bg-white/5 border-white/5 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono">Otomatik Kazanç</span>
                      {autoGainControl ? <Check className="w-4 h-4 text-cyber-cyan" /> : null}
                    </div>
                    <span className="text-[10px] text-cyber-textMuted">Ses düzeyini dengeler</span>
                  </div>
                </div>
              </div>

              {/* Live Mic Test & Sensitivity Slider (only for VAD mode) */}
              <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-cyber-cyan" />
                    <h4 className="font-semibold text-white text-xs font-mono uppercase">
                      {voiceInputMode === 'vad'
                        ? 'Ses Algılama (VAD) Eşiği & Mikrofon Testi'
                        : 'Mikrofon Seviye Testi'}
                    </h4>
                  </div>
                  {voiceInputMode === 'vad' && (
                    <span className="text-xs font-mono text-cyber-cyan bg-cyber-cyan/10 px-2.5 py-1 rounded-full border border-cyber-cyan/30">
                      %{vadSensitivity} Eşik
                    </span>
                  )}
                </div>

                {voiceInputMode === 'vad' && (
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="1"
                    value={vadSensitivity}
                    onChange={(e) => onSensitivityChange(parseInt(e.target.value))}
                    className="w-full accent-cyber-cyan bg-white/10 cursor-pointer h-2 rounded-lg"
                  />
                )}

                {/* Live Mic Test Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-cyber-textMuted">
                    <span>Canlı Mikrofon Girişi</span>
                    <span className={isSpeaking ? 'text-cyber-cyan font-bold animate-pulse' : ''}>
                      {isSpeaking ? 'KONUŞUYOR (Sinyal İletiliyor)' : 'SESSİZ'}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-75 ${
                        isSpeaking
                          ? 'bg-gradient-to-r from-cyber-cyan to-cyber-purple shadow-[0_0_15px_#00f2fe]'
                          : 'bg-gray-700'
                      }`}
                      style={{ width: `${Math.min(100, audioLevel)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'overlay' ? (
            /* Desktop Voice Overlay & Profile Tab */
            <div className="space-y-5">
              {/* Voice Overlay Card */}
              <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyber-cyan" /> Masaüstü Canlı Ses Katmanı (Oyuncu & Yayıncı Overlay)
                    </h4>
                    <p className="text-xs text-cyber-textMuted mt-1 leading-relaxed">
                      Oyun oynarken veya diğer uygulamalardayken panel arka planda olsa dahi ekranda kimlerin olduğunu ve kimin konuştuğunu hafif saydam yüzen katman olarak gösterir.
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleVoiceOverlay(!showVoiceOverlay)}
                    className="text-cyber-cyan hover:text-white transition-colors ml-4"
                  >
                    {showVoiceOverlay ? (
                      <ToggleRight className="w-8 h-8 text-cyber-cyan" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-600" />
                    )}
                  </button>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <p className="text-[11px] text-gray-400">
                    {showVoiceOverlay
                      ? '✓ Overlay aktif: Ekranın sol üstünde kimin konuştuğu anlık neon halkayla parlar.'
                      : 'Overlay kapalı. Açarak konuşanları mini panelde izleyebilirsiniz.'}
                  </p>
                </div>
              </div>

              {/* Profile Editor Trigger */}
              <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-cyber-purple" /> Profil Bilgilerini Düzenle
                    </h4>
                    <p className="text-xs text-cyber-textMuted mt-1">
                      Kullanıcı adını, avatarını ve durum mesajını dilediğin zaman değiştir.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenProfileModal();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyber-purple to-cyber-pink text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyber-purple/20 hover:opacity-95 transition-all shrink-0 ml-4"
                  >
                    Profili Düzenle
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* System & Real RAM Monitor Tab */
            <div className="space-y-5">
              <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" /> Canlı Sistem Bellek Tüketimi
                    </h4>
                    <p className="text-xs text-cyber-textMuted mt-1">
                      Windows `psapi.dll` API'si ile doğrudan çekilen gerçek zamanlı RAM kullanımınız
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-2xl font-bold text-emerald-400">
                      {realRamUsageMb > 0 ? `${realRamUsageMb} MB` : '~35 MB'}
                    </span>
                    <span className="block text-[10px] text-gray-500">Working Set RAM</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white">
                      Arayüzdeki RAM Göstergesini Göster / Gizle
                    </span>
                    <p className="text-[11px] text-gray-400">
                      Başlık çubuğundaki ve sol paneldeki RAM etiketini kapatabilirsiniz.
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleRamBadge(!showRamBadge)}
                    className="text-cyber-cyan hover:text-white transition-colors"
                  >
                    {showRamBadge ? (
                      <ToggleRight className="w-8 h-8 text-cyber-cyan" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Benchmark Comparison */}
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="bg-black/40 p-4 rounded-2xl border border-cyber-cyan/30">
                  <div className="flex items-center gap-1.5 text-xs text-cyber-cyan font-bold mb-1">
                    <ShieldCheck className="w-4 h-4" /> Nexus Voice (Tauri v2 + Rust)
                  </div>
                  <span className="text-2xl font-bold text-white">~35 MB</span>
                  <p className="text-[10px] text-cyber-textMuted mt-1">Sıfır Chromium, saf hafiflik</p>
                </div>

                <div className="bg-black/40 p-4 rounded-2xl border border-red-500/20 opacity-70">
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold mb-1">
                    Geleneksel Ağır Sohbet Uygulamaları
                  </div>
                  <span className="text-2xl font-bold text-red-400">~650 MB</span>
                  <p className="text-[10px] text-cyber-textMuted mt-1">Ağır Electron motoru</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-black/40 border-t border-white/10 flex justify-between items-center">
          <span className="text-[11px] font-mono text-cyber-textMuted flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" /> Ayarlar anında uygulanır
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyber-cyan text-black hover:bg-opacity-90 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyber-cyan/30 font-mono"
          >
            Kaydet ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
