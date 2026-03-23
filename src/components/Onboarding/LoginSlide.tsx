import { useState } from 'react';
import { Mail, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginSlide() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    const { error } = await signInWithMagicLink(email.trim());
    if (error) {
      setError('Não foi possível enviar o link. Tente novamente.');
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  // After magic link sent — waiting state
  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] px-8 text-center animate-fade-in">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-ens-blue mb-3">Link enviado!</h2>
        <p className="text-sm text-ens-text-light mb-2 max-w-xs">
          Verifique seu e-mail <span className="font-semibold text-ens-text">{email}</span> e
          clique no link para entrar.
        </p>
        <div className="flex items-center gap-2 mt-4 text-ens-text-light">
          <Loader className="w-4 h-4 animate-spin" />
          <p className="text-xs">Aguardando confirmação...</p>
        </div>
        <p className="text-xs text-ens-text-light mt-6">
          Não recebeu? Verifique o spam ou{' '}
          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="text-ens-blue font-medium underline"
          >
            tente novamente
          </button>
        </p>
      </div>
    );
  }

  // Login form
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center animate-fade-in">
      <div className="w-14 h-14 bg-ens-blue/10 rounded-full flex items-center justify-center mb-4">
        <Mail className="w-7 h-7 text-ens-blue" />
      </div>

      <h2 className="text-xl font-bold text-ens-blue mb-2">Criar sua conta</h2>
      <p className="text-sm text-ens-text-light mb-6 max-w-xs">
        Enviaremos um link mágico para seu e-mail. Sem senha necessária — simples e seguro.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          autoFocus
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-ens-text text-center
            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 mb-3"
        />

        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full py-3.5 rounded-xl bg-ens-blue text-white font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-lg"
        >
          {loading ? 'Enviando...' : 'Enviar link de acesso'}
        </button>
      </form>

      <p className="text-xs text-ens-text-light mt-6 max-w-xs">
        Ao criar sua conta, você poderá sincronizar com seu cônjuge e manter
        seus dados seguros.
      </p>
    </div>
  );
}
