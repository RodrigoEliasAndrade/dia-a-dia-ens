import { useState } from 'react';
import { useFontSize, type FontSizePreset } from '../../hooks/useFontSize';

/**
 * Global floating "Aa" button — always visible on every screen.
 * Opens a dropdown to change font size without losing progress.
 */
export default function FloatingFontSize() {
  const { preset, setPreset, presets, labels } = useFontSize();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-3 right-3 z-[60]">
      <button
        onClick={() => setOpen(!open)}
        className={`
          w-9 h-9 flex items-center justify-center rounded-full shadow-lg
          transition-all backdrop-blur-sm
          ${open
            ? 'bg-ens-blue text-white scale-110'
            : 'bg-white/90 text-ens-blue border border-gray-200'
          }
        `}
        aria-label="Tamanho da letra"
      >
        <span className="font-bold text-xs">Aa</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[59]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-[61] bg-white rounded-xl shadow-lg border border-gray-200 p-2 w-40">
            {presets.map((p: FontSizePreset) => (
              <button
                key={p}
                onClick={() => { setPreset(p); setOpen(false); }}
                className={`
                  w-full py-1.5 px-3 rounded-lg text-xs font-medium text-left transition-all
                  ${preset === p
                    ? 'bg-ens-blue text-white'
                    : 'text-ens-text hover:bg-gray-100'
                  }
                `}
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
