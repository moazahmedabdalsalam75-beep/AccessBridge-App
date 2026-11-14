import { AlertCircle, ExternalLink } from 'lucide-react';
import type { TranslationBundle } from '../i18n/translations';
import {
  getSpeechErrorMessage,
  isRunningInIframe,
  type SpeechErrorCode,
} from '../hooks/useSpeech';

interface SpeechErrorBannerProps {
  error: SpeechErrorCode | null;
  t: TranslationBundle;
}

export function SpeechErrorBanner({ error, t }: SpeechErrorBannerProps) {
  if (!error) return null;

  const message = getSpeechErrorMessage(error, t);
  const showNewTabAction =
    isRunningInIframe() &&
    (error === 'not-allowed' ||
      error === 'service-not-allowed' ||
      error === 'unsupported' ||
      error === 'other');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '#';

  return (
    <div
      role="alert"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-medium text-amber-900 dark:text-amber-100 bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 rounded-2xl px-4 py-3.5"
    >
      <div className="flex items-start sm:items-center gap-2.5">
        <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
        <span>{message}</span>
      </div>

      {showNewTabAction && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
        >
          <span>{t.speech.openInNewTab}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
