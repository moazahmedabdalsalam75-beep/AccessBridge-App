import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Droplets,
  FlipVertical2,
  Hand,
  HeartHandshake,
  HelpCircle,
  LifeBuoy,
  MapPin,
  Mic,
  MicOff,
  PhoneCall,
  Send,
  Siren,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  MUTE_AAC_BOARD,
  type AacBoardItem,
  type Language,
  type TranslationBundle,
} from '../i18n/translations';
import { useSpeechRecognition } from '../hooks/useSpeech';
import { AudioWave } from './AudioWave';
import { SpeechErrorBanner } from './SpeechErrorBanner';
import { FullscreenMessageModal } from './FullscreenMessageModal';
import { DialogueStream, type DialogueMessage } from './DialogueStream';

interface MuteModeProps {
  lang: Language;
  t: TranslationBundle;
  onBack: () => void;
  speak: (text: string, lang: Language) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const ICON_MAP: Record<AacBoardItem['icon'], typeof Hand> = {
  'hand-wave': Hand,
  'heart-handshake': HeartHandshake,
  'life-buoy': LifeBuoy,
  check: Check,
  x: X,
  siren: Siren,
  clock: Clock,
  droplets: Droplets,
  'map-pin': MapPin,
  'message-circle-question': HelpCircle,
  'phone-call': PhoneCall,
  'volume-2': Volume2,
};

export function MuteMode({
  lang,
  t,
  onBack,
  speak,
  stopSpeaking,
  isSpeaking,
}: MuteModeProps) {
  const [customText, setCustomText] = useState('');
  const [partnerText, setPartnerText] = useState('');
  const [faceToFaceFlip, setFaceToFaceFlip] = useState(true);
  const [boardExpanded, setBoardExpanded] = useState(true);
  const [showAllTiles, setShowAllTiles] = useState(false);
  const [activePhraseId, setActivePhraseId] = useState<string | null>(null);
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
        speakerName: role === 'partner' ? t.deaf.speakerHearing : t.nav.mute,
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

  const handleSpeakPhrase = (text: string, id?: string) => {
    const cleaned = text.trim();
    if (!cleaned) return;
    if (id) {
      setActivePhraseId(id);
      setTimeout(() => {
        setActivePhraseId((curr) => (curr === id ? null : curr));
      }, 650);
    }
    appendMessage('user', cleaned);
    speak(cleaned, lang);
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    handleSpeakPhrase(customText);
    setCustomText('');
  };

  const handlePartnerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!partnerText.trim()) return;
    appendMessage('partner', partnerText);
    setPartnerText('');
  };

  const getTileClasses = (tone: AacBoardItem['tone'], isActive: boolean) => {
    if (tone === 'danger') {
      return isActive
        ? 'bg-rose-700 border-rose-700 text-white'
        : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 hover:bg-rose-600 hover:border-rose-600 hover:text-white text-rose-900 dark:text-rose-100';
    }
    if (tone === 'emerald') {
      return isActive
        ? 'bg-emerald-600 border-emerald-600 text-white'
        : 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white text-emerald-950 dark:text-emerald-100';
    }
    if (tone === 'primary') {
      return isActive
        ? 'bg-indigo-600 border-indigo-600 text-white'
        : 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white text-indigo-950 dark:text-indigo-100';
    }
    return isActive
      ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-950'
      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white text-slate-900 dark:text-slate-100';
  };

  const visibleBoardItems = showAllTiles ? MUTE_AAC_BOARD : MUTE_AAC_BOARD.slice(0, 6);

  const starters =
    lang === 'ar'
      ? [
          { label: 'مرحباً', role: 'user' as const },
          { label: 'أحتاج إلى مساعدة', role: 'user' as const },
          { label: 'أهلاً، كيف أساعدك؟', role: 'partner' as const },
        ]
      : [
          { label: 'Hello', role: 'user' as const },
          { label: 'I need help', role: 'user' as const },
          { label: 'Hi, how can I help?', role: 'partner' as const },
        ];

  const hearingBar = (compact = false) => (
    <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
          {t.deaf.speakerHearing}
        </span>
        {!compact && (
          <div className="w-28">
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
          className={`min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
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

        <form onSubmit={handlePartnerSubmit} className="flex-1 flex gap-1.5 min-w-0">
          <input
            type="text"
            value={partnerText}
            onChange={(e) => setPartnerText(e.target.value)}
            placeholder={t.speech.manualCaptionPlaceholder}
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

  const nonVerbalBar = (compact = false) => (
    <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-indigo-800 dark:text-indigo-300">
          {t.nav.mute}
        </span>

        <div className="flex items-center gap-1.5">
          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="min-h-[32px] px-2.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>{t.controls.stopAudio}</span>
            </button>
          )}
          {boardExpanded && (
            <button
              type="button"
              onClick={() => setShowAllTiles((prev) => !prev)}
              aria-pressed={showAllTiles}
              className="min-h-[32px] px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 font-bold text-xs cursor-pointer whitespace-nowrap"
            >
              {showAllTiles ? '6' : `+${MUTE_AAC_BOARD.length - 6}`}
            </button>
          )}
          <button
            type="button"
            onClick={() => setBoardExpanded((prev) => !prev)}
            className="min-h-[32px] px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <span>{t.controls.toggleBoard}</span>
            {boardExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {boardExpanded && (
        <div className="space-y-1.5">
          {/* On mobile: clean single horizontal swipeable strip so it NEVER crushes the chat; on sm+: responsive grid */}
          <div className="flex sm:grid sm:grid-cols-6 gap-1.5 sm:gap-2 overflow-x-auto pb-0.5">
            {visibleBoardItems.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const label = lang === 'ar' ? item.ar : item.en;
              const isActive = activePhraseId === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSpeakPhrase(label, item.id)}
                  className={`min-h-[46px] sm:min-h-[58px] px-3 py-1.5 sm:p-2 rounded-xl border flex sm:flex-col items-center justify-center gap-1.5 sm:gap-1 text-center shrink-0 whitespace-nowrap sm:whitespace-normal transition-colors cursor-pointer ${getTileClasses(
                    item.tone,
                    isActive
                  )}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs sm:text-sm font-extrabold leading-tight">
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>
          {!compact && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowAllTiles((prev) => !prev)}
                className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline cursor-pointer"
              >
                {showAllTiles ? '−' : '+'} {t.mute.boardTitle} ({MUTE_AAC_BOARD.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Custom Text-to-Speech Bar */}
      <form onSubmit={handleCustomSubmit} className="flex gap-1.5 sm:gap-2">
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={t.mute.customPlaceholder}
          aria-label={t.mute.customPlaceholder}
          className="flex-1 min-w-0 min-h-[44px] sm:min-h-[48px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm sm:text-base font-medium"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={!customText.trim()}
          className="min-h-[44px] sm:min-h-[48px] px-4 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>{t.mute.speakAloud}</span>
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
              stopSpeaking();
              onBack();
            }}
            aria-label={t.nav.backHome}
            className="min-h-[42px] px-2.5 sm:px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BackArrow className="w-4 h-4" />
            <span className="hidden sm:inline">{t.nav.backHome}</span>
          </button>
          <h1 className="text-sm sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
            {t.mute.title}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
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
        </div>
      </div>

      {faceToFaceFlip ? (
        /* TRUE 50/50 SPLIT FACE-TO-FACE CONVERSATION */
        <div className="flex-1 min-h-0 flex flex-col gap-2">
          {/* Far Half (Rotated 180° — Faces Hearing Partner) */}
          <div className="flex-1 min-h-[245px] sm:min-h-0 rotate-180 flex flex-col rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <DialogueStream
              messages={messages}
              interimText={interimTranscript}
              interimSpeaker={t.deaf.speakerHearing}
              emptyHint={t.controls.startChatHint}
              onSpeak={(txt) => speak(txt, lang)}
              onFullscreen={(msg) => setFullscreenMsg(msg)}
              lang={lang}
              t={t}
              compact
            />
            <div className="p-2 shrink-0">{hearingBar(true)}</div>
          </div>

          {/* Near Half (0° — Faces Non-Verbal Person) */}
          <div className="flex-1 min-h-[260px] sm:min-h-0 flex flex-col rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <DialogueStream
              messages={messages}
              interimText={interimTranscript}
              interimSpeaker={t.deaf.speakerHearing}
              emptyHint={t.controls.startChatHint}
              starters={starters}
              onSelectStarter={(label, role) =>
                role === 'user' ? handleSpeakPhrase(label) : appendMessage('partner', label)
              }
              onSpeak={(txt) => speak(txt, lang)}
              onFullscreen={(msg) => setFullscreenMsg(msg)}
              lang={lang}
              t={t}
              compact
            />
            <div className="p-2 shrink-0">{nonVerbalBar(true)}</div>
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
              emptyHint={t.controls.startChatHint}
              starters={starters}
              onSelectStarter={(label, role) =>
                role === 'user' ? handleSpeakPhrase(label) : appendMessage('partner', label)
              }
              onSpeak={(txt) => speak(txt, lang)}
              onFullscreen={(msg) => setFullscreenMsg(msg)}
              lang={lang}
              t={t}
            />
          </div>

          <div className="shrink-0 space-y-2">
            {hearingBar()}
            {nonVerbalBar()}
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
