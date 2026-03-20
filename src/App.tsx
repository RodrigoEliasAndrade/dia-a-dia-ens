import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Home/Header';
import Calendar from './components/Home/Calendar';
import PCECards from './components/Home/PCECards';
import BottomNav from './components/shared/BottomNav';
import OracaoPessoalFlow from './components/OracaoPessoal/OracaoPessoalFlow';
import CardFlow from './components/OracaoConjugal/CardFlow';
import DeverSentarFlow from './components/DeverSentar/DeverSentarFlow';
import RegraDeVidaFlow from './components/RegraDeVida/RegraDeVidaFlow';
import RetiroAnualFlow from './components/RetiroAnual/RetiroAnualFlow';
import DiarioPage from './components/Diario/DiarioPage';
import PCEDetailPage from './components/PCEs/PCEDetailPage';
import { usePrayerTracking } from './hooks/usePrayerTracking';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useFontSize } from './hooks/useFontSize';
import FontSizeControl from './components/shared/FontSizeControl';
import { format } from 'date-fns';
import type { DeverSentarData, RegraDeVidaData, RetiroAnualData } from './types';

function HomePage() {
  const { isCompletedToday, getCompletedDates } = usePrayerTracking();
  const [deverSentarData] = useLocalStorage<DeverSentarData>('ens-dever-sentar', {
    lastCompleted: '',
    scheduledDay: 15,
    completions: [],
  });

  const [regraDeVidaData] = useLocalStorage<RegraDeVidaData>('ens-regra-vida', {
    lastCompleted: '',
    commitments: [],
    history: [],
  });

  const [retiroAnualData] = useLocalStorage<RetiroAnualData>('ens-retiro-anual', {
    scheduledDate: '',
    completedRetreats: [],
  });

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

function PCEsPage() {
  const navigate = useNavigate();

  const pces = [
    { id: 'oracao-pessoal', num: 1, title: 'Oração Pessoal Diária', emoji: '🙏', desc: 'Encontro pessoal com Deus, todos os dias' },
    { id: 'oracao-conjugal', num: 2, title: 'Oração Conjugal Diária', emoji: '💑', desc: 'Oração do casal, frente a frente' },
    { id: 'dever-sentar', num: 3, title: 'Dever de Sentar-se Mensal', emoji: '📋', desc: 'Balanço mensal da vida conjugal' },
    { id: 'regra-vida', num: 4, title: 'Regra de Vida', emoji: '📖', desc: 'Compromissos de crescimento espiritual' },
    { id: 'retiro-anual', num: 5, title: 'Retiro Anual', emoji: '⛰️', desc: 'Tempo forte de encontro com Deus' },
  ];

  return (
    <div className="pb-24 px-4 pt-16">
      <h1 className="text-xl font-bold text-ens-blue mb-4">Pontos Concretos de Esforço</h1>
      <p className="text-ens-text-light text-sm">
        Os PCEs são os compromissos práticos que cada casal assume para crescer na fé e no amor.
        São o coração da espiritualidade ENS. Toque em cada um para saber mais.
      </p>
      <div className="mt-6 space-y-4">
        {pces.map(pce => (
          <button
            key={pce.id}
            onClick={() => navigate(`/pces/${pce.id}`)}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 text-left transition-all active:scale-[0.98]"
          >
            <span className="text-3xl">{pce.emoji}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-ens-blue">{pce.num}. {pce.title}</h3>
              <p className="text-sm text-ens-text-light mt-0.5">{pce.desc}</p>
            </div>
            <span className="text-ens-text-light text-lg">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// DiarioPage is now imported from ./components/Diario/DiarioPage

function CasalPage() {
  const { conjugalData } = usePrayerTracking();

  return (
    <div className="pb-24 px-4 pt-16">
      <h1 className="text-xl font-bold text-ens-blue mb-4">Nosso Casal</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
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
      <div className="mt-6 bg-ens-blue/5 rounded-xl p-4 border-l-4 border-ens-blue">
        <p className="text-sm text-ens-text italic">
          "A oração conjugal é o respiro do amor. Não é um luxo, é oxigênio."
        </p>
        <p className="text-xs text-ens-text-light mt-2 text-right">— Padre Henri Caffarel</p>
      </div>
      <div className="mt-6">
        <FontSizeControl />
      </div>
    </div>
  );
}

export default function App() {
  // Apply saved font-size preference on mount (scales all rem values)
  useFontSize();

  return (
    <BrowserRouter basename="/dia-a-dia-ens">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pces" element={<PCEsPage />} />
        <Route path="/pces/:pceId" element={<PCEDetailPage />} />
        <Route path="/diario" element={<DiarioPage />} />
        <Route path="/casal" element={<CasalPage />} />
        <Route path="/oracao-pessoal" element={<OracaoPessoalFlow />} />
        <Route path="/oracao-conjugal" element={<CardFlow />} />
        <Route path="/dever-sentar" element={<DeverSentarFlow />} />
        <Route path="/regra-vida" element={<RegraDeVidaFlow />} />
        <Route path="/retiro-anual" element={<RetiroAnualFlow />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}
