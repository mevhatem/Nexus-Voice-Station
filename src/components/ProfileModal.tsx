import React, { useState, useRef, useEffect } from 'react';
import { Friend } from '../types';
import { Upload, Sparkles, Check, User as UserIcon, X, Smile } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  initialProfile?: Friend | null;
  onSave: (profile: Friend) => void;
  onClose?: () => void;
  isEditing?: boolean;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  initialProfile,
  onSave,
  onClose,
  isEditing = false,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    initialProfile?.avatar || PRESET_AVATARS[0]
  );
  const [customStatus, setCustomStatus] = useState(initialProfile?.customStatus || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || '');
      setSelectedAvatar(initialProfile.avatar || PRESET_AVATARS[0]);
      setCustomStatus(initialProfile.customStatus || '');
    }
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProfile: Friend = {
      ...(initialProfile || {}),
      id: initialProfile?.id || `user-${Date.now()}`,
      name: name.trim(),
      avatar: selectedAvatar,
      status: 'online',
      customStatus: customStatus.trim() || undefined,
    };

    onSave(newProfile);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
      <div className="glass-panel border border-white/10 rounded-3xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-5 relative">
        {/* Close Button when editing */}
        {isEditing && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-cyber-cyan to-cyber-purple flex items-center justify-center text-black shadow-lg shadow-cyber-cyan/30 mb-2">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-lg font-bold text-white font-mono tracking-wider">
            {isEditing ? 'NEXUS PROFİLİNİ DÜZENLE' : 'NEXUS PROFİLİNİ OLUŞTUR'}
          </h2>
          <p className="text-xs text-cyber-textMuted">
            {isEditing
              ? 'Kullanıcı adını, avatarını ve durum mesajını güncelle'
              : 'Arkadaşlarının ses odasında seni nasıl göreceğini belirle'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Active Preview */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <img
                src={selectedAvatar}
                alt="Seçili Avatar"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-cyber-cyan shadow-xl shadow-cyber-cyan/30"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white transition-opacity font-mono"
              >
                <Upload className="w-4 h-4 mb-0.5 text-cyber-cyan" />
                Değiştir
              </button>
            </div>
            <span className="text-[10px] text-cyber-textMuted font-mono">Önizleme</span>
          </div>

          {/* Nickname Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-cyber-textMuted uppercase">
              Kullanıcı Adı / Nickname
            </label>
            <div className="glass-panel px-3 py-2 rounded-xl flex items-center gap-2 border border-white/10 focus-within:border-cyber-cyan">
              <UserIcon className="w-4 h-4 text-cyber-cyan" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: AhmetDev"
                className="bg-transparent flex-1 text-xs text-white placeholder-gray-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Custom Status / Bio Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-cyber-textMuted uppercase">
              Özel Durum Mesajı (İsteğe Bağlı)
            </label>
            <div className="glass-panel px-3 py-2 rounded-xl flex items-center gap-2 border border-white/10 focus-within:border-cyber-cyan">
              <Smile className="w-4 h-4 text-cyber-purple" />
              <input
                type="text"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="Örn: 🎮 Valorant | 🎧 Müzik dinliyor"
                className="bg-transparent flex-1 text-xs text-white placeholder-gray-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Avatar Choice Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-cyber-textMuted uppercase flex items-center justify-between">
              <span>Avatar Seçimi</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-cyber-cyan hover:underline text-[11px] flex items-center gap-1"
              >
                <Upload className="w-3 h-3" /> PC'den Yükle
              </button>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-2.5 pt-0.5">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedAvatar(av)}
                  className={`relative rounded-full p-0.5 transition-all ${
                    selectedAvatar === av
                      ? 'ring-2 ring-cyber-cyan scale-105 shadow-md shadow-cyber-cyan/30'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={av}
                    alt={`Avatar ${idx}`}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  {selectedAvatar === av && (
                    <div className="absolute -bottom-1 -right-1 bg-cyber-cyan text-black p-0.5 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            {isEditing && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-mono font-semibold text-xs rounded-xl border border-white/10 transition-all"
              >
                İptal
              </button>
            )}
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 bg-cyber-cyan text-black font-mono font-bold text-xs rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-cyber-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? 'KAYDET' : 'İSTASYONA GİRİŞ YAP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
