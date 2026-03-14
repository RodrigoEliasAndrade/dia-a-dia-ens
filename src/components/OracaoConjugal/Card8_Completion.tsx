import { useState } from 'react';
import { PartyPopper, Save } from 'lucide-react';

interface Card8Props {
  duration: number;
  currentStreak: number;
  monthlyCount: number;
  onSave: (journalEntry?: string) => void;
  saved: boolean;
}

export default function Card8_Completion({
  duration,
  currentStreak,
  monthlyCount,
  onSave,
  saved,
}: Card8Props) {
  const [journal, setJournal] = useState('');

  return (
    <div className="space-y-5">
      <div className="text-center py-4">
        <PartyPopper className="w-16 h-16 text-ens-gold mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-ens-blue">Glória a Deus!</h3>
        <p className="text-ens-text-light mt-1">Oração conjugal completada</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-ens-blue/5 rounded-xl p-3 text-center">
          <div className="text-2xl">⏱️</div>
          <div className="text-lg font-bold text-ens-blue">{duration} min</div>
          <div className="text-[10px] text-ens-text-light">duração</div>
        </div>
        <div className="bg-ens-blue/5 rounded-xl p-3 text-center">
          <div className="text-2xl">🔥</div>
          <div className="text-lg font-bold text-ens-blue">{currentStreak + 1}</div>
          <div className="text-[10px] text-ens-text-light">dias seguidos</div>
        </div>
        <div className="bg-ens-blue/5 rounded-xl p-3 text-center">
          <div className="text-2xl">📅</div>
          <div className="text-lg font-bold text-ens-blue">{monthlyCount + 1}</div>
          <div className="text-[10px] text-ens-text-light">este mês</div>
        </div>
      </div>

      {/* Journal */}
      <div>
        <h3 className="font-semibold text-ens-blue text-sm mb-2">
          📝 Diário de oração (opcional)
        </h3>
        <textarea
          value={journal}
          onChange={e => setJournal(e.target.value)}
          placeholder="Como foi a oração de hoje? O que Deus falou ao nosso coração?"
          className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-ens-text
            placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-ens-blue/30"
          rows={4}
          disabled={saved}
        />
      </div>

      {!saved ? (
        <button
          onClick={() => onSave(journal || undefined)}
          className="w-full py-4 rounded-xl bg-ens-gold text-white font-bold text-lg shadow-lg
            transition-all active:scale-[0.97] animate-pulse-glow"
        >
          <Save className="w-5 h-5 inline mr-2" />
          Salvar Oração
        </button>
      ) : (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-green-600 font-semibold">Oração salva com sucesso!</p>
          <p className="text-xs text-ens-text-light mt-1">
            Que Deus abençoe a noite de vocês 🌙
          </p>
        </div>
      )}
    </div>
  );
}
