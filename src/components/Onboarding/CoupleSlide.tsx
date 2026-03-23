import { useState, useEffect } from 'react';
import { Heart, Copy, Share2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface SlideProps {
  onComplete: () => void;
}

export default function CoupleSlide({ onComplete }: SlideProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Auto-create couple on mount if user doesn't have one
  useEffect(() => {
    if (user && !profile?.couple_id && !inviteCode && !loading) {
      createCouple();
    }
    // If user already has a couple, go straight to app
    if (profile?.couple_id) {
      // Already paired, could skip
    }
  }, [user, profile]);

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

  const handleCopy = async () => {
    const text = `Junte-se a mim no ENS Dia a Dia! Use o código: ${inviteCode}\n${window.location.origin}/dia-a-dia-ens/`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ENS Dia a Dia',
      text: `Junte-se a mim no ENS Dia a Dia! Instale o app e use o código: ${inviteCode}`,
      url: `${window.location.origin}/dia-a-dia-ens/`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-8 text-center">
        <div className="text-4xl mb-4">💑</div>
        <p className="text-sm text-ens-text-light">Preparando seu casal...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center animate-fade-in">
      <div className="w-14 h-14 bg-ens-gold/10 rounded-full flex items-center justify-center mb-4">
        <Heart className="w-7 h-7 text-ens-gold" />
      </div>

      <h2 className="text-xl font-bold text-ens-blue mb-2">Conecte seu cônjuge</h2>
      <p className="text-sm text-ens-text-light mb-6 max-w-xs">
        Compartilhe o código abaixo com seu cônjuge para sincronizar
        as orações e atividades do casal.
      </p>

      {/* Invite code */}
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
                className="flex-1 py-2.5 rounded-lg bg-ens-blue text-white text-sm font-medium flex items-center justify-center gap-2
                  hover:bg-ens-blue/90 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </button>
            </div>
          </div>

          <p className="text-xs text-ens-text-light max-w-xs mb-8">
            Seu cônjuge deve instalar o app, criar a conta, e digitar
            este código na tela de Casal.
          </p>
        </>
      )}

      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

      {/* Enter app */}
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
