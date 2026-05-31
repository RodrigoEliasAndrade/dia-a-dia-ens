import { format } from 'date-fns';
import Header from './Header';
import Calendar from './Calendar';
import PCECards from './PCECards';
import { usePrayerTracking } from '../../hooks/usePrayerTracking';
import { useSyncedStorage } from '../../hooks/useSyncedStorage';
import type { DeverSentarData, RegraDeVidaData, RetiroAnualData } from '../../types';

export default function HomePage() {
  const { isCompletedToday, getCompletedDates } = usePrayerTracking();
  // Dever de Sentar — SHARED (couple scope) — must match DeverSentarFlow
  const [deverSentarData] = useSyncedStorage<DeverSentarData>('ens-dever-sentar', {
    lastCompleted: '',
    scheduledDay: 15,
    completions: [],
  }, { scope: 'couple' });

  // Regra de Vida — PRIVATE (user scope) — must match RegraDeVidaFlow
  const [regraDeVidaData] = useSyncedStorage<RegraDeVidaData>('ens-regra-vida', {
    lastCompleted: '',
    commitments: [],
    history: [],
  });

  // Retiro Anual — SHARED (couple scope) — must match RetiroAnualFlow
  const [retiroAnualData] = useSyncedStorage<RetiroAnualData>('ens-retiro-anual', {
    scheduledDate: '',
    completedRetreats: [],
  }, { scope: 'couple' });

  const today = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentYear = new Date().getFullYear().toString();
  const deverSentarDoneThisMonth = deverSentarData.completions.some(
    c => c.date.startsWith(currentMonth)
  );
  const regraDeVidaDoneToday = (regraDeVidaData.commitments ?? []).some(
    c => c.status === 'active' && c.completedDays?.includes(today)
  );
  const retiroCompletedThisYear = (retiroAnualData.completedRetreats ?? []).some(
    r => r.completedAt.startsWith(currentYear)
  );

  const completedToday: Record<string, boolean> = {
    'oracao-pessoal': isCompletedToday('pessoal'),
    'oracao-conjugal': isCompletedToday('conjugal'),
    'dever-sentar': deverSentarDoneThisMonth,
    'regra-vida': regraDeVidaDoneToday,
    'retiro-anual': retiroCompletedThisYear,
  };

  return (
    <div className="pb-24">
      <Header />
      <Calendar completedDates={getCompletedDates()} />
      <PCECards completedToday={completedToday} />
    </div>
  );
}
