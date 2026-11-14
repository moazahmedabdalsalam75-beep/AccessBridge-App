import { useEffect } from 'react';
import { Volume2, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { Language, TranslationBundle } from '../i18n/translations';

interface FullscreenMessageModalProps {
  message: string | null;
  speakerLabel?: string;
  lang: Language;
  t: TranslationBundle;
  onClose: () => void;
  onSpeak?: (text: string) => void;
}

export function FullscreenMessageModal({
  message,
  speakerLabel,
  t,
  onClose,
  onSpeak,
}: FullscreenMessageModalProps) {
  useEffect(() => {
    if (!message) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={message}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md text-white p-6 sm:p-10 flex flex-col justify-between cursor-pointer"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-emerald-400">
          {speakerLabel ?? ''}
        </span>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {onSpeak && (
            <button
              type="button"
              onClick={() => onSpeak(message)}
              className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              <span>{t.deaf.speakReply}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={t.controls.closeFullscreen}
            className="min-h-[48px] min-w-[48px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center text-center px-2">
        <p className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight max-w-5xl break-words">
          {message}
        </p>
      </div>

      <p className="text-center text-sm font-medium text-slate-400">
        {t.controls.closeFullscreen}
      </p>
    </motion.div>
  );
}
