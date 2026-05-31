import { useState } from 'react';
import { Type } from 'lucide-react';
import { useFontSize, type FontSizePreset } from '../../hooks/useFontSize';

interface FontSizeToggleProps {
  /** When true, renders as a floating circular button. Default: false (inline button). */
  floating?: boolean;
}

export default function FontSizeToggle({ floating = false }: FontSizeToggleProps) {
  const { preset, setPreset, presets, labels } = useFontSize();
  const [open, setOpen] = useState(false);

  const triggerClass = floating
    ? 'fixed bottom-24 right-4 z-40 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-ens-blue'
    : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 text-ens-blue text-xs font-medium';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={triggerClass}
        aria-label="Tamanho da fonte"
      >
        <Type className="w-4 h-4" />
        {!floating && <span>{labels[preset]}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={
              floating
                ? 'absolute bottom-full right-0 mb-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-2 w-40'
                : 'absolute top-full right-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-2 w-40'
            }
          >
            {presets.map((p: FontSizePreset) => (
              <button
                key={p}
                onClick={() => {
                  setPreset(p);
                  setOpen(false);
                }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium text-left transition-all ${
                  preset === p ? 'bg-ens-blue text-white' : 'text-ens-text hover:bg-gray-100'
                }`}
              >
                {labels[p]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
