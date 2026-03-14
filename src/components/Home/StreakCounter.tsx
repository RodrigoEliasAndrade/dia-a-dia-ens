interface StreakCounterProps {
  monthlyCount: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
}

export default function StreakCounter({
  monthlyCount,
  currentStreak,
  longestStreak,
  totalCompletions,
}: StreakCounterProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
      <div className="bg-white rounded-xl p-4 shadow-sm text-center">
        <div className="text-3xl mb-1">🔥</div>
        <div className="text-2xl font-bold text-ens-blue">{monthlyCount}</div>
        <div className="text-xs text-ens-text-light">dias este mês</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm text-center">
        <div className="text-3xl mb-1">⚡</div>
        <div className="text-2xl font-bold text-ens-blue">{currentStreak}</div>
        <div className="text-xs text-ens-text-light">dias consecutivos</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm text-center">
        <div className="text-3xl mb-1">🏆</div>
        <div className="text-2xl font-bold text-ens-gold">{longestStreak}</div>
        <div className="text-xs text-ens-text-light">maior sequência</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm text-center">
        <div className="text-3xl mb-1">🙏</div>
        <div className="text-2xl font-bold text-ens-gold">{totalCompletions}</div>
        <div className="text-xs text-ens-text-light">orações totais</div>
      </div>
    </div>
  );
}
