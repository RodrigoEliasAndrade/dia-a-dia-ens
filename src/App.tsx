import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/shared/BottomNav';
import ErrorBoundary from './components/shared/ErrorBoundary';
import SyncIndicator from './components/shared/SyncIndicator';
import InitialSyncOverlay from './components/shared/InitialSyncOverlay';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import HomePage from './components/Home/HomePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SyncProvider } from './contexts/SyncContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useFontSize } from './hooks/useFontSize';

const PCEsPage = lazy(() => import('./components/PCEs/PCEsPage'));
const PCEDetailPage = lazy(() => import('./components/PCEs/PCEDetailPage'));
const DiarioPage = lazy(() => import('./components/Diario/DiarioPage'));
const CasalPage = lazy(() => import('./components/Casal/CasalPage'));
const SettingsPage = lazy(() => import('./components/Settings/SettingsPage'));
const OracaoPessoalFlow = lazy(() => import('./components/OracaoPessoal/OracaoPessoalFlow'));
const CardFlow = lazy(() => import('./components/OracaoConjugal/CardFlow'));
const DeverSentarFlow = lazy(() => import('./components/DeverSentar/DeverSentarFlow'));
const RegraDeVidaFlow = lazy(() => import('./components/RegraDeVida/RegraDeVidaFlow'));
const RetiroAnualFlow = lazy(() => import('./components/RetiroAnual/RetiroAnualFlow'));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-ens-cream flex items-center justify-center">
      <div className="text-ens-text-light text-sm">Carregando...</div>
    </div>
  );
}

function AppContent() {
  useFontSize();

  const { user, loading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useLocalStorage('ens-onboarding-done', false);

  if (loading) {
    return (
      <div className="min-h-screen bg-ens-cream flex items-center justify-center">
        <div className="text-ens-text-light text-sm">Carregando...</div>
      </div>
    );
  }

  if (!user || !onboardingDone) {
    return <OnboardingFlow onComplete={() => setOnboardingDone(true)} />;
  }

  return (
    <BrowserRouter basename="/dia-a-dia-ens">
      <InitialSyncOverlay />
      <SyncIndicator />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pces" element={<PCEsPage />} />
          <Route path="/pces/:pceId" element={<PCEDetailPage />} />
          <Route path="/diario" element={<DiarioPage />} />
          <Route path="/casal" element={<CasalPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/oracao-pessoal" element={<OracaoPessoalFlow />} />
          <Route path="/oracao-conjugal" element={<CardFlow />} />
          <Route path="/dever-sentar" element={<DeverSentarFlow />} />
          <Route path="/regra-vida" element={<RegraDeVidaFlow />} />
          <Route path="/retiro-anual" element={<RetiroAnualFlow />} />
        </Routes>
      </Suspense>
      <BottomNav />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SyncProvider>
          <AppContent />
        </SyncProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
