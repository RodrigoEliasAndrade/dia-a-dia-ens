import { useState, useEffect } from 'react';
import { Heart, Copy, Share2, CheckCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface SlideProps {
  onComplete: () => void;
}

/**
 * Detects invite code from URL query params.
 * App B receives a link like: ?code=ENS-XXXX
 */
function getInviteCodeFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
}

export default function CoupleSlide({ onComplete }: SlideProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);

  // Detect if this is App B (has code in URL)
  const urlCode = getInviteCodeFromURL();
  const isAppB = !!urlCode;

  // App A: auto-create couple on mount
  // App B: pre-fill the join code from URL
  useEffect(() => {
    if (!user || profile?.couple_id) return;

    if (isAppB) {
      setJoinCode(urlCode!);
    } else if (!inviteCode && !loading) {
      createCouple();
    }
  }, [user, profile]);

  // ─── App A: Create couple ─────────────────────
  const createCouple = async () => {
    if (!user) return;
    setLoading(true);

    const code = 'ENS-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .insert({ invite_code: code })
      .select('id, invite_code')
      .single();

    if (coupleError || !couple) {
      setError('Erro ao criar casal. Tente novamente.');
      setLoading(false);
      return;
    }

    await supabase
      .from('profiles')
      .update({ couple_id: couple.id })
      .eq('id', user.id);

    setInviteCode(couple.invite_code);
    await refreshProfile();
    setLoading(false);
  };

  // ─── App B: Join couple with code ─────────────
  const handleJoinCouple = async () => {
    if (!user || !joinCode.trim()) return;
    setLoading(true);
    setError('');

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

    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', couple.id);

    if (count && count >= 2) {
      setError('Este casal já tem dois membros.');
      setLoading(false);
      return;
    }

    await supabase
      .from('profiles')
      .update({ couple_id: couple.id })
      .eq('id', user.id);

    await refreshProfile();
    setJoined(true);
    setLoading(false);
  };

  // ─── Share handlers (App A) ───────────────────
  const shareUrl = `${window.location.origin}/dia-a-dia-ens/?code=${inviteCode}`;

  const handleCopy = async () => {
    const text = `Junte-se a mim no ENS Dia a Dia!\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ENS Dia a Dia',
      text: 'Junte-se a mim no ENS Dia a Dia! Clique no link para conectar nossos apps:',
      url: shareUrl,
    };

    if (navigator.share) {
      try { await navigator.share(shareData); }
      catch { handleCopy(); }
    } else {
      handleCopy();
    }
  };

  // ─── Loading state ────────────────────────────
  if (loading && !joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-8 text-center">
        <div className="text-4xl mb-4">💑</div>
        <p className="text-sm text-ens-text-light">
          {isAppB ? 'Conectando ao casal...' : 'Preparando seu casal...'}
        </p>
      </div>
    );
  }

  // ─── App B: Successfully joined ───────────────
  if (joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-ens-blue mb-2">Casal conectado!</h2>
        <p className="text-sm text-ens-text-light mb-8 max-w-xs">
          Vocês agora compartilham as orações conjugais, retiro e dever de sentar.
        </p>
        <button
          onClick={onComplete}
          className="w-full max-w-sm py-3.5 rounded-xl bg-ens-gold text-white font-semibold
            transition-all active:scale-[0.97] shadow-lg animate-pulse-glow"
        >
          Entrar no App
        </button>
      </div>
    );
  }

  // ─── App B: Join couple screen ────────────────
  if (isAppB) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center animate-fade-in">
        <div className="w-14 h-14 bg-ens-gold/10 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="w-7 h-7 text-ens-gold" />
        </div>

        <h2 className="text-xl font-bold text-ens-blue mb-2">Conectar ao cônjuge</h2>
        <p className="text-sm text-ens-text-light mb-6 max-w-xs">
          Seu cônjuge compartilhou um código com você. Confirme para conectar os apps.
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-sm mb-4">
          <p className="text-xs text-ens-text-light mb-2">Código do casal</p>
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ENS-XXXX"
            className="w-full text-center text-2xl font-bold text-ens-blue tracking-widest py-3
              border-b-2 border-ens-blue/20 focus:border-ens-blue focus:outline-none bg-transparent"
          />
        </div>

        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        <button
          onClick={handleJoinCouple}
          disabled={loading || joinCode.length < 5}
          className="w-full max-w-sm py-3.5 rounded-xl bg-ens-gold text-white font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-lg"
        >
          Conectar
        </button>

        <button
          onClick={onComplete}
          className="mt-3 text-sm text-ens-text-light"
        >
          Pular por agora
        </button>
      </div>
    );
  }

  // ─── App A: Create couple + share ─────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center animate-fade-in">
      <div className="w-14 h-14 bg-ens-gold/10 rounded-full flex items-center justify-center mb-4">
        <Heart className="w-7 h-7 text-ens-gold" />
      </div>

      <h2 className="text-xl font-bold text-ens-blue mb-2">Conecte seu cônjuge</h2>
      <p className="text-sm text-ens-text-light mb-6 max-w-xs">
        Envie o link abaixo para seu cônjuge. Ao abrir, ele(a) criará a conta
        e os apps serão conectados automaticamente.
      </p>

      {inviteCode && (
        <>
          <div className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-sm mb-4">
            <p className="text-xs text-ens-text-light mb-2">Código do casal</p>
            <p className="text-3xl font-bold text-ens-blue tracking-widest mb-4">{inviteCode}</p>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 rounded-lg bg-gray-100 text-sm font-medium text-ens-text flex items-center justify-center gap-2
                  hover:bg-gray-200 transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium flex items-center justify-center gap-2
                  hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
          </div>

          <p className="text-xs text-ens-text-light max-w-xs mb-8">
            Seu cônjuge receberá o link, criará a conta dele(a),
            e os apps estarão conectados.
          </p>
        </>
      )}

      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

      <button
        onClick={onComplete}
        className="w-full max-w-sm py-3.5 rounded-xl bg-ens-gold text-white font-semibold
          transition-all active:scale-[0.97] shadow-lg animate-pulse-glow"
      >
        Entrar no App
      </button>

      <button
        onClick={onComplete}
        className="mt-3 text-sm text-ens-text-light"
      >
        Pular por agora
      </button>
    </div>
  );
}
