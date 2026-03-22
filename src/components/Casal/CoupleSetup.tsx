import { useState } from 'react';
import { Heart, Copy, Share2, UserPlus, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function CoupleSetup() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // ─── Create a new couple ───────────────────────
  const handleCreateCouple = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    // Generate a short invite code
    const code = 'ENS-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Create couple
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .insert({ invite_code: code })
      .select('id, invite_code')
      .single();

    if (coupleError || !couple) {
      setError('Não foi possível criar o casal. Tente novamente.');
      setLoading(false);
      return;
    }

    // Link profile to couple
    await supabase
      .from('profiles')
      .update({ couple_id: couple.id })
      .eq('id', user.id);

    setInviteCode(couple.invite_code);
    setMode('create');
    await refreshProfile();
    setLoading(false);
  };

  // ─── Join an existing couple ───────────────────
  const handleJoinCouple = async () => {
    if (!user || !joinCode.trim()) return;
    setLoading(true);
    setError('');

    // Find couple by invite code
    const { data: couple } = await supabase
      .from('couples')
      .select('id')
      .eq('invite_code', joinCode.trim().toUpperCase())
      .single();

    if (!couple) {
      setError('Código não encontrado. Verifique e tente novamente.');
      setLoading(false);
      return;
    }

    // Check if couple already has 2 members
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', couple.id);

    if (count && count >= 2) {
      setError('Este casal já tem dois membros.');
      setLoading(false);
      return;
    }

    // Link profile to couple
    await supabase
      .from('profiles')
      .update({ couple_id: couple.id })
      .eq('id', user.id);

    await refreshProfile();
    setLoading(false);
  };

  // ─── Copy invite code ─────────────────────────
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // ─── Share invite ─────────────────────────────
  const handleShare = async () => {
    const code = inviteCode || profile?.couple_id;
    if (!code) return;

    const shareData = {
      title: 'ENS Dia a Dia',
      text: `Junte-se a mim no ENS Dia a Dia! Use o código: ${inviteCode}`,
      url: `${window.location.origin}/dia-a-dia-ens/join/${inviteCode}`,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      handleCopy(shareData.text + '\n' + shareData.url);
    }
  };

  if (!user) return null;

  // ─── Already paired ───────────────────────────
  if (profile?.couple_id && mode === 'menu') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-ens-blue mb-1">Casal conectado</h3>
          <p className="text-xs text-ens-text-light">
            Seus dados de oração conjugal estão sincronizados
          </p>
          <p className="text-xs text-ens-text-light mt-2">
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
      </div>
    );
  }

  // ─── Create couple — show invite code ──────────
  if (mode === 'create' && inviteCode) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-ens-blue text-center mb-4">Convide seu cônjuge</h3>

        <div className="bg-ens-blue/5 rounded-xl p-4 text-center mb-4">
          <p className="text-xs text-ens-text-light mb-1">Código do casal</p>
          <p className="text-2xl font-bold text-ens-blue tracking-widest">{inviteCode}</p>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleCopy(inviteCode)}
            className="flex-1 py-2.5 rounded-lg bg-gray-100 text-sm font-medium text-ens-text flex items-center justify-center gap-2
              hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-lg bg-ens-blue text-white text-sm font-medium flex items-center justify-center gap-2
              hover:bg-ens-blue/90 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>

        <p className="text-xs text-ens-text-light text-center">
          Envie este código para seu cônjuge. Ele(a) deve entrar no app,
          ir em Casal → Entrar no Casal e digitar o código.
        </p>
      </div>
    );
  }

  // ─── Join couple — enter code ──────────────────
  if (mode === 'join') {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-ens-blue text-center mb-4">Entrar no Casal</h3>

        <p className="text-xs text-ens-text-light text-center mb-4">
          Digite o código que seu cônjuge compartilhou com você
        </p>

        <input
          type="text"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          placeholder="ENS-XXXX"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-center text-lg font-bold
            tracking-widest text-ens-blue placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 mb-3"
          maxLength={8}
        />

        {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}

        <button
          onClick={handleJoinCouple}
          disabled={loading || joinCode.length < 5}
          className="w-full py-3 rounded-xl bg-ens-gold text-white font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {loading ? 'Conectando...' : 'Conectar'}
        </button>

        <button
          onClick={() => { setMode('menu'); setError(''); }}
          className="w-full mt-2 py-2 text-sm text-ens-text-light"
        >
          Voltar
        </button>
      </div>
    );
  }

  // ─── Menu — choose create or join ──────────────
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-5 shadow-sm text-center">
        <Heart className="w-10 h-10 text-ens-gold mx-auto mb-3" />
        <h3 className="font-semibold text-ens-blue mb-1">Conectar com Cônjuge</h3>
        <p className="text-xs text-ens-text-light mb-4">
          Sincronize orações conjugais, retiro e dever de sentar
        </p>
        <p className="text-xs text-ens-text-light">
          Logado como: <span className="font-medium">{user.email}</span>
        </p>
      </div>

      <button
        onClick={handleCreateCouple}
        disabled={loading}
        className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 text-left transition-all active:scale-[0.98]"
      >
        <div className="w-10 h-10 bg-ens-blue/10 rounded-full flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5 text-ens-blue" />
        </div>
        <div>
          <h4 className="font-semibold text-ens-blue text-sm">Criar Casal</h4>
          <p className="text-xs text-ens-text-light">Gere um código para convidar seu cônjuge</p>
        </div>
      </button>

      <button
        onClick={() => setMode('join')}
        className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 text-left transition-all active:scale-[0.98]"
      >
        <div className="w-10 h-10 bg-ens-gold/10 rounded-full flex items-center justify-center shrink-0">
          <UserPlus className="w-5 h-5 text-ens-gold" />
        </div>
        <div>
          <h4 className="font-semibold text-ens-blue text-sm">Entrar no Casal</h4>
          <p className="text-xs text-ens-text-light">Tenho um código do meu cônjuge</p>
        </div>
      </button>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

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
