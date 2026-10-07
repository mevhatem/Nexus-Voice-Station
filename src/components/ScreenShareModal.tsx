import React, { useState } from 'react';
import { X, Tv, Monitor, Sparkles, Check, Volume2, ShieldAlert } from 'lucide-react';
import { ScreenQuality, ScreenFps, ScreenShareOptions } from '../types';
import { useLanguage } from '../i18n';

interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartShare: (options: ScreenShareOptions) => void;
}

export const ScreenShareModal: React.FC<ScreenShareModalProps> = ({
  isOpen,
  onClose,
  onStartShare,
}) => {
  const { t } = useLanguage();
  const [resolution, setResolution] = useState<ScreenQuality>('720p');
  const [fps, setFps] = useState<ScreenFps>(30);
  const [includeAudio, setIncludeAudio] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleStart = () => {
    onStartShare({
      resolution,
      fps,
      includeAudio,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
      <div className="glass-panel border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5 font-bold text-base text-white font-mono">
            <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <span>{t('screen.title')}</span>
              <p className="text-[10px] text-cyber-textMuted font-sans font-normal">P2P Opus / H.264</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-cyber-textMuted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Resolution Options */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-bold text-cyber-textMuted uppercase tracking-wider flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-cyber-cyan" /> {t('screen.resolution')}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: '720p', label: '720p HD', desc: t('screen.res720') },
                { id: '1080p', label: '1080p FHD', desc: t('screen.res1080') },
                { id: 'source', label: t('screen.resSource'), desc: t('screen.resSource') },
              ].map((res) => (
                <button
                  key={res.id}
                  onClick={() => setResolution(res.id as ScreenQuality)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    resolution === res.id
                      ? 'border-cyber-cyan bg-cyber-cyan/10 shadow-lg shadow-cyber-cyan/10 text-white'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/20 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs">{res.label}</span>
                    {resolution === res.id && <Check className="w-3.5 h-3.5 text-cyber-cyan" />}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">{res.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* FPS Options */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-bold text-cyber-textMuted uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyber-purple" /> {t('screen.fps')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { fps: 30, label: '30 FPS', desc: t('screen.fps30') },
                { fps: 60, label: '60 FPS', desc: t('screen.fps60') },
              ].map((item) => (
                <button
                  key={item.fps}
                  onClick={() => setFps(item.fps as ScreenFps)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    fps === item.fps
                      ? 'border-cyber-purple bg-cyber-purple/10 shadow-lg shadow-cyber-purple/10 text-white'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/20 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs">{item.label}</span>
                    {fps === item.fps && <Check className="w-3.5 h-3.5 text-cyber-purple" />}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Low CPU Note info */}
          <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-black/40 p-3 rounded-xl border border-white/5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>{t('screen.lowCpuDesc')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {t('screen.cancel')}
          </button>
          <button
            onClick={handleStart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-teal text-black font-mono font-extrabold text-xs shadow-lg shadow-cyber-cyan/25 hover:opacity-95 transition-all flex items-center gap-2"
          >
            <Tv className="w-4 h-4 stroke-[2.5]" />
            {t('screen.start')}
          </button>
        </div>
      </div>
    </div>
  );
};
