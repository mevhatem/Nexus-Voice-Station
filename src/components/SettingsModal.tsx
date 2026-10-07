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
  Globe,
} from 'lucide-react';
import { AudioDevice } from '../hooks/useWebRTCVoice';
import { VoiceInputMode, PttKeyConfig } from '../types';
import { useLanguage } from '../i18n';

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
  const { language, setLanguage, t, languages } = useLanguage();
  const [activeTab, setActiveTab] = useState<'audio' | 'overlay' | 'language' | 'system'>('audio');
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
            <span>{t('settings.title')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-cyber-textMuted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/20 px-6 pt-2 gap-4 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('audio')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all font-semibold shrink-0 ${
              activeTab === 'audio'
                ? 'border-cyber-cyan text-cyber-cyan'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" /> {t('settings.tabAudio')}
          </button>
          <button
            onClick={() => setActiveTab('overlay')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all font-semibold shrink-0 ${
              activeTab === 'overlay'
                ? 'border-cyber-cyan text-cyber-cyan'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> {t('settings.tabOverlay')}
          </button>
          <button
            onClick={() => setActiveTab('language')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all font-semibold shrink-0 ${
              activeTab === 'language'
                ? 'border-cyber-cyan text-cyber-cyan'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" /> {t('settings.tabLanguage')}
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all font-semibold shrink-0 ${
              activeTab === 'system'
                ? 'border-cyber-cyan text-cyber-cyan'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" /> {t('settings.tabSystem')}
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
                    <Radio className="w-4 h-4 text-cyber-cyan" /> {t('settings.inputMode')}
                  </h4>
                  <span className="text-[10px] font-mono text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/20">
                    {voiceInputMode === 'ptt' ? t('settings.pttActive') : t('settings.vadActive')}
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
                      <span className="text-xs font-bold font-mono">{t('settings.vadTitle')}</span>
                      {voiceInputMode === 'vad' && <Check className="w-4 h-4 text-cyber-cyan" />}
                    </div>
                    <span className="text-[10px] text-cyber-textMuted leading-relaxed">
                      {t('settings.vadDesc')}
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
                      <span className="text-xs font-bold font-mono">{t('settings.pttTitle')}</span>
                      {voiceInputMode === 'ptt' && <Check className="w-4 h-4 text-cyber-purple" />}
                    </div>
                    <span className="text-[10px] text-cyber-textMuted leading-relaxed">
                      {t('settings.pttDesc')}
                    </span>
                  </div>
                </div>

                {/* Key Binding Configurator when PTT is active */}
                {voiceInputMode === 'ptt' && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                        <Keyboard className="w-3.5 h-3.5 text-cyber-purple" /> {t('settings.pttKey')}
                      </span>
                      <p className="text-[10px] text-cyber-textMuted">
                        {t('settings.pttDesc')}
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
                        {isRecordingPtt ? t('settings.pttListening') : t('settings.pttSetKey')}
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
                    <Mic className="w-3.5 h-3.5 text-cyber-cyan" /> {t('settings.inputDevice')}
                  </label>
                  <select
                    value={selectedInputId}
                    onChange={(e) => onSelectInputDevice(e.target.value)}
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyber-cyan font-mono"
                  >
                    <option value="default">{t('settings.defaultDevice')}</option>
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
                    <Volume2 className="w-3.5 h-3.5 text-cyber-teal" /> {t('settings.outputDevice')}
                  </label>
                  <select
                    value={selectedOutputId}
                    onChange={(e) => onSelectOutputDevice(e.target.value)}
                    className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyber-cyan font-mono"
                  >
                    <option value="default">{t('settings.defaultDevice')}</option>
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
                  {t('settings.dspFilters')}
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
                      <span className="text-xs font-bold font-mono">{t('settings.noiseSuppression')}</span>
                      {noiseSuppression ? <Check className="w-4 h-4 text-cyber-cyan" /> : null}
                    </div>
                    <span className="text-[10px] text-cyber-textMuted">{t('settings.noiseDesc')}</span>
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
                      <span className="text-xs font-bold font-mono">{t('settings.echoCancellation')}</span>
                      {echoCancellation ? <Check className="w-4 h-4 text-cyber-cyan" /> : null}
                    </div>
                    <span className="text-[10px] text-cyber-textMuted">{t('settings.echoDesc')}</span>
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
                      <span className="text-xs font-bold font-mono">{t('settings.autoGain')}</span>
                      {autoGainControl ? <Check className="w-4 h-4 text-cyber-cyan" /> : null}
                    </div>
                    <span className="text-[10px] text-cyber-textMuted">{t('settings.autoGainDesc')}</span>
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
                        ? t('settings.vadSensitivity')
                        : t('settings.liveTest')}
                    </h4>
                  </div>
                  {voiceInputMode === 'vad' && (
                    <span className="text-xs font-mono text-cyber-cyan bg-cyber-cyan/10 px-2.5 py-1 rounded-full border border-cyber-cyan/30">
                      %{vadSensitivity}
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
                    <span>{t('settings.liveTest')}</span>
                    <span className={isSpeaking ? 'text-cyber-cyan font-bold animate-pulse' : ''}>
                      {isSpeaking ? t('settings.soundDetected') : t('settings.soundSilent')}
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
                      <Layers className="w-4 h-4 text-cyber-cyan" /> {t('settings.overlayTitle')}
                    </h4>
                    <p className="text-xs text-cyber-textMuted mt-1 leading-relaxed">
                      {t('settings.overlayDesc')}
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
                      ? `✓ ${t('settings.overlayOpen')}`
                      : t('settings.overlayClosed')}
                  </p>
                </div>
              </div>

              {/* Profile Editor Trigger */}
              <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-cyber-purple" /> {t('settings.profileQuick')}
                    </h4>
                    <p className="text-xs text-cyber-textMuted mt-1">
                      {t('profile.title')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenProfileModal();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyber-purple to-cyber-pink text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyber-purple/20 hover:opacity-95 transition-all shrink-0 ml-4"
                  >
                    {t('settings.editProfile')}
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'language' ? (
            /* Language Selection Tab */
            <div className="space-y-5">
              <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyber-cyan" />
                  <h4 className="text-sm font-bold text-white font-mono uppercase">
                    {t('settings.langSelectTitle')}
                  </h4>
                </div>
                <p className="text-xs text-cyber-textMuted leading-relaxed">
                  {t('settings.langSelectDesc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {languages.map((item) => {
                  const isSelected = language === item.code;
                  return (
                    <button
                      key={item.code}
                      onClick={() => setLanguage(item.code)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-lg shadow-cyber-cyan/10'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/[0.08] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.flag}</span>
                        <div>
                          <div className="text-sm font-bold font-mono text-white flex items-center gap-2">
                            <span>{item.nativeName}</span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {item.label}
                          </span>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-cyber-cyan text-black flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-white/40" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* System & Real RAM Monitor Tab */
            <div className="space-y-5">
              <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" /> {t('settings.ramMonitor')}
                    </h4>
                    <p className="text-xs text-cyber-textMuted mt-1">
                      {t('settings.ramDesc')}
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
                      {t('settings.showRamBadge')}
                    </span>
                    <p className="text-[11px] text-gray-400">
                      {t('settings.ramBadgeDesc')}
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
            <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" /> {t('settings.langSelectDesc')}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyber-cyan text-black hover:bg-opacity-90 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyber-cyan/30 font-mono"
          >
            {t('profile.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
