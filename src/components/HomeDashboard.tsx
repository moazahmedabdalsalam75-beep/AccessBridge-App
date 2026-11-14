import {
  ArrowLeft,
  ArrowRight,
  Captions,
  EarOff,
  EyeOff,
  MessageSquareText,
  Mic,
  Volume2,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { ConversationMode, Language, TranslationBundle } from '../i18n/translations';
import { isSpeechRecognitionSupported, isSpeechSynthesisSupported } from '../hooks/useSpeech';
import { BrailleCell, SignLanguageIcon } from './AccessibilityGuides';

interface HomeDashboardProps {
  lang: Language;
  t: TranslationBundle;
  onSelectMode: (mode: ConversationMode) => void;
  onTestVoice: () => void;
  isSpeaking: boolean;
  onStopVoice: () => void;
}

export function HomeDashboard({
  lang,
  t,
  onSelectMode,
  onTestVoice,
  isSpeaking,
  onStopVoice,
}: HomeDashboardProps) {
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;
  const sttReady = isSpeechRecognitionSupported();
  const ttsReady = isSpeechSynthesisSupported();

  const modes: {
    id: Exclude<ConversationMode, 'home'>;
    icon: typeof EarOff;
    accentBg: string;
    accentIcon: string;
    buttonClass: string;
    data: TranslationBundle['home']['modes']['deaf'];
  }[] = [
    {
      id: 'deaf',
      icon: EarOff,
      accentBg: 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/70',
      accentIcon: 'text-indigo-600 dark:text-indigo-400',
      buttonClass:
        'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20',
      data: t.home.modes.deaf,
    },
    {
      id: 'mute',
      icon: MessageSquareText,
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/70',
      accentIcon: 'text-emerald-600 dark:text-emerald-400',
      buttonClass:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20',
      data: t.home.modes.mute,
    },
    {
      id: 'blind',
      icon: EyeOff,
      accentBg: 'bg-slate-100 dark:bg-slate-800/80 border border-slate-300/70 dark:border-slate-700',
      accentIcon: 'text-slate-900 dark:text-white',
      buttonClass:
        'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-md shadow-slate-900/15',
      data: t.home.modes.blind,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-8 sm:space-y-12">
      {/* Hero Section */}
      <section className="max-w-3xl space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-emerald-400 tracking-wide">
          {t.home.eyebrow}
        </p>
        <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] [text-wrap:balance]">
          {t.home.headline}
        </h1>
        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
          {t.home.subheadline}
        </p>
      </section>

      {/* Select Conversation Mode Dashboard */}
      <section aria-labelledby="mode-dashboard-heading" className="space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
          <div className="space-y-1">
            <h2
              id="mode-dashboard-heading"
              className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              {t.home.dashboardTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              {t.home.dashboardSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {modes.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700/80 transition-all duration-200"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.accentBg}`}
                      >
                        <Icon className={`w-7 h-7 ${item.accentIcon}`} />
                      </div>
                      {item.id === 'deaf' && (
                        <div
                          aria-hidden="true"
                          className="w-11 h-11 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
                        >
                          <SignLanguageIcon className="w-5 h-5" />
                        </div>
                      )}
                      {item.id === 'blind' && (
                        <div
                          aria-hidden="true"
                          className="h-11 px-3 rounded-xl bg-slate-100/90 dark:bg-slate-800/70 border border-slate-300/60 dark:border-slate-700 flex items-center gap-2.5 text-slate-800 dark:text-slate-100"
                        >
                          <BrailleCell dots={[1, 2]} size="sm" />
                          <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-mono-tabular font-semibold text-slate-500 dark:text-slate-400">
                      0{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.data.audience}
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {item.data.title}
                    </h3>
                    <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.data.description}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {item.data.features}
                  </p>
                </div>

                <div className="pt-6 mt-6">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectMode(item.id)}
                    className={`w-full min-h-[56px] px-6 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-colors cursor-pointer whitespace-nowrap ${item.buttonClass}`}
                  >
                    <span>{t.home.enterMode}</span>
                    <ArrowIcon className="w-5 h-5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  </motion.button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* Browser Speech Capabilities & Voice Readiness Bar */}
      <section
        aria-label={t.home.readinessTitle}
        className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t.home.readinessSpeechSupport}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {sttReady ? t.home.supported : t.home.fallbackReady}
              </p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-9 bg-slate-200 dark:bg-slate-800" />

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
              <Captions className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t.home.readinessSynthesisSupport}
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {ttsReady ? t.home.supported : t.speech.speechUnsupported}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={isSpeaking ? onStopVoice : onTestVoice}
          disabled={!ttsReady}
          className="min-h-[48px] px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-sm flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{isSpeaking ? t.controls.stopAudio : t.controls.testAudio}</span>
        </button>
      </section>
    </div>
  );
}
