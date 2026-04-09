import { useState } from 'react';
import { Heart, CheckCircle, LogOut, Edit3, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const APP_VERSION = 'v5-fetch'; // change to confirm deploy

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function CoupleSetup() {
  const { user, profile, signOut, setSpouseEmail, refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [repairing, setRepairing] = useState(false);

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

    addLog('1. Início — email: ' + email.trim());
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      addLog('2. Chamando setSpouseEmail...');
      const { error: err } = await setSpouseEmail(email.trim());
      addLog('3. Retornou — erro: ' + (err || 'nenhum'));
      if (err) {
        setError(err);
      } else {
        setSuccess('E-mail salvo!');
        setEditing(false);
        setEmail('');
      }
    } catch (e) {
      addLog('EXCEPTION: ' + String(e));
      setError('Erro de conexão. Tente novamente.');
    } finally {
      addLog('4. Fim — loading=false');
      setLoading(false);
    }
  };

  const addLog = (msg: string) => setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()} ${msg}`]);

  // Raw fetch with 8s timeout — bypasses Supabase JS client entirely
  const fetchWithTimeout = async (url: string, opts: RequestInit, timeoutMs = 8000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...opts, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  };

  const getAuthToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  };

  const handleRepairProfile = async () => {
    setRepairing(true);
    addLog('REPAIR: Iniciando (raw fetch)...');

    try {
      // Get auth token
      addLog('REPAIR: Obtendo token...');
      const token = await getAuthToken();
      if (!token) {
        addLog('REPAIR: SEM TOKEN! Sessão expirada. Faça logout e login novamente.');
        setRepairing(false);
        return;
      }
      addLog('REPAIR: Token OK (' + token.slice(0, 20) + '...)');

      const headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      };

      // Step 1: Read profile via raw fetch
      addLog('REPAIR: GET profile...');
      const readRes = await fetchWithTimeout(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=id,display_name,couple_id,spouse_email`,
        { method: 'GET', headers }
      );
      const readBody = await readRes.json();
      addLog(`REPAIR: GET ${readRes.status} — ${JSON.stringify(readBody)}`);

      if (Array.isArray(readBody) && readBody.length > 0) {
        addLog('REPAIR: Profile já existe! Atualizando state...');
        await refreshProfile();
        addLog('REPAIR: Done!');
        setRepairing(false);
        return;
      }

      // Step 2: Create profile via raw fetch
      addLog('REPAIR: POST (criando profile)...');
      const insertRes = await fetchWithTimeout(
        `${SUPABASE_URL}/rest/v1/profiles`,
        { method: 'POST', headers, body: JSON.stringify({ id: user.id, display_name: null }) }
      );
      const insertBody = await insertRes.text();
      addLog(`REPAIR: POST ${insertRes.status} — ${insertBody}`);

      if (insertRes.ok) {
        addLog('REPAIR: Profile criado! Recarregando...');
        await refreshProfile();
        addLog('REPAIR: SUCESSO!');
      } else {
        addLog(`REPAIR: FALHOU (${insertRes.status})`);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        addLog('REPAIR: TIMEOUT (8s) — Supabase não respondeu');
      } else {
        addLog(`REPAIR: EXCEPTION — ${String(e)}`);
      }
    }
    setRepairing(false);
  };

  // Debug info component (reusable)
  const DebugPanel = () => (
    <div className="mt-4 bg-gray-900 text-green-400 text-xs font-mono p-3 rounded-xl max-h-80 overflow-auto">
      <div className="text-yellow-400 mb-2">--- DIAGNÓSTICO ({APP_VERSION}) ---</div>
      <div>user.id: {user.id?.slice(0, 8)}...</div>
      <div>user.email: {user.email}</div>
      <div>profile: {profile ? 'EXISTS' : 'NULL'}</div>
      <div>profile.couple_id: {profile?.couple_id || 'null'}</div>
      <div>profile.spouse_email: {profile?.spouse_email || 'null'}</div>

      {!profile && (
        <button
          onClick={handleRepairProfile}
          disabled={repairing}
          className="mt-2 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-50"
        >
          {repairing ? 'Reparando...' : 'REPARAR PERFIL'}
        </button>
      )}

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
