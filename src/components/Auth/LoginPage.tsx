import { useState } from 'react';
import { Cross, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
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

  if (sent) {
    return (
      <div className="min-h-screen bg-ens-cream flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ens-blue mb-2">Link enviado!</h2>
          <p className="text-sm text-ens-text-light mb-6">
            Verifique seu e-mail <span className="font-medium text-ens-text">{email}</span> e
            clique no link para entrar.
          </p>
          <p className="text-xs text-ens-text-light">
            Não recebeu? Verifique a pasta de spam ou{' '}
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-ens-blue font-medium underline"
            >
              tente novamente
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ens-cream flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cross className="w-6 h-6 text-ens-gold" />
            <h1 className="text-2xl font-bold text-ens-blue tracking-wide">ENS DIA A DIA</h1>
            <Cross className="w-6 h-6 text-ens-gold" />
          </div>
          <p className="text-sm text-ens-text-light">
            Entre para sincronizar com seu cônjuge
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-ens-blue shrink-0" />
            <h2 className="font-semibold text-ens-blue">Entrar com e-mail</h2>
          </div>

          <p className="text-xs text-ens-text-light mb-4">
            Enviaremos um link mágico para seu e-mail. Sem senha necessária.
          </p>

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-ens-text
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 mb-3"
          />

          {error && (
            <p className="text-xs text-red-500 mb-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-3 rounded-xl bg-ens-blue text-white font-semibold flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {loading ? 'Enviando...' : (
              <>
                Enviar link de acesso
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Skip login */}
        <p className="text-center text-xs text-ens-text-light mt-6">
          O login é necessário apenas para conectar com seu cônjuge.
          <br />
          Todas as outras funções funcionam sem conta.
        </p>
      </div>
    </div>
  );
}
