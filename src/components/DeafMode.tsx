import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  FlipVertical2,
  Hand,
  HeartHandshake,
  Keyboard,
  LifeBuoy,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  DEAF_QUICK_REPLIES,
  type Language,
  type QuickReplyItem,
  type TranslationBundle,
} from '../i18n/translations';
import { useSpeechRecognition } from '../hooks/useSpeech';
import { AudioWave } from './AudioWave';
import { SpeechErrorBanner } from './SpeechErrorBanner';
import { FullscreenMessageModal } from './FullscreenMessageModal';
import { DialogueStream, type DialogueMessage } from './DialogueStream';
import { SignLanguageIcon } from './AccessibilityGuides';

const QUICK_REPLY_ICONS: Record<QuickReplyItem['icon'], typeof Hand> = {
  hand: Hand,
  'rotate-ccw': RotateCcw,
  check: Check,
  x: X,
  keyboard: Keyboard,
  clock: Clock,
  'heart-handshake': HeartHandshake,
  'life-buoy': LifeBuoy,
};

interface DeafModeProps {
  lang: Language;
  t: TranslationBundle;
  onBack: () => void;
  speak: (text: string, lang: Language) => void;
  isSpeaking: boolean;
}

type CaptionSize = 'md' | 'lg' | 'xl';

