import { Languages, Moon, Sun } from 'lucide-react';
import type { ConversationMode, Language, TranslationBundle } from '../i18n/translations';

interface TopBarProps {
  mode: ConversationMode;
  onSelectMode: (mode: ConversationMode) => void;
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  t: TranslationBundle;
}

export function TopBar({
  mode,
  onSelectMode,
  lang,
  onToggleLang,
  isDark,
  onToggleTheme,
  t,
}: TopBarProps) {
  const navItems: { id: ConversationMode; label: string }[] = [
    { id: 'home', label: t.nav.home },
    { id: 'deaf', label: t.nav.deaf },
    { id: 'mute', label: t.nav.mute },
    { id: 'blind', label: t.nav.blind },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectMode('home')}
          className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 min-h-[44px] flex items-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          {t.brand}
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Conversation modes"
          className="hidden lg:flex items-center gap-7 text-sm font-semibold"
        >
          {navItems.map((item) => {
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectMode(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'text-indigo-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-indigo-600 dark:bg-emerald-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Accessible Language & Theme Utility Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleLang}
            aria-label={t.controls.switchLanguage}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{t.controls.languageName}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? t.controls.lightMode : t.controls.darkMode}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
            <span className="hidden sm:inline">
              {isDark ? t.controls.lightMode : t.controls.darkMode}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
