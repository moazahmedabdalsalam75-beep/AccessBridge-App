import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language, TranslationBundle } from '../i18n/translations';

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [altIndex: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onsoundstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export type SpeechErrorCode =
  | 'not-allowed'
  | 'service-not-allowed'
  | 'audio-capture'
  | 'network'
  | 'language-not-supported'
  | 'no-speech'
  | 'unsupported'
  | 'other';

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isRunningInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function getSpeechLangCode(lang: Language): string {
  return lang === 'ar' ? 'ar-SA' : 'en-US';
}

export function getSpeechErrorMessage(error: SpeechErrorCode, t: TranslationBundle): string {
  switch (error) {
    case 'not-allowed':
      return t.speech.micDenied;
    case 'service-not-allowed':
      return t.speech.micServiceNotAllowed;
    case 'audio-capture':
      return t.speech.micAudioCapture;
    case 'network':
      return t.speech.micNetwork;
    case 'unsupported':
      return t.speech.micUnsupported;
    case 'no-speech':
      return t.speech.noSpeechDetected;
    default:
      return t.speech.micServiceNotAllowed;
  }
}

export function playTactileTone(kind: 'yes' | 'no' | 'hold' | 'done' | 'error'): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (kind === 'yes') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.14);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (kind === 'no') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.16);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (kind === 'hold') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (kind === 'done') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.16);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.21);
    }

    setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 350);
  } catch {
    // Ignore audio context autoplay errors
  }
}

export function unlockSpeechSynthesis(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    const silent = new SpeechSynthesisUtterance(' ');
    silent.volume = 0;
    silent.rate = 10;
    window.speechSynthesis.speak(silent);
  } catch {
    // Ignore unlock failures
  }
}

export interface UseSpeechSynthesisReturn {
  supported: boolean;
  isSpeaking: boolean;
  speak: (text: string, lang: Language, options?: { rate?: number; onEnd?: () => void }) => void;
  stop: () => void;
}

