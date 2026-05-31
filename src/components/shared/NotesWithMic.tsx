import { useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface NotesWithMicProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

/**
 * Shared textarea + mic dictation widget. Replaces the duplicated logic
 * that was inlined into CardFlow, OracaoPessoalFlow and DeverSentarFlow.
 */
export default function NotesWithMic({
  value,
  onChange,
  placeholder = 'Escreva ou dite suas anotações...',
  rows = 5,
  className = '',
}: NotesWithMicProps) {
  const { isSupported, isListening, interimText, startListening, stopListening } =
    useSpeechRecognition();
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(text => {
        const current = valueRef.current;
        const sep = current && !current.endsWith(' ') && !current.endsWith('\n') ? ' ' : '';
        onChange(current + sep + text);
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-white text-sm text-ens-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 resize-none"
      />

      {isSupported && (
        <button
          type="button"
          onClick={handleMicClick}
          aria-label={isListening ? 'Parar ditado' : 'Iniciar ditado'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-ens-blue'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      )}

      {isListening && interimText && (
        <p className="text-xs text-ens-blue italic mt-1 px-1">
          <span className="opacity-60">Ouvindo:</span> {interimText}
        </p>
      )}
    </div>
  );
}
