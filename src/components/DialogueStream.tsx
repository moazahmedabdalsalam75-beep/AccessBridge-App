import { useEffect, useRef } from 'react';
import { Maximize2, Volume2 } from 'lucide-react';
import type { Language, TranslationBundle } from '../i18n/translations';

export interface DialogueMessage {
  id: string;
  role: 'partner' | 'user';
  speakerName: string;
  text: string;
  time: string;
  audioUrl?: string;
}

interface DialogueStreamProps {
  messages: DialogueMessage[];
  interimText?: string;
  interimSpeaker?: string;
  textSizeClass?: string;
  emptyHint: string;
  starters?: { label: string; role: 'partner' | 'user' }[];
  onSelectStarter?: (text: string, role: 'partner' | 'user') => void;
  onSpeak?: (text: string) => void;
  onFullscreen?: (msg: DialogueMessage) => void;
  lang: Language;
  t: TranslationBundle;
  compact?: boolean;
}

export function DialogueStream({
  messages,
  interimText,
  interimSpeaker,
  textSizeClass = 'text-lg sm:text-2xl leading-snug',
  emptyHint,
  starters,
  onSelectStarter,
  onSpeak,
  onFullscreen,
  t,
  compact = false,
}: DialogueStreamProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, interimText]);

  if (messages.length === 0 && !interimText) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center text-center px-3 ${compact ? 'py-3 gap-2.5' : 'py-6 gap-4'}`}>
        <p className={`${compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-medium text-slate-500 dark:text-slate-400 max-w-md`}>
          {emptyHint}
        </p>
        {starters && starters.length > 0 && onSelectStarter && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-xl">
            {starters.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectStarter(starter.label, starter.role)}
                className="min-h-[38px] sm:min-h-[44px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {starter.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className={`flex-1 overflow-y-auto ${compact ? 'space-y-2 p-2.5 sm:p-3' : 'space-y-3.5 p-3.5 sm:p-6'}`}
    >
      {messages.map((msg) => {
        const isPartner = msg.role === 'partner';
        return (
          <div
            key={msg.id}
            className={`flex ${isPartner ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[78%] ${
                compact ? 'px-3.5 py-2.5 rounded-2xl' : 'px-4 py-3 sm:px-5 sm:py-4 rounded-3xl'
              } border shadow-xs space-y-1.5 ${
                isPartner
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80 text-slate-900 dark:text-white rounded-bs-md'
                  : 'bg-indigo-600 border-indigo-600 text-white rounded-be-md'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`text-xs font-bold ${
                    isPartner ? 'text-emerald-700 dark:text-emerald-300' : 'text-indigo-100'
                  }`}
                >
                  {msg.speakerName}
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[11px] font-mono-tabular ${
                      isPartner ? 'text-slate-500 dark:text-slate-400' : 'text-indigo-200'
                    }`}
                  >
                    {msg.time}
                  </span>
                  {(onSpeak || msg.audioUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (msg.audioUrl) {
                          const audio = new Audio(msg.audioUrl);
                          void audio.play().catch(() => {});
                        } else {
                          onSpeak?.(msg.text);
                        }
                      }}
                      aria-label={t.deaf.speakReply}
                      className={`min-h-[34px] min-w-[34px] rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                        isPartner
                          ? 'hover:bg-emerald-200/70 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                          : 'hover:bg-indigo-500 text-white'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                  {onFullscreen && (
                    <button
                      type="button"
                      onClick={() => onFullscreen(msg)}
                      aria-label={t.controls.fullscreenCard}
                      className={`min-h-[34px] min-w-[34px] rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                        isPartner
                          ? 'hover:bg-emerald-200/70 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                          : 'hover:bg-indigo-500 text-white'
                      }`}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className={`font-bold break-words ${textSizeClass}`}>{msg.text}</p>
              {msg.audioUrl && (
                <audio
                  src={msg.audioUrl}
                  controls
                  autoPlay
                  className="w-full max-w-[260px] h-9 mt-1"
                />
              )}
            </div>
          </div>
        );
      })}

      {interimText && (
        <div className="flex justify-start">
          <div className="max-w-[88%] sm:max-w-[78%] px-4 py-3 rounded-3xl rounded-bs-md bg-slate-950 text-white border border-emerald-500/70">
            <p className="text-xs font-bold text-emerald-400 mb-0.5">
              {interimSpeaker} · {t.speech.listeningNow}
            </p>
            <p className={`font-bold text-indigo-200 break-words ${textSizeClass}`}>
              {interimText}
            </p>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
