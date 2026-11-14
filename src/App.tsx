import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  TRANSLATIONS,
  type ConversationMode,
  type Language,
} from './i18n/translations';
import { useSpeechSynthesis } from './hooks/useSpeech';
import { TopBar } from './components/TopBar';
import { HomeDashboard } from './components/HomeDashboard';
import { DeafMode } from './components/DeafMode';
import { MuteMode } from './components/MuteMode';
import { BlindMode } from './components/BlindMode';

export default function App() {
  const [mode, setMode] = useState<ConversationMode>('home');
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('accessbridge_lang');
      if (saved === 'ar' || saved === 'en') return saved;
    }
    return 'en';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('accessbridge_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    }
    return false;
  });

  const { isSpeaking, speak, stop } = useSpeechSynthesis();
  const t = TRANSLATIONS[lang];

  // Sync HTML dir and lang attributes for seamless LTR/RTL switching
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem('accessbridge_lang', lang);
  }, [lang]);

  // Sync Tailwind .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('accessbridge_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleSelectMode = (nextMode: ConversationMode) => {
    stop();
    setMode(nextMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLang = () => {
    stop();
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleTestVoice = () => {
    const sample =
      lang === 'ar'
        ? 'مرحباً بكم في أكسس بريدج. الصوت واضح وجاهز للمحادثة.'
        : 'Welcome to AccessBridge. Audio output is clear and ready for conversation.';
    speak(sample, lang);
  };

  const mobileNavItems: { id: ConversationMode; label: string }[] = [
    { id: 'home', label: t.nav.home },
    { id: 'deaf', label: t.nav.deaf },
    { id: 'mute', label: t.nav.mute },
    { id: 'blind', label: t.nav.blind },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 relative overflow-x-clip">
        {/* Subtle Ambient Mesh Backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden z-0"
        >
          <div className="absolute -top-40 start-1/4 w-[520px] h-[520px] rounded-full bg-indigo-500/8 dark:bg-indigo-500/12 blur-3xl" />
          <div className="absolute top-1/3 end-1/5 w-[460px] h-[460px] rounded-full bg-emerald-500/8 dark:bg-emerald-500/10 blur-3xl" />
        </div>

        <TopBar
          mode={mode}
          onSelectMode={handleSelectMode}
          lang={lang}
          onToggleLang={handleToggleLang}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          t={t}
        />

        {/* Scrollable Mobile/Tablet Mode Switcher (shown on Home only so active conversations get full viewport height) */}
        {mode === 'home' && (
          <div className="lg:hidden relative z-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm">
            <nav
              aria-label="Quick mode switcher"
              className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto"
            >
              {mobileNavItems.map((item) => {
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMode(item.id)}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        <main className={`flex-1 relative z-10 ${mode === 'home' ? 'pb-12' : 'pb-0'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${lang}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {mode === 'home' && (
                <HomeDashboard
                  lang={lang}
                  t={t}
                  onSelectMode={handleSelectMode}
                  onTestVoice={handleTestVoice}
                  isSpeaking={isSpeaking}
                  onStopVoice={stop}
                />
              )}
              {mode === 'deaf' && (
                <DeafMode
                  lang={lang}
                  t={t}
                  onBack={() => handleSelectMode('home')}
                  speak={(text, targetLang) => speak(text, targetLang)}
                  isSpeaking={isSpeaking}
                />
              )}
              {mode === 'mute' && (
                <MuteMode
                  lang={lang}
                  t={t}
                  onBack={() => handleSelectMode('home')}
                  speak={(text, targetLang) => speak(text, targetLang)}
                  stopSpeaking={stop}
                  isSpeaking={isSpeaking}
                />
              )}
              {mode === 'blind' && (
                <BlindMode
                  lang={lang}
                  t={t}
                  onBack={() => handleSelectMode('home')}
                  speak={speak}
                  stopSpeaking={stop}
                  isSpeaking={isSpeaking}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  );
}
