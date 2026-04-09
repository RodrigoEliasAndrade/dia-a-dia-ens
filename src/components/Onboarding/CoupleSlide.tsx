import { useState } from 'react';
import { Heart, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SlideProps {
  onComplete: () => void;
}

export default function CoupleSlide({ onComplete }: SlideProps) {
  const { profile, setSpouseEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Already paired (trigger fired immediately)
  if (profile?.couple_id) {
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

  // Spouse email was set but not yet paired (spouse hasn't signed up)
  if (profile?.spouse_email && !profile?.couple_id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center animate-fade-in">
        <div className="w-14 h-14 bg-ens-gold/10 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-7 h-7 text-ens-gold" />
        </div>

        <h2 className="text-xl font-bold text-ens-blue mb-2">Aguardando seu cônjuge</h2>
        <p className="text-sm text-ens-text-light mb-2 max-w-xs">
          Quando <span className="font-semibold text-ens-blue">{profile.spouse_email}</span> criar
          a conta, vocês serão conectados automaticamente.
        </p>
        <p className="text-xs text-ens-text-light mb-8 max-w-xs">
          Enquanto isso, você já pode usar o app normalmente.
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

  // Main screen: enter spouse email
  const handleSubmit = async () => {
    if (!email.trim()) {
      onComplete(); // skip
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Digite um e-mail válido.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: err } = await setSpouseEmail(email.trim());
      if (err) {
        setError(err);
      }
      // Don't call onComplete here — the component will re-render
      // showing either "paired" or "waiting" state
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center animate-fade-in">
      <div className="w-14 h-14 bg-ens-gold/10 rounded-full flex items-center justify-center mb-4">
        <Heart className="w-7 h-7 text-ens-gold" />
      </div>

      <h2 className="text-xl font-bold text-ens-blue mb-2">Conecte seu cônjuge</h2>
      <p className="text-sm text-ens-text-light mb-6 max-w-xs">
        Digite o e-mail que seu cônjuge usa (ou vai usar) para criar a conta no app.
        Quando ele(a) entrar, os apps serão conectados automaticamente.
      </p>

      <div className="w-full max-w-sm mb-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email-do-conjuge@exemplo.com"
          autoComplete="off"
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-ens-text
            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-gold/30 text-center"
        />

        {error && (
          <p className="text-xs text-red-500 mt-2">{error}</p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full max-w-sm py-3.5 rounded-xl bg-ens-gold text-white font-semibold
          disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-lg
          flex items-center justify-center gap-2"
      >
        {loading ? 'Salvando...' : (
          <>
            {email.trim() ? 'Conectar' : 'Pular por agora'}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {email.trim() && (
        <button
          onClick={onComplete}
          className="mt-3 text-sm text-ens-text-light"
        >
          Pular por agora
        </button>
      )}

      <p className="text-xs text-ens-text-light mt-6 max-w-xs">
        Não sabe o e-mail? Sem problema — pule e conecte depois em <span className="font-semibold">Casal</span>.
      </p>
    </div>
  );
}
