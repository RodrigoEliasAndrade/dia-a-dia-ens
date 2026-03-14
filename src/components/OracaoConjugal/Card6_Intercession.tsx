import { useState } from 'react';

const prayerOptions = [
  { id: 'spontaneous', label: 'Oração espontânea', emoji: '💬', desc: 'Rezem livremente, em voz alta, um de cada vez' },
  { id: 'rosary', label: 'Mistério do Rosário', emoji: '📿', desc: 'Rezem um mistério do terço juntos' },
  { id: 'psalm', label: 'Salmo 127 ou 128', emoji: '📖', desc: 'Salmos da família — leiam alternando versículos' },
  { id: 'intentions', label: 'Intenções livres', emoji: '🕊️', desc: 'Cada um coloca suas intenções diante de Deus' },
];

export default function Card6_Intercession() {
  const [selected, setSelected] = useState<string | null>(null);
  const [intentions, setIntentions] = useState(['', '']);

  return (
    <div className="space-y-5">
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
        <p className="text-sm text-purple-700">
          ✨ Variem as formas de oração — não se prendam a uma só
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-ens-blue text-sm">Escolham uma forma de oração:</h3>
        {prayerOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setSelected(option.id)}
            className={`
              w-full text-left p-4 rounded-xl transition-all
              ${selected === option.id
                ? 'bg-ens-blue text-white shadow-md'
                : 'bg-gray-50 border border-gray-200'}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{option.emoji}</span>
              <div>
                <p className={`font-semibold text-sm ${selected === option.id ? 'text-white' : 'text-ens-text'}`}>
                  {option.label}
                </p>
                <p className={`text-xs mt-0.5 ${selected === option.id ? 'text-white/80' : 'text-ens-text-light'}`}>
                  {option.desc}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected === 'intentions' && (
        <div className="space-y-3">
          <h3 className="font-semibold text-ens-blue text-sm">Intenções de oração:</h3>
          {intentions.map((intention, i) => (
            <textarea
              key={i}
              value={intention}
              onChange={e => {
                const next = [...intentions];
                next[i] = e.target.value;
                setIntentions(next);
              }}
              placeholder={`Intenção ${i + 1} (opcional)`}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-ens-text
                placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
              rows={2}
            />
          ))}
          <button
            onClick={() => setIntentions(prev => [...prev, ''])}
            className="text-xs text-ens-blue font-medium"
          >
            + Adicionar intenção
          </button>
        </div>
      )}

      {selected === 'psalm' && (
        <div className="bg-ens-cream rounded-xl p-4 border border-gray-200">
          <h4 className="font-semibold text-ens-blue text-sm mb-2">Salmo 128 (127)</h4>
          <p className="text-ens-text text-sm leading-relaxed">
            Feliz todo aquele que teme o Senhor e anda nos seus caminhos!{'\n\n'}
            Do trabalho das tuas mãos comerás, serás feliz e tudo te irá bem.{'\n\n'}
            A tua esposa será como vide fecunda no interior da tua casa;
            os teus filhos como rebentos de oliveira ao redor da tua mesa.{'\n\n'}
            Assim será abençoado o homem que teme o Senhor.
          </p>
        </div>
      )}
    </div>
  );
}
