import CoupleSetup from './CoupleSetup';
import { usePrayerTracking } from '../../hooks/usePrayerTracking';

export default function CasalPage() {
  const { conjugalData } = usePrayerTracking();

  return (
    <div className="pb-24 px-4 pt-16">
      <h1 className="text-xl font-bold text-ens-blue mb-4">Nosso Casal</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
        <div className="text-5xl mb-4">💑</div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-3xl font-bold text-ens-blue">{conjugalData.totalCompletions}</div>
            <div className="text-xs text-ens-text-light">orações juntos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-ens-gold">{conjugalData.longestStreak}</div>
            <div className="text-xs text-ens-text-light">maior sequência</div>
          </div>
        </div>
      </div>

      <CoupleSetup />

      <div className="mt-6 bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
        <p className="text-sm text-ens-text italic">
          "A oração conjugal é o respiro do amor. Não é um luxo, é oxigênio."
        </p>
        <p className="text-xs text-ens-text-light mt-2 text-right">— Padre Henri Caffarel</p>
      </div>
    </div>
  );
}
