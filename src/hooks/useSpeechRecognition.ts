import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Web Speech API hook for voice-to-text transcription.
 *
 * Uses the browser's built-in SpeechRecognition (no external services).
 * Supports Portuguese (pt-BR) and works on Chrome, Edge, Safari 14.1+.
 * Falls back gracefully — `isSupported` will be false on unsupported browsers.
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
  const processedUpToRef = useRef<number>(0); // tracks which result indices we already appended

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionAPI;

  const startListening = useCallback(
    (onResult: (text: string) => void) => {
      if (!SpeechRecognitionAPI) return;

      // Stop any existing recognition
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      onResultRef.current = onResult;
      processedUpToRef.current = 0;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        // Loop through ALL results, but only collect final transcripts
        // from indices we haven't processed yet (prevents duplication
        // on mobile where resultIndex can stay at 0).
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            if (i >= processedUpToRef.current) {
              finalTranscript += result[0].transcript;
              processedUpToRef.current = i + 1;
            }
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
        // 'no-speech' and 'aborted' are not real errors
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition error:', event.error);
        }
        setIsListening(false);
        setInterimText('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch {
        setIsListening(false);
      }
    },
    [SpeechRecognitionAPI]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
