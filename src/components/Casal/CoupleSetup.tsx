import { useState } from 'react';
import { Heart, CheckCircle, LogOut, Edit3, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function CoupleSetup() {
  const { user, profile, signOut, setSpouseEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

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

    const log = (msg: string) => setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()} ${msg}`]);

    log('1. Início — email: ' + email.trim());
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      log('2. Chamando setSpouseEmail...');
      const { error: err } = await setSpouseEmail(email.trim());
      log('3. Retornou — erro: ' + (err || 'nenhum'));
      if (err) {
        setError(err);
      } else {
        setSuccess('E-mail salvo!');
        setEditing(false);
        setEmail('');
      }
    } catch (e) {
      log('EXCEPTION: ' + String(e));
      setError('Erro de conexão. Tente novamente.');
    } finally {
      log('4. Fim — loading=false');
      setLoading(false);
    }
  };

  // Debug info component (reusable)
  const DebugPanel = () => (
    <div className="mt-4 bg-gray-900 text-green-400 text-xs font-mono p-3 rounded-xl max-h-60 overflow-auto">
      <div className="text-yellow-400 mb-2">--- DIAGNÓSTICO ---</div>
      <div>user.id: {user.id?.slice(0, 8)}...</div>
      <div>user.email: {user.email}</div>
      <div>profile: {profile ? 'EXISTS' : 'NULL'}</div>
      <div>profile.couple_id: {profile?.couple_id || 'null'}</div>
      <div>profile.spouse_email: {profile?.spouse_email || 'null'}</div>
      {debugLog.length > 0 && (
        <>
          <div className="text-yellow-400 mt-2">--- LOG ---</div>
          {debugLog.map((l, i) => <div key={i}>{l}</div>)}
        </>
      )}
    </div>
  );

  // ─── Already paired ───────────────────────────
  if (profile?.couple_id) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-ens-blue mb-1">Casal conectado</h3>
          <p className="text-xs text-ens-text-light">
            Seus dados de oração conjugal estão sincronizados.
          </p>
          {profile.spouse_email && (
            <p className="text-xs text-ens-text-light mt-2">
              Cônjuge: <span className="font-medium">{profile.spouse_email}</span>
            </p>
          )}
          <p className="text-xs text-ens-text-light mt-1">
            Logado como: <span className="font-medium">{user.email}</span>
          </p>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-ens-text-light hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
        <DebugPanel />
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
        <DebugPanel />
      </div>
    );
  }

  // ─── Enter spouse email (first time or editing) ───
  return (
    <div className="space-y-4">
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

      <DebugPanel />
    </div>
  );
}