function detectUtteranceLanguage(text: string, fallbackLang: Language): Language {
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text)) {
    return 'ar';
  }
  if (/[A-Za-z]/.test(text)) {
    return 'en';
  }
  return fallbackLang;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const supported = isSpeechSynthesisSupported();
  const speakTimerRef = useRef<number | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported) return;
    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      if (list.length > 0) setVoices(list);
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (speakTimerRef.current !== null) {
      window.clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    activeUtteranceRef.current = null;
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cancel errors
    }
    setIsSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, lang: Language, options?: { rate?: number; onEnd?: () => void }) => {
      const trimmed = text.trim();
      if (!trimmed || !supported) {
        options?.onEnd?.();
        return;
      }

      if (speakTimerRef.current !== null) {
        window.clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }

      const startUtterance = () => {
        const effectiveLang = detectUtteranceLanguage(trimmed, lang);
        const utterance = new SpeechSynthesisUtterance(trimmed);
        const targetLang = getSpeechLangCode(effectiveLang);
        utterance.lang = targetLang;
        utterance.rate = options?.rate ?? 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
        const langPrefix = effectiveLang === 'ar' ? 'ar' : 'en';
        const preferredVoice =
          availableVoices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase()) ??
          availableVoices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
          utterance.lang = preferredVoice.lang || targetLang;
        }

        // Retain reference to prevent browser GC from silently stopping playback mid-sentence
        activeUtteranceRef.current = utterance;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          if (activeUtteranceRef.current === utterance) {
            activeUtteranceRef.current = null;
          }
          setIsSpeaking(false);
          options?.onEnd?.();
        };
        utterance.onerror = () => {
          if (activeUtteranceRef.current === utterance) {
            activeUtteranceRef.current = null;
          }
          setIsSpeaking(false);
          options?.onEnd?.();
        };

        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          setIsSpeaking(true);
          window.speechSynthesis.speak(utterance);
        } catch {
          activeUtteranceRef.current = null;
          setIsSpeaking(false);
          options?.onEnd?.();
        }
      };

      const wasActive = window.speechSynthesis.speaking || window.speechSynthesis.pending;
      if (wasActive) {
        window.speechSynthesis.cancel();
        // Brief pause after cancel avoids Chromium dropping the next utterance
        speakTimerRef.current = window.setTimeout(() => {
          speakTimerRef.current = null;
          startUtterance();
        }, 65);
      } else {
        startUtterance();
      }
    },
    [supported, voices]
  );

  useEffect(() => {
    return () => {
      if (speakTimerRef.current !== null) {
        window.clearTimeout(speakTimerRef.current);
      }
      activeUtteranceRef.current = null;
      if (supported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

  return { supported, isSpeaking, speak, stop };
}

export interface UseSpeechRecognitionOptions {
  lang: Language;
  continuous?: boolean;
  onFinalResult?: (transcript: string) => void;
}

export interface UseSpeechRecognitionReturn {
  supported: boolean;
  isListening: boolean;
  interimTranscript: string;
  finalTranscript: string;
  audioLevels: number[];
  error: SpeechErrorCode | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
}

const DEFAULT_LEVELS = [0.18, 0.25, 0.22, 0.3, 0.24, 0.28, 0.2, 0.26, 0.19];

export function useSpeechRecognition({
  lang,
  continuous = true,
  onFinalResult,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const supported = isSpeechRecognitionSupported();
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [audioLevels, setAudioLevels] = useState<number[]>(DEFAULT_LEVELS);
  const [error, setError] = useState<SpeechErrorCode | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const onFinalResultRef = useRef(onFinalResult);
  const restartTimerRef = useRef<number | null>(null);
  const waveIntervalRef = useRef<number | null>(null);
  const speechBoostUntilRef = useRef(0);
  const langCandidateIndexRef = useRef(0);
  const latestInterimRef = useRef('');
  const hadFinalInSessionRef = useRef(false);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  }, [onFinalResult]);

  useEffect(() => {
    langCandidateIndexRef.current = 0;
  }, [lang]);

  const stopWaveAnimator = useCallback(() => {
    if (waveIntervalRef.current !== null) {
      window.clearInterval(waveIntervalRef.current);
      waveIntervalRef.current = null;
    }
    setAudioLevels(DEFAULT_LEVELS);
  }, []);

  const startWaveAnimator = useCallback(() => {
    if (waveIntervalRef.current !== null) {
      window.clearInterval(waveIntervalRef.current);
    }
    waveIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const speaking = now < speechBoostUntilRef.current;
      const base = speaking ? 0.45 : 0.24;
      const spread = speaking ? 0.52 : 0.22;
      setAudioLevels(
        Array.from({ length: 9 }, (_, i) => {
          const wave = Math.sin(now / 150 + i * 0.7) * 0.5 + 0.5;
          return Math.max(0.18, Math.min(1, base + wave * spread));
        })
      );
    }, 95);
  }, []);

  const commitPendingInterim = useCallback(() => {
    const pending = latestInterimRef.current.trim();
    if (pending && !hadFinalInSessionRef.current) {
      hadFinalInSessionRef.current = true;
      latestInterimRef.current = '';
      setFinalTranscript((prev) => (prev ? `${prev} ${pending}` : pending));
      setInterimTranscript('');
      onFinalResultRef.current?.(pending);
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
    stopWaveAnimator();
    if (recognitionRef.current) {
      const current = recognitionRef.current;
      recognitionRef.current = null;
      try {
        current.stop();
      } catch {
        // Ignore stop errors
      }
    }
    commitPendingInterim();
  }, [commitPendingInterim, stopWaveAnimator]);

  const getLangCandidates = (targetLang: Language): string[] => {
    return targetLang === 'ar' ? ['ar-SA', 'ar-EG', 'ar'] : ['en-US', 'en-GB', 'en'];
  };

  const launchRecognition = useCallback(() => {
    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor) {
      setError('unsupported');
      setIsListening(false);
      shouldKeepListeningRef.current = false;
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore abort errors
      }
      recognitionRef.current = null;
    }

    // Cancel active TTS so mobile/desktop mics don't stay muted by SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }

    const candidates = getLangCandidates(lang);
    const chosenLang =
      candidates[Math.min(langCandidateIndexRef.current, candidates.length - 1)] ??
      getSpeechLangCode(lang);

    const recognition = new RecognitionCtor();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = chosenLang;
    recognition.maxAlternatives = 1;
    latestInterimRef.current = '';
    hadFinalInSessionRef.current = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      startWaveAnimator();
    };

    recognition.onaudiostart = () => {
      speechBoostUntilRef.current = Date.now() + 800;
    };

    recognition.onsoundstart = () => {
      speechBoostUntilRef.current = Date.now() + 1200;
    };

    recognition.onspeechstart = () => {
      speechBoostUntilRef.current = Date.now() + 2000;
    };

    recognition.onspeechend = () => {
      speechBoostUntilRef.current = Date.now() + 250;
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      speechBoostUntilRef.current = Date.now() + 1600;
      setError(null);
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? '';
        if (result.isFinal) {
          finalChunk += transcript;
        } else {
          interim += transcript;
        }
      }

      const trimmedInterim = interim.trim();
      latestInterimRef.current = trimmedInterim;
      setInterimTranscript(trimmedInterim);

      if (finalChunk.trim()) {
        const cleaned = finalChunk.trim();
        hadFinalInSessionRef.current = true;
        latestInterimRef.current = '';
        setFinalTranscript((prev) => (prev ? `${prev} ${cleaned}` : cleaned));
        setInterimTranscript('');
        onFinalResultRef.current?.(cleaned);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      const code = event.error;
      if (code === 'aborted') {
        return;
      }

      if (code === 'no-speech') {
        setError('no-speech');
        return;
      }

      if (code === 'language-not-supported') {
        const nextIndex = langCandidateIndexRef.current + 1;
        if (nextIndex < candidates.length) {
          langCandidateIndexRef.current = nextIndex;
          return;
        }
      }

      // Fatal mic / permission / network error: stop loop cleanly
      shouldKeepListeningRef.current = false;
      setIsListening(false);
      stopWaveAnimator();

      if (code === 'not-allowed') {
        setError('not-allowed');
      } else if (code === 'service-not-allowed') {
        setError('service-not-allowed');
      } else if (code === 'audio-capture') {
        setError('audio-capture');
      } else if (code === 'network') {
        setError('network');
      } else if (code === 'language-not-supported') {
        setError('language-not-supported');
      } else {
        setError('other');
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) {
        return;
      }
      recognitionRef.current = null;

      if (shouldKeepListeningRef.current && continuous) {
        if (restartTimerRef.current !== null) {
          window.clearTimeout(restartTimerRef.current);
        }
        restartTimerRef.current = window.setTimeout(() => {
          restartTimerRef.current = null;
          if (shouldKeepListeningRef.current) {
            launchRecognition();
          }
        }, 180);
        return;
      }

      shouldKeepListeningRef.current = false;
      setIsListening(false);
      stopWaveAnimator();
      commitPendingInterim();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      shouldKeepListeningRef.current = false;
      setIsListening(false);
      stopWaveAnimator();
      setError('other');
    }
  }, [commitPendingInterim, continuous, lang, startWaveAnimator, stopWaveAnimator]);

  const startListening = useCallback(() => {
    setError(null);
    if (!supported) {
      setError('unsupported');
      return;
    }
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    shouldKeepListeningRef.current = true;
    launchRecognition();
  }, [launchRecognition, supported]);

  const toggleListening = useCallback(() => {
    if (isListening || shouldKeepListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  // Restart recognition smoothly when language changes while active
  useEffect(() => {
    if (isListening) {
      stopListening();
      const timer = window.setTimeout(() => {
        startListening();
      }, 180);
      return () => window.clearTimeout(timer);
    }
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      if (restartTimerRef.current !== null) {
        window.clearTimeout(restartTimerRef.current);
      }
      stopWaveAnimator();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [stopWaveAnimator]);

  return {
    supported,
    isListening,
    interimTranscript,
    finalTranscript,
    audioLevels,
    error,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}

export interface UseVoiceClipRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  recordingError: SpeechErrorCode | null;
}

export function useVoiceClipRecorder(
  onClipReady: (audioUrl: string) => void
): UseVoiceClipRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<SpeechErrorCode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onClipReadyRef = useRef(onClipReady);

  useEffect(() => {
    onClipReadyRef.current = onClipReady;
  }, [onClipReady]);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        cleanupStream();
        setIsRecording(false);
      }
    } else {
      cleanupStream();
      setIsRecording(false);
    }
  }, [cleanupStream]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setRecordingError(null);
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setRecordingError('unsupported');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        cleanupStream();
        setIsRecording(false);
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          onClipReadyRef.current(url);
        }
      };

      recorder.onerror = () => {
        mediaRecorderRef.current = null;
        cleanupStream();
        setIsRecording(false);
        setRecordingError('audio-capture');
      };

      recorder.start();
      setIsRecording(true);
      return true;
    } catch {
      cleanupStream();
      setIsRecording(false);
      setRecordingError('not-allowed');
      return false;
    }
  }, [cleanupStream]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Ignore
        }
      }
      cleanupStream();
    };
  }, [cleanupStream]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    recordingError,
  };
}

