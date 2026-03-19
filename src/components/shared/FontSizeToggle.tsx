import { useState } from 'react';
import { useFontSize, type FontSizePreset } from '../../hooks/useFontSize';

/**
 * Compact font size toggle for PCE flow headers.
 * Tapping opens a small dropdown to pick Normal / Grande / Extra Grande.
 * Styled to match the white-on-blue header bar.
 */
export default function FontSizeToggle() {
  const { preset, setPreset, presets, labels } = useFontSize();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-1 rounded transition-all ${open ? 'bg-white/20' : 'hover:bg-white/10'}`}
        aria-label="Tamanho da letra"
      >
        <span className="text-white font-bold text-[0.625rem]">Aa</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-2 w-40">
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
