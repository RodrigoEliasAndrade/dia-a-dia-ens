import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Cross } from 'lucide-react';
import { useFontSize, type FontSizePreset } from '../../hooks/useFontSize';

export default function Header() {
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const { preset, setPreset, presets, labels } = useFontSize();
  const [showFontPicker, setShowFontPicker] = useState(false);

  return (
    <header className="bg-ens-blue text-white px-5 pt-12 pb-6 relative">
      <div className="flex items-center justify-between mb-1">
        <div className="w-10" /> {/* Spacer for balance */}
        <div className="flex items-center gap-2">
          <Cross className="w-6 h-6 text-ens-gold" />
          <h1 className="text-2xl font-bold tracking-wide">ENS DIA A DIA</h1>
          <Cross className="w-6 h-6 text-ens-gold" />
        </div>
        <button
          onClick={() => setShowFontPicker(!showFontPicker)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
            showFontPicker ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
          aria-label="Tamanho da letra"
          title="Tamanho da letra"
        >
          <span className="font-bold text-sm">Aa</span>
        </button>
      </div>
      <p className="text-center text-sm text-white/70 capitalize">{today}</p>

      {/* Font size picker dropdown */}
      {showFontPicker && (
        <>
          {/* Backdrop to close */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowFontPicker(false)}
          />
          <div className="absolute right-4 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-3 w-52 animate-fade-in">
            <p className="text-xs font-semibold text-ens-blue mb-2">🔤 Tamanho da Letra</p>
            <div className="flex flex-col gap-1.5">
              {presets.map((p: FontSizePreset) => (
                <button
                  key={p}
                  onClick={() => { setPreset(p); setShowFontPicker(false); }}
                  className={`
                    py-2 px-3 rounded-lg text-sm font-medium text-left transition-all
                    ${preset === p
                      ? 'bg-ens-blue text-white'
                      : 'bg-gray-50 text-ens-text hover:bg-gray-100'
                    }
                  `}
                >
                  {labels[p]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
