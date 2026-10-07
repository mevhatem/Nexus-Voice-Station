import React, { useState, useRef, useEffect } from 'react';
import { Message, Friend } from '../types';
import { X, Send, Paperclip, MessageSquare, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { useLanguage } from '../i18n';

interface RightChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  currentUser: Friend;
  onSendMessage: (text: string, imageUrl?: string) => void;
}

export const RightChatDrawer: React.FC<RightChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  currentUser,
  onSendMessage,
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Process and downscale image file to lightweight Base64
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPendingImage(dataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Support Ctrl+V paste for screenshots
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !pendingImage) return;
    onSendMessage(inputText.trim(), pendingImage || undefined);
    setInputText('');
    setPendingImage(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <aside className="w-[340px] h-full glass-panel border-l border-white/10 flex flex-col justify-between select-none z-20 shadow-2xl transition-all duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2 text-white font-bold text-sm font-mono">
            <MessageSquare className="w-4 h-4 text-cyber-cyan" />
            <span>{t('chat.title')}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-cyber-textMuted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-cyber-textMuted text-xs space-y-1">
              <p>{t('chat.empty')}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2.5 group">
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10 shrink-0 mt-0.5"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-white font-mono truncate">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-cyber-textMuted">{msg.timestamp}</span>
                  </div>

                  <div className="bg-white/5 p-2.5 rounded-2xl mt-1 border border-white/5 space-y-2 select-text">
                    {msg.content && (
                      <p className="text-xs text-gray-200 leading-relaxed break-words font-sans">
                        {msg.content}
                      </p>
                    )}

                    {msg.imageUrl && (
                      <div className="relative group/img overflow-hidden rounded-xl border border-white/10 bg-black/40">
                        <img
                          src={msg.imageUrl}
                          alt="Görsel"
                          onClick={() => setLightboxImage(msg.imageUrl!)}
                          className="w-full max-h-56 object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                        />
                        <button
                          onClick={() => setLightboxImage(msg.imageUrl!)}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black"
                          title="Büyük Gör"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/40 space-y-2">
          {/* Pending image preview */}
          {pendingImage && (
            <div className="relative inline-block rounded-xl overflow-hidden border border-cyber-cyan/40 bg-black/50 p-1">
              <img
                src={pendingImage}
                alt="Gönderilecek görsel"
                className="h-16 w-auto rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => setPendingImage(null)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-red-500 text-white transition-colors"
                title="Görseli Kaldır"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="glass-panel p-1.5 rounded-xl flex items-center gap-1.5 border border-white/10 focus-within:border-cyber-cyan">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Paperclip / Image button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-cyber-textMuted hover:text-cyber-cyan hover:bg-white/5 rounded-lg transition-colors"
              title={t('chat.uploadImage')}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Text input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPaste={handlePaste}
              placeholder={t('chat.placeholder')}
              className="bg-transparent flex-1 text-xs text-white placeholder-cyber-textMuted outline-none px-1"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim() && !pendingImage}
              className={`p-1.5 rounded-lg transition-all ${
                inputText.trim() || pendingImage
                  ? 'bg-cyber-cyan text-black hover:bg-opacity-90 shadow-md shadow-cyber-cyan/30'
                  : 'text-cyber-textMuted opacity-40 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </aside>

      {/* Lightbox Modal (Full-size image zoom) */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Büyük Görsel"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};
