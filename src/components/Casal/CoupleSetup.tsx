import { useState } from 'react';
import { Heart, CheckCircle, LogOut, Edit3, Clock, RefreshCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function CoupleSetup() {
  const { user, profile, spouseProfile, signOut, setSpouseEmail, refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleManualRefresh = async () => {
    setRefreshing(true);
    setError('');
    setSuccess('');
    try {
      await refreshProfile();
      setSuccess('Perfil recarregado.');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao recarregar perfil.');
    }
    setRefreshing(false);
  };

  if (!user) return null;

  const handleSetSpouse = async () => {
    if (!email.trim()) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Digite um e-mail válido.');
      return;
    }

    if (email.trim().toLowerCase() === user.email?.toLowerCase()) {
      setError('Esse é o seu próprio e-mail.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: err } = await setSpouseEmail(email.trim());
      if (err) {
        setError(err);
      } else {
        setSuccess('E-mail salvo! Aguardando cônjuge criar a conta.');
        setEditing(false);
        setEmail('');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Already paired ───────────────────────────
  if (profile?.couple_id) {
    const myName = profile.display_name?.trim();
    const spouseName = spouseProfile?.display_name?.trim();
    const spouseLabel = spouseName || profile.spouse_email || 'Seu cônjuge';
    const myLabel = myName || user.email || 'Você';

    // Build the prominent "Rodrigo e Vivian" headline.
    // If either name is missing, show whatever we have.
    const headline =
      myName && spouseName
        ? `${myName} e ${spouseName}`
        : myName
        ? `${myName} e ${spouseLabel}`
        : spouseName
        ? `${myLabel} e ${spouseName}`
        : 'Casal conectado';

    const namesMissing = !myName || !spouseName;

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-ens-blue mb-1 capitalize">{headline}</h2>
          <p className="text-xs text-ens-text-light italic mb-3">Casal conectado ❤️</p>

          <div className="mt-4 space-y-1.5 text-xs text-ens-text-light">
            <div>
              <span className="text-ens-text-light/70">Você:</span>{' '}
              <span className="font-medium text-ens-text">{myLabel}</span>
            </div>
            <div>
              <span className="text-ens-text-light/70">Cônjuge:</span>{' '}
              <span className="font-medium text-ens-text">{spouseLabel}</span>
            </div>
          </div>
        </div>

        {namesMissing && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
            <strong>Personalize:</strong>{' '}
            {!myName
              ? 'Adicione seu nome em Ajustes pra ficar "Seu Nome e ' + (spouseName ?? 'Cônjuge') + '".'
              : 'Peça pro seu cônjuge adicionar o nome em Ajustes pra ficar "' + myName + ' e [Nome]".'}
          </div>
        )}

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-ens-text-light hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    );
  }

  // ─── Waiting for spouse (email set, not yet paired) ───
  if (profile?.spouse_email && !editing) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="font-semibold text-ens-blue mb-1">Aguardando cônjuge</h3>
          <p className="text-sm text-ens-text-light mb-3">
            Quando <span className="font-semibold text-ens-blue">{profile.spouse_email}</span> criar
            a conta, vocês serão conectados automaticamente.
          </p>
          <p className="text-xs text-ens-text-light">
            A conexão acontece em tempo real — não precisa atualizar a página.
          </p>
        </div>

        <button
          onClick={() => { setEditing(true); setEmail(profile.spouse_email || ''); }}
          className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 text-left transition-all active:scale-[0.98]"
        >
          <div className="w-10 h-10 bg-ens-blue/10 rounded-full flex items-center justify-center shrink-0">
            <Edit3 className="w-5 h-5 text-ens-blue" />
          </div>
          <div>
            <h4 className="font-semibold text-ens-blue text-sm">Alterar e-mail</h4>
            <p className="text-xs text-ens-text-light">Errou o e-mail? Corrija aqui</p>
          </div>
        </button>

        <p className="text-xs text-ens-text-light text-center">
          Logado como: <span className="font-medium">{user.email}</span>
        </p>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-ens-text-light hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    );
  }

  // ─── Enter spouse email (first time or editing) ───
  return (
    <div className="space-y-4">
      {/* Manual refresh — visible when not paired, in case profile got out of sync */}
      {!editing && (
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="w-full bg-ens-blue/5 border border-ens-blue/20 rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-ens-blue font-medium active:scale-[0.98] transition-transform"
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Sincronizando...' : 'Já cadastrei o cônjuge? Recarregar perfil'}
        </button>
      )}

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="text-center mb-4">
          <Heart className="w-10 h-10 text-ens-gold mx-auto mb-3" />
          <h3 className="font-semibold text-ens-blue mb-1">
            {editing ? 'Alterar e-mail do cônjuge' : 'Conectar com cônjuge'}
          </h3>
          <p className="text-xs text-ens-text-light">
            Digite o e-mail que seu cônjuge usa (ou vai usar) para entrar no app.
            Quando ele(a) criar a conta, a conexão será automática.
          </p>
        </div>

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email-do-conjuge@exemplo.com"
          autoComplete="off"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-center text-sm
            text-ens-blue placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-ens-gold/30 mb-3"
        />

        {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}
        {success && <p className="text-xs text-green-600 text-center mb-3">{success}</p>}

        <button
          onClick={handleSetSpouse}
          disabled={loading || !email.trim()}
          className="w-full py-3 rounded-xl bg-ens-gold text-white font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>

        {editing && (
          <button
            onClick={() => { setEditing(false); setError(''); setEmail(''); }}
            className="w-full mt-2 py-2 text-sm text-ens-text-light"
          >
            Cancelar
          </button>
        )}
      </div>

      <p className="text-xs text-ens-text-light text-center">
        Logado como: <span className="font-medium">{user.email}</span>
      </p>

      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-ens-text-light hover:text-red-500 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sair da conta
      </button>
    </div>
  );
}
