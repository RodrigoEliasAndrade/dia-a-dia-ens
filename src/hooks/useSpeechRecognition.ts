import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Web Speech API hook for voice-to-text transcription.
 *
 * Uses the browser's built-in SpeechRecognition (no external services).
 * Supports Portuguese (pt-BR) and works on Chrome, Edge, Safari 14.1+.
 * Falls back gracefully — `isSupported` will be false on unsupported browsers.
 *
 * ARCHITECTURE: Uses `continuous: false` + auto-restart.
 * Mobile browsers (especially Android Chrome) have bugs with `continuous: true`
 * that cause duplicated results. Instead, we run short recognition sessions
 * and automatically restart when each one ends — giving the same user experience
 * without the duplication bug. This also handles the "stops on pause" problem
 * since we restart after every natural pause.
 */

// TypeScript declarations for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onResultRef = useRef<((text: string) => void) | null>(null);
  const wantsToListenRef = useRef(false); // true = user wants mic on, false = user stopped

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionAPI;

  // Internal: create and start a single recognition session
  const startSession = useCallback(() => {
    if (!SpeechRecognitionAPI || !wantsToListenRef.current) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;   // ONE phrase per session — no duplication
    recognition.interimResults = true; // show real-time preview
    recognition.lang = 'pt-BR';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setInterimText(interimTranscript);

      if (finalTranscript && onResultRef.current) {
        onResultRef.current(finalTranscript);
        setInterimText('');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // These are normal — happen on silence or when we abort
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return; // onend will fire and handle restart
      }
      // Real error (e.g. 'not-allowed', 'network') — stop completely
      console.warn('Speech recognition error:', event.error);
      wantsToListenRef.current = false;
      setIsListening(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setInterimText('');
      // Auto-restart if user still wants to listen
      if (wantsToListenRef.current) {
        // Small delay prevents rapid restart loops on some devices
        setTimeout(() => {
          if (wantsToListenRef.current) {
            startSession();
          } else {
            setIsListening(false);
          }
        }, 150);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      wantsToListenRef.current = false;
      setIsListening(false);
    }
  }, [SpeechRecognitionAPI]);

  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (!SpeechRecognitionAPI) return;

      // Stop any existing recognition
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }

      onResultRef.current = onResult;
      wantsToListenRef.current = true;
      startSession();
    },
    [SpeechRecognitionAPI, startSession]
  );

  const stopListening = useCallback(() => {
    wantsToListenRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wantsToListenRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    interimText,
    startListening,
    stopListening,
  };
}