export function DeafMode({ lang, t, onBack, speak }: DeafModeProps) {
  const [captionSize, setCaptionSize] = useState<CaptionSize>('lg');
  const [autoSpeakReplies, setAutoSpeakReplies] = useState(true);
  const [faceToFaceFlip, setFaceToFaceFlip] = useState(true);
  const [manualCaption, setManualCaption] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [fullscreenMsg, setFullscreenMsg] = useState<DialogueMessage | null>(null);

  const BackArrow = lang === 'ar' ? ArrowRight : ArrowLeft;

  const formatTime = () =>
    new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const appendMessage = (role: 'partner' | 'user', text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role,
        speakerName: role === 'partner' ? t.deaf.speakerHearing : t.deaf.speakerDeaf,
        text: cleaned,
        time: formatTime(),
      },
    ]);
  };

  const {
    isListening,
    interimTranscript,
    audioLevels,
    error: sttError,
    toggleListening,
    stopListening,
  } = useSpeechRecognition({
    lang,
    continuous: true,
    onFinalResult: (spokenText) => {
      appendMessage('partner', spokenText);
    },
  });

  const handleManualCaptionSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!manualCaption.trim()) return;
    appendMessage('partner', manualCaption);
    setManualCaption('');
  };

  const triggerDeafReply = (text: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;
    appendMessage('user', cleaned);
    if (autoSpeakReplies) {
      speak(cleaned, lang);
    }
  };

  const handleCustomReplySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    triggerDeafReply(replyInput);
    setReplyInput('');
  };

  const captionSizeClass =
    captionSize === 'xl'
      ? 'text-2xl sm:text-4xl lg:text-5xl leading-tight'
      : captionSize === 'lg'
        ? 'text-xl sm:text-3xl leading-snug'
        : 'text-lg sm:text-xl leading-relaxed';

  const cycleCaptionSize = () => {
    setCaptionSize((prev) => (prev === 'md' ? 'lg' : prev === 'lg' ? 'xl' : 'md'));
  };

  const starters =
    lang === 'ar'
      ? [
          { label: 'مرحباً، كيف أساعدك؟', role: 'partner' as const },
          { label: 'تحدث ببطء من فضلك', role: 'user' as const },
          { label: 'نعم، فهمت', role: 'user' as const },
        ]
      : [
          { label: 'Hello, how can I help?', role: 'partner' as const },
          { label: 'Please speak slower', role: 'user' as const },
          { label: 'Yes, I understand', role: 'user' as const },
        ];

  const hearingBar = (compact = false) => (
    <div className="p-2.5 sm:p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
          {t.deaf.speakerHearing}
        </span>
        {!compact && (
          <div className="w-28 sm:w-32">
            <AudioWave active={isListening} levels={audioLevels} accent="emerald" />
          </div>
        )}
      </div>

      {/* Single compact row on mobile & desktop */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={toggleListening}
          aria-label={isListening ? t.speech.stopListening : t.speech.startListening}
          className={`min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
            isListening
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/40'
              : 'bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 text-white'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4 shrink-0" /> : <Mic className="w-4 h-4 shrink-0" />}
          <span className="hidden sm:inline">
            {isListening ? t.speech.stopListening : t.speech.startListening}
          </span>
        </motion.button>

        <form onSubmit={handleManualCaptionSubmit} className="flex-1 flex gap-1.5 min-w-0">
          <input
            type="text"
            value={manualCaption}
            onChange={(e) => setManualCaption(e.target.value)}
            placeholder={t.speech.manualCaptionPlaceholder}
            aria-label={t.speech.manualCaptionPlaceholder}
            className="flex-1 min-w-0 min-h-[44px] sm:min-h-[48px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm sm:text-base font-medium"
          />
          <button
            type="submit"
            aria-label={t.speech.sendManualCaption}
            className="min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <SpeechErrorBanner error={sttError} t={t} />
    </div>
  );

  const deafBar = (compact = false) => (
    <div className="p-2.5 sm:p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
      <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-indigo-800 dark:text-indigo-300">
        <SignLanguageIcon className="w-4 h-4 shrink-0" />
        <span className="truncate">{t.deaf.visualSignGuide}</span>
      </div>
      {/* Smart Quick-Response Grid in standard view, swipeable 1-row strip in compact split view */}
      <div
        className={
          compact
            ? 'flex items-center gap-1.5 overflow-x-auto pb-0.5'
            : 'grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2'
        }
      >
        {DEAF_QUICK_REPLIES.map((item) => {
          const label = lang === 'ar' ? item.ar : item.en;
          const ReplyIcon = QUICK_REPLY_ICONS[item.icon];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => triggerDeafReply(label)}
              className={`${
                compact
                  ? 'min-h-[38px] sm:min-h-[42px] px-3 py-1 whitespace-nowrap shrink-0'
                  : 'min-h-[44px] px-3 py-2 text-start'
              } rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer`}
            >
              <ReplyIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span className={compact ? '' : 'line-clamp-1'}>{label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleCustomReplySubmit} className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          aria-pressed={autoSpeakReplies}
          aria-label={t.deaf.autoSpeakReplies}
          onClick={() => setAutoSpeakReplies((prev) => !prev)}
          className={`min-h-[44px] min-w-[44px] sm:min-h-[48px] px-2.5 sm:px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
            autoSpeakReplies
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          {autoSpeakReplies ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden md:inline">{t.deaf.autoSpeakReplies}</span>
        </button>

        <input
          type="text"
          value={replyInput}
          onChange={(e) => setReplyInput(e.target.value)}
          placeholder={t.deaf.replyInputPlaceholder}
          aria-label={t.deaf.replyInputPlaceholder}
          className="flex-1 min-w-0 min-h-[44px] sm:min-h-[48px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm sm:text-base font-medium"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className="min-h-[44px] sm:min-h-[48px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">{t.deaf.sendReply}</span>
        </motion.button>
      </form>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-4 min-h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] flex flex-col gap-2.5 sm:gap-3">
      {/* Slim Single-Row Conversation Header */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              stopListening();
              onBack();
            }}
            aria-label={t.nav.backHome}
            className="min-h-[42px] px-2.5 sm:px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BackArrow className="w-4 h-4" />
            <span className="hidden sm:inline">{t.nav.backHome}</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <SignLanguageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h1 className="text-sm sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              {t.deaf.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={cycleCaptionSize}
            aria-label={t.deaf.textSizeLabel}
            className="sm:hidden min-h-[42px] px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-extrabold cursor-pointer"
          >
            {captionSize === 'md' ? 'A' : captionSize === 'lg' ? 'A+' : 'A++'}
          </button>

          <button
            type="button"
            aria-pressed={faceToFaceFlip}
            onClick={() => setFaceToFaceFlip((prev) => !prev)}
            className={`min-h-[42px] px-2.5 sm:px-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              faceToFaceFlip
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FlipVertical2 className="w-4 h-4 shrink-0" />
            <span className="sm:hidden">180°</span>
            <span className="hidden sm:inline">{t.controls.faceToFaceFlip}</span>
          </button>

          <div
            role="group"
            aria-label={t.deaf.textSizeLabel}
            className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            {(['md', 'lg', 'xl'] as CaptionSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setCaptionSize(size)}
                className={`min-h-[34px] px-2.5 rounded-lg text-xs font-bold cursor-pointer ${
                  captionSize === size
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {size === 'md' ? 'A' : size === 'lg' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {faceToFaceFlip ? (
        /* TRUE 50/50 SPLIT FACE-TO-FACE CONVERSATION */
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          {/* Far Half (Rotated 180° — Faces Hearing Person) */}
          <div className="flex-1 min-h-[245px] sm:min-h-0 rotate-180 flex flex-col rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <DialogueStream
              messages={messages}
              interimText={interimTranscript}
              interimSpeaker={t.deaf.speakerHearing}
              textSizeClass={captionSizeClass}
              emptyHint={t.controls.startChatHint}
              onSpeak={(txt) => speak(txt, lang)}
              onFullscreen={(msg) => setFullscreenMsg(msg)}
              lang={lang}
              t={t}
              compact
            />
            <div className="p-2 shrink-0">{hearingBar(true)}</div>
          </div>

          {/* Near Half (0° — Faces Deaf Person) */}
          <div className="flex-1 min-h-[255px] sm:min-h-0 flex flex-col rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <DialogueStream
              messages={messages}
              interimText={interimTranscript}
              interimSpeaker={t.deaf.speakerHearing}
              textSizeClass={captionSizeClass}
              emptyHint={t.controls.startChatHint}
              starters={starters}
              onSelectStarter={(label, role) =>
                role === 'user' ? triggerDeafReply(label) : appendMessage('partner', label)
              }
              onSpeak={(txt) => speak(txt, lang)}
              onFullscreen={(msg) => setFullscreenMsg(msg)}
              lang={lang}
              t={t}
              compact
            />
            <div className="p-2 shrink-0">{deafBar(true)}</div>
          </div>
        </div>
      ) : (
        /* STANDARD MESSENGER-STYLE TWO-WAY CONVERSATION */
        <div className="flex-1 min-h-0 flex flex-col gap-2.5 sm:gap-3">
          <div className="flex-1 min-h-[240px] flex flex-col rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <DialogueStream
              messages={messages}
              interimText={interimTranscript}
              interimSpeaker={t.deaf.speakerHearing}
              textSizeClass={captionSizeClass}
              emptyHint={t.controls.startChatHint}
              starters={starters}
              onSelectStarter={(label, role) =>
                role === 'user' ? triggerDeafReply(label) : appendMessage('partner', label)
              }
              onSpeak={(txt) => speak(txt, lang)}
              onFullscreen={(msg) => setFullscreenMsg(msg)}
              lang={lang}
              t={t}
            />
          </div>

          <div className="shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
            {hearingBar(false)}
            {deafBar(false)}
          </div>
        </div>
      )}

      <AnimatePresence>
        {fullscreenMsg && (
          <FullscreenMessageModal
            message={fullscreenMsg.text}
            speakerLabel={fullscreenMsg.speakerName}
            lang={lang}
            t={t}
            onClose={() => setFullscreenMsg(null)}
            onSpeak={(txt) => speak(txt, lang)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
