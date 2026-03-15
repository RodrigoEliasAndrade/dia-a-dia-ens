import { useFontSize, type FontSizePreset } from '../../hooks/useFontSize';

/**
 * Font size selector — 3 presets: Normal, Grande, Extra Grande.
 * Placed on the CasalPage so users (especially elderly) can easily
 * increase text size across the entire app.
 */
export default function FontSizeControl() {
  const { preset, setPreset, presets, labels } = useFontSize();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold text-ens-blue text-sm mb-3">
        🔤 Tamanho da Letra
      </h3>
      <div className="flex gap-2">
        {presets.map((p: FontSizePreset) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={`
              flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
              ${preset === p
                ? 'bg-ens-blue text-white shadow-md'
                : 'bg-ens-blue/5 text-ens-text hover:bg-ens-blue/10'
              }
            `}
          >
            {labels[p]}
          </button>
        ))}
      </div>
      <p className="text-[0.625rem] text-ens-text-light mt-2 text-center">
        A mudança se aplica em toda a app
      </p>
    </div>
  );
}
