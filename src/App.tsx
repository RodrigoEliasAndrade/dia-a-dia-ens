import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Home/Header';
import Calendar from './components/Home/Calendar';
import StreakCounter from './components/Home/StreakCounter';
import PCECards from './components/Home/PCECards';
import BottomNav from './components/shared/BottomNav';
import CardFlow from './components/OracaoConjugal/CardFlow';
import DeverSentarFlow from './components/DeverSentar/DeverSentarFlow';
import { usePrayerTracking } from './hooks/usePrayerTracking';

function HomePage() {
  const { conjugalData, isCompletedToday, getCompletedDates } = usePrayerTracking();

  const completedToday: Record<string, boolean> = {
    'oracao-pessoal': isCompletedToday('pessoal'),
    'oracao-conjugal': isCompletedToday('conjugal'),
    'dever-sentar': false,
    'regra-vida': false,
  };

  return (
    <div className="pb-24">
      <Header />
      <StreakCounter
        monthlyCount={conjugalData.monthlyCount}
        currentStreak={conjugalData.currentStreak}
        longestStreak={conjugalData.longestStreak}
        totalCompletions={conjugalData.totalCompletions}
      />
      <Calendar completedDates={getCompletedDates()} />
      <PCECards completedToday={completedToday} />
    </div>
  );
}

function PCEsPage() {
  return (
    <div className="pb-24 px-4 pt-16">
      <h1 className="text-xl font-bold text-ens-blue mb-4">Pontos Concretos de Esforço</h1>
      <p className="text-ens-text-light text-sm">
        Os PCEs são os compromissos práticos que cada casal assume para crescer na fé e no amor.
        São o coração da espiritualidade ENS.
      </p>
      <div className="mt-6 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-ens-blue">1. Oração Pessoal Diária 🙏</h3>
          <p className="text-sm text-ens-text-light mt-1">Encontro pessoal com Deus, todos os dias</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-ens-blue">2. Oração Conjugal Diária 💑</h3>
          <p className="text-sm text-ens-text-light mt-1">Oração do casal, frente a frente</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-ens-blue">3. Dever de Sentar-se Mensal 📋</h3>
          <p className="text-sm text-ens-text-light mt-1">Balanço mensal da vida conjugal</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-ens-blue">4. Regra de Vida 📖</h3>
          <p className="text-sm text-ens-text-light mt-1">Compromissos de crescimento espiritual</p>
        </div>
      </div>
    </div>
  );
}

function DiarioPage() {
  const { conjugalData } = usePrayerTracking();
  const recentCompletions = [...conjugalData.completions].reverse().slice(0, 10);

  return (
    <div className="pb-24 px-4 pt-16">
      <h1 className="text-xl font-bold text-ens-blue mb-4">Diário de Oração</h1>
      {recentCompletions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📖</div>
          <p className="text-ens-text-light">Nenhuma oração registrada ainda.</p>
          <p className="text-sm text-ens-text-light mt-1">Comece sua oração conjugal hoje!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentCompletions.map((entry, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-ens-blue">{entry.date}</span>
                <span className="text-xs text-ens-text-light">{entry.duration} min</span>
              </div>
              {entry.journalEntry ? (
                <p className="text-sm text-ens-text">{entry.journalEntry}</p>
              ) : (
                <p className="text-sm text-ens-text-light italic">Sem anotações</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/ens-dia-a-dia">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pces" element={<PCEsPage />} />
        <Route path="/diario" element={<DiarioPage />} />
        <Route path="/casal" element={<CasalPage />} />
        <Route path="/oracao-conjugal" element={<CardFlow />} />
        <Route path="/dever-sentar" element={<DeverSentarFlow />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}
