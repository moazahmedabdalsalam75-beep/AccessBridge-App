import { useCallback, useEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FlipVertical2,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { Language, TranslationBundle } from '../i18n/translations';
import {
  playTactileTone,
  unlockSpeechSynthesis,
  useSpeechRecognition,
  useVoiceClipRecorder,
} from '../hooks/useSpeech';
import { AudioWave } from './AudioWave';
import { SpeechErrorBanner } from './SpeechErrorBanner';
import { DialogueStream, type DialogueMessage } from './DialogueStream';
import { BrailleCell } from './AccessibilityGuides';

interface BlindModeProps {
  lang: Language;
  t: TranslationBundle;
  onBack: () => void;
  speak: (text: string, lang: Language, options?: { rate?: number; onEnd?: () => void }) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const LONG_PRESS_MS = 550;

export function BlindMode({
  lang,
  t,
  onBack,
  speak,
  stopSpeaking,
  isSpeaking,
}: BlindModeProps) {
  const [audioGuideEnabled, setAudioGuideEnabled] = useState(true);
  const [faceToFaceFlip, setFaceToFaceFlip] = useState(true);
  const [sightedMessage, setSightedMessage] = useState('');
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [tactileFlash, setTactileFlash] = useState<'yes' | 'no' | 'voice' | null>(null);
  const [holdingSide, setHoldingSide] = useState<'left' | 'right' | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [voiceReplyActive, setVoiceReplyActive] = useState(false);

  const holdTimerRef = useRef<number | null>(null);
  const progressRafRef = useRef<number | null>(null);
  const holdTriggeredRef = useRef(false);
  const holdStartRef = useRef(0);
  const announcedOnEntryRef = useRef(false);
  const lastPointerHandledAtRef = useRef(0);

  const BackArrow = lang === 'ar' ? ArrowRight : ArrowLeft;

  const formatTime = () =>
    new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const appendMessage = useCallback(
    (role: 'partner' | 'user', text: string, audioUrl?: string) => {
      const cleaned = text.trim();
      if (!cleaned && !audioUrl) return;
      if (audioUrl) {
        audioUrlsRef.current.push(audioUrl);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role,
          speakerName: role === 'partner' ? t.blind.speakerSighted : t.blind.speakerBlind,
          text: cleaned,
          time: formatTime(),
          audioUrl,
        },
      ]);
    },
    [lang, t.blind.speakerBlind, t.blind.speakerSighted] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const audioUrlsRef = useRef<string[]>([]);
  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  const pendingAutoSpeakTimerRef = useRef<number | null>(null);
  const sightedFinalizedRef = useRef(false);

  const scheduleAutoSpeak = useCallback(
    (text: string, delayMs = 220) => {
      const cleaned = text.trim();
      if (!cleaned) return;
      if (pendingAutoSpeakTimerRef.current !== null) {
        window.clearTimeout(pendingAutoSpeakTimerRef.current);
      }
      pendingAutoSpeakTimerRef.current = window.setTimeout(() => {
        pendingAutoSpeakTimerRef.current = null;
        speak(cleaned, lang);
      }, delayMs);
    },
    [lang, speak]
  );

  const sightedStt = useSpeechRecognition({
    lang,
    continuous: false,
    onFinalResult: (spoken) => {
      sightedFinalizedRef.current = true;
      setSightedMessage('');
      appendMessage('partner', spoken);
      // Stop mic before speaking so the audio input channel doesn't mute TTS on mobile/desktop
      sightedStt.stopListening();
      scheduleAutoSpeak(spoken, 220);
    },
  });

  const blindReplyStt = useSpeechRecognition({
    lang,
    continuous: false,
    onFinalResult: (spoken) => {
      playTactileTone('done');
      appendMessage('user', spoken);
      setVoiceReplyActive(false);
      setTactileFlash('voice');
      setTimeout(() => setTactileFlash(null), 900);
      blindReplyStt.stopListening();
      scheduleAutoSpeak(spoken, 220);
    },
  });

  const sightedRecorder = useVoiceClipRecorder((audioUrl) => {
    appendMessage('partner', t.blind.voiceClipLabel, audioUrl);
    try {
      const audio = new Audio(audioUrl);
      void audio.play().catch(() => {});
    } catch {
      // <audio autoPlay> inside DialogueStream also handles playback
    }
  });

  useEffect(() => {
    if (
      blindReplyStt.error &&
      blindReplyStt.error !== 'no-speech' &&
      !blindReplyStt.isListening
    ) {
      setVoiceReplyActive(false);
    }
  }, [blindReplyStt.error, blindReplyStt.isListening]);

  const wantVoiceAutoFallbackRef = useRef(false);

  // If browser SpeechRecognition is blocked/unsupported on tap, immediately fall back to direct Voice Note recording
  useEffect(() => {
    if (
      wantVoiceAutoFallbackRef.current &&
      (sightedStt.error === 'service-not-allowed' ||
        sightedStt.error === 'unsupported' ||
        sightedStt.error === 'network')
    ) {
      wantVoiceAutoFallbackRef.current = false;
      void sightedRecorder.startRecording();
    }
  }, [sightedRecorder, sightedStt.error]);

  useEffect(() => {
    if (!announcedOnEntryRef.current && audioGuideEnabled) {
      announcedOnEntryRef.current = true;
      const timer = window.setTimeout(() => {
        speakRef.current(t.blind.guideAnnouncement, lang);
      }, 250);
      return () => window.clearTimeout(timer);
    }
  }, [audioGuideEnabled, lang, t.blind.guideAnnouncement]);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      if (progressRafRef.current) cancelAnimationFrame(progressRafRef.current);
      if (pendingAutoSpeakTimerRef.current) window.clearTimeout(pendingAutoSpeakTimerRef.current);
      audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const triggerTactileYesNo = useCallback(
    (choice: 'yes' | 'no') => {
      const word = choice === 'yes' ? t.blind.yesWord : t.blind.noWord;
      playTactileTone(choice);
      navigator.vibrate?.(choice === 'yes' ? 40 : [35, 35, 35]);
      setTactileFlash(choice);
      setTimeout(() => setTactileFlash(null), 700);
      appendMessage('user', word);
      speak(word, lang);
    },
    [appendMessage, lang, speak, t.blind.noWord, t.blind.yesWord]
  );

  const startBlindVoiceReply = useCallback(() => {
    unlockSpeechSynthesis();
    stopSpeaking();
    sightedStt.stopListening();
    sightedRecorder.stopRecording();
    playTactileTone('hold');
    navigator.vibrate?.(70);
    setVoiceReplyActive(true);
    blindReplyStt.startListening();
  }, [blindReplyStt, sightedRecorder, sightedStt, stopSpeaking]);

  const clearHoldTimers = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressRafRef.current !== null) {
      cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;
    }
    setHoldingSide(null);
    setHoldProgress(0);
  };

  const handlePadPointerDown = (side: 'left' | 'right', e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    unlockSpeechSynthesis();

    if (voiceReplyActive || blindReplyStt.isListening) {
      blindReplyStt.stopListening();
      setVoiceReplyActive(false);
      playTactileTone('done');
      holdTriggeredRef.current = true;
      return;
    }

    holdTriggeredRef.current = false;
    setHoldingSide(side);
    holdStartRef.current = performance.now();

    const tick = () => {
      const elapsed = performance.now() - holdStartRef.current;
      const pct = Math.min(1, elapsed / LONG_PRESS_MS);
      setHoldProgress(pct);
      if (pct < 1) {
        progressRafRef.current = requestAnimationFrame(tick);
      }
    };
    progressRafRef.current = requestAnimationFrame(tick);

    holdTimerRef.current = window.setTimeout(() => {
      holdTriggeredRef.current = true;
      clearHoldTimers();
      startBlindVoiceReply();
    }, LONG_PRESS_MS);
  };

  const handlePadPointerUp = (side: 'left' | 'right') => {
    const wasTriggered = holdTriggeredRef.current;
    clearHoldTimers();
    lastPointerHandledAtRef.current = Date.now();
    if (!wasTriggered) {
      triggerTactileYesNo(side === 'left' ? 'yes' : 'no');
    }
  };

  const handlePadClickFallback = (side: 'left' | 'right') => {
    // Support screen-reader (VoiceOver/TalkBack) & keyboard Enter activation cleanly
    if (Date.now() - lastPointerHandledAtRef.current < 400) return;
    triggerTactileYesNo(side === 'left' ? 'yes' : 'no');
  };

  const handlePadPointerCancel = () => {
    clearHoldTimers();
  };

  useEffect(() => {
    let spaceHeld = false;
    let spaceTimer: number | null = null;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key.toLowerCase() === 'y' && !e.repeat) {
        triggerTactileYesNo('yes');
      } else if (e.key.toLowerCase() === 'n' && !e.repeat) {
        triggerTactileYesNo('no');
      } else if (e.code === 'Space' && !e.repeat && !spaceHeld) {
        e.preventDefault();
        spaceHeld = true;
        spaceTimer = window.setTimeout(() => {
          startBlindVoiceReply();
        }, LONG_PRESS_MS);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceHeld = false;
        if (spaceTimer !== null) {
          window.clearTimeout(spaceTimer);
          spaceTimer = null;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (spaceTimer !== null) window.clearTimeout(spaceTimer);
    };
  }, [startBlindVoiceReply, triggerTactileYesNo]);

  const handleSightedSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = sightedMessage.trim();
    if (!cleaned) return;
    unlockSpeechSynthesis();
    if (sightedStt.isListening) {
      sightedStt.stopListening();
    }
    if (sightedRecorder.isRecording) {
      sightedRecorder.stopRecording();
    }
    appendMessage('partner', cleaned);
    speak(cleaned, lang);
    setSightedMessage('');
  };

  const shouldUseVoiceClipFallback =
    !sightedStt.supported ||
    sightedStt.error === 'service-not-allowed' ||
    sightedStt.error === 'unsupported' ||
    sightedStt.error === 'network';

  const handleToggleSightedMic = () => {
    unlockSpeechSynthesis();

    if (sightedRecorder.isRecording) {
      sightedRecorder.stopRecording();
      return;
    }

    if (sightedStt.isListening) {
      const pendingInterim = sightedStt.interimTranscript.trim();
      sightedStt.stopListening();
      if (pendingInterim) {
        window.setTimeout(() => {
          if (!sightedFinalizedRef.current) {
            appendMessage('partner', pendingInterim);
            scheduleAutoSpeak(pendingInterim, 60);
          }
        }, 280);
      }
      return;
    }

    sightedFinalizedRef.current = false;
    blindReplyStt.stopListening();
    setVoiceReplyActive(false);
    stopSpeaking();

    if (shouldUseVoiceClipFallback) {
      wantVoiceAutoFallbackRef.current = false;
      void sightedRecorder.startRecording();
    } else {
      wantVoiceAutoFallbackRef.current = true;
      sightedStt.startListening();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-4 min-h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] flex flex-col gap-2.5 sm:gap-3">
      {/* Slim Single-Row Header */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              wantVoiceAutoFallbackRef.current = false;
              sightedStt.stopListening();
              sightedRecorder.stopRecording();
              blindReplyStt.stopListening();
              stopSpeaking();
              onBack();
            }}
            aria-label={t.nav.backHome}
            className="min-h-[42px] px-2.5 sm:px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BackArrow className="w-4 h-4" />
            <span className="hidden sm:inline">{t.nav.backHome}</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <BrailleCell dots={[1, 2]} size="sm" />
            <h1 className="text-sm sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              {t.blind.title}
            </h1>
          </div>
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

          <button
            type="button"
            aria-pressed={audioGuideEnabled}
            aria-label={t.blind.audioGuideToggle}
            onClick={() => setAudioGuideEnabled((prev) => !prev)}
            className={`min-h-[42px] min-w-[42px] px-2.5 sm:px-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
              audioGuideEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {audioGuideEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{t.blind.audioGuideToggle}</span>
          </button>
        </div>
      </div>

      {/* Upper Dialogue Canvas + Sighted Input Bar (Rotates 180° in Face-to-Face Flip mode) */}
      <div
        className={`flex-1 min-h-[220px] sm:min-h-0 flex flex-col rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-transform ${
          faceToFaceFlip ? 'rotate-180' : ''
        }`}
      >
        <DialogueStream
          messages={messages}
          interimText={sightedStt.interimTranscript || blindReplyStt.interimTranscript}
          interimSpeaker={
            blindReplyStt.isListening ? t.blind.speakerBlind : t.blind.speakerSighted
          }
          emptyHint={t.blind.emptyFeed}
          onSpeak={(txt) => speak(txt, lang)}
          lang={lang}
          t={t}
          compact
        />

        <form
          onSubmit={handleSightedSubmit}
          className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 space-y-2 shrink-0"
        >
          {isSpeaking && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t.speech.speakingNow}</span>
              </span>
              <button
                type="button"
                onClick={stopSpeaking}
                className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold whitespace-nowrap cursor-pointer"
              >
                {t.controls.stopAudio}
              </button>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5 truncate">
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.blind.autoVoiceActive}</span>
            </span>
            {sightedRecorder.isRecording && (
              <span className="text-rose-600 dark:text-rose-400 font-bold shrink-0">
                {t.blind.recordingVoiceClip}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <input
              type="text"
              value={sightedMessage}
              onChange={(e) => setSightedMessage(e.target.value)}
              placeholder={t.blind.sightedInputPlaceholder}
              aria-label={t.blind.sightedInputPlaceholder}
              className="flex-1 min-w-0 min-h-[44px] sm:min-h-[48px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm sm:text-base font-medium"
            />
            <button
              type="submit"
              disabled={!sightedMessage.trim()}
              aria-label={t.blind.readAloudBtn}
              className="min-h-[44px] sm:min-h-[48px] px-3.5 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t.blind.readAloudBtn}</span>
            </button>
            <button
              type="button"
              onClick={handleToggleSightedMic}
              aria-label={
                sightedRecorder.isRecording
                  ? t.blind.stopRecordingClip
                  : sightedStt.isListening
                    ? t.blind.stopDictateBtn
                    : t.blind.dictateBtn
              }
              className={`min-h-[44px] min-w-[44px] sm:min-h-[48px] px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 border cursor-pointer ${
                sightedStt.isListening || sightedRecorder.isRecording
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}
            >
              {sightedStt.isListening || sightedRecorder.isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {sightedRecorder.isRecording
                  ? t.blind.stopRecordingClip
                  : sightedStt.isListening
                    ? t.blind.stopDictateBtn
                    : t.blind.dictateBtn}
              </span>
            </button>
          </div>
          <SpeechErrorBanner
            error={
              sightedRecorder.recordingError ??
              (sightedRecorder.isRecording || shouldUseVoiceClipFallback ? null : sightedStt.error)
            }
            t={t}
          />
        </form>
      </div>

      {/* Lower Dominant Tactile Reply Pad for Blind Person */}
      <div className="shrink-0 space-y-2">
        {(voiceReplyActive || blindReplyStt.isListening) && (
          <div
            role="status"
            aria-live="assertive"
            className="p-3 rounded-2xl bg-indigo-600 text-white flex items-center justify-between gap-3 shadow-lg"
          >
            <p className="text-xs sm:text-base font-extrabold">{t.blind.listeningVoiceReply}</p>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-24 hidden sm:block">
                <AudioWave active={true} levels={blindReplyStt.audioLevels} accent="emerald" />
              </div>
              <button
                type="button"
                onClick={() => {
                  blindReplyStt.stopListening();
                  setVoiceReplyActive(false);
                }}
                className="min-h-[40px] px-3 rounded-xl bg-white text-indigo-700 font-bold text-xs cursor-pointer"
              >
                {t.blind.tapToFinishReply}
              </button>
            </div>
          </div>
        )}

        <div
          dir="ltr"
          className="grid grid-cols-2 gap-2.5 sm:gap-3 select-none touch-none"
        >
          <button
            type="button"
            onClick={() => handlePadClickFallback('left')}
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={(e) => handlePadPointerDown('left', e)}
            onPointerUp={() => handlePadPointerUp('left')}
            onPointerCancel={handlePadPointerCancel}
            onPointerLeave={handlePadPointerCancel}
            aria-label={`${t.blind.tapLeftYes}: ${t.blind.yesWord}. ${t.blind.longPressTitle}`}
            className={`relative overflow-hidden min-h-[145px] sm:min-h-[200px] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center transition-all cursor-pointer ${
              tactileFlash === 'yes'
                ? 'bg-emerald-600 border-emerald-400 text-white scale-[0.99]'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/80 hover:bg-emerald-100 dark:hover:bg-emerald-950/90 text-emerald-950 dark:text-emerald-50'
            }`}
          >
            {holdingSide === 'left' && (
              <div
                aria-hidden="true"
                style={{ transform: `scaleX(${holdProgress})` }}
                className="absolute inset-x-0 bottom-0 h-2.5 bg-indigo-600 origin-left"
              />
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
              </div>
              <BrailleCell dots={[1, 3, 4, 5, 6]} size="md" label="Braille Y" />
            </div>
            <p className="text-2xl sm:text-4xl font-black tracking-tight">{t.blind.yesWord}</p>
            <p className="text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span>{t.blind.tapLeftYes}</span>
            </p>
          </button>

          <button
            type="button"
            onClick={() => handlePadClickFallback('right')}
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={(e) => handlePadPointerDown('right', e)}
            onPointerUp={() => handlePadPointerUp('right')}
            onPointerCancel={handlePadPointerCancel}
            onPointerLeave={handlePadPointerCancel}
            aria-label={`${t.blind.tapRightNo}: ${t.blind.noWord}. ${t.blind.longPressTitle}`}
            className={`relative overflow-hidden min-h-[145px] sm:min-h-[200px] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center transition-all cursor-pointer ${
              tactileFlash === 'no'
                ? 'bg-rose-600 border-rose-400 text-white scale-[0.99]'
                : 'bg-slate-900 dark:bg-slate-950 border-slate-700 hover:bg-slate-800 text-white'
            }`}
          >
            {holdingSide === 'right' && (
              <div
                aria-hidden="true"
                style={{ transform: `scaleX(${holdProgress})` }}
                className="absolute inset-x-0 bottom-0 h-2.5 bg-indigo-500 origin-left"
              />
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-600 text-white flex items-center justify-center">
                <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
              </div>
              <BrailleCell dots={[1, 3, 4, 5]} size="md" inverted label="Braille N" />
            </div>
            <p className="text-2xl sm:text-4xl font-black tracking-tight">{t.blind.noWord}</p>
            <p className="text-[11px] sm:text-xs font-bold text-slate-300 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span>{t.blind.tapRightNo}</span>
            </p>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {holdingSide ? t.blind.holdingProgress : t.blind.longPressTitle}
            </p>
            <p className="hidden sm:block text-xs font-medium text-indigo-700 dark:text-indigo-300 truncate">
              {t.blind.brailleAudioGuide}
            </p>
          </div>
          <button
            type="button"
            onClick={
              voiceReplyActive || blindReplyStt.isListening
                ? () => {
                    blindReplyStt.stopListening();
                    setVoiceReplyActive(false);
                  }
                : startBlindVoiceReply
            }
            className="min-h-[40px] px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>
              {voiceReplyActive || blindReplyStt.isListening
                ? t.blind.tapToFinishReply
                : t.blind.dictateBtn}
            </span>
          </button>
        </div>

        <SpeechErrorBanner error={blindReplyStt.error} t={t} />
      </div>
    </div>
  );
}
