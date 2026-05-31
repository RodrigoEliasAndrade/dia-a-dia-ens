import { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStorageAccess } from '../../hooks/useStorageAccess';

type Mode = 'signup' | 'signin' | 'reset';

export default function LoginSlide() {
  const { signUp, signIn, sendPasswordReset } = useAuth();
  const { storageOk } = useStorageAccess();
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();

    if (!email.trim()) return;

    const friendlyError = (rawMsg: string): string => {
      const m = rawMsg.toLowerCase();
      // iOS Safari fetch failure — most often Private Browsing / blocked cookies
      if (m.includes('load failed')) {
        return 'O Safari está bloqueando o app. Tente: (1) sair do modo privado, ou (2) Ajustes → Safari → desligar "Bloquear Todos os Cookies".';
      }
      if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('network request')) {
        return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
      }
      if (m.includes('rate') || m.includes('too many')) {
        return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
      }
      return rawMsg || 'Erro inesperado. Tente novamente.';
    };

    if (mode === 'reset') {
      setLoading(true);
      const { error } = await sendPasswordReset(email.trim());
      setLoading(false);
      if (error) {
        setError(friendlyError(error.message || ''));
      } else {
        setInfo('Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada.');
      }
      return;
    }

    if (!password.trim()) return;
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        const msg = error.message || '';
        if (msg.toLowerCase().includes('load failed') || msg.toLowerCase().includes('failed to fetch')) {
          setError(friendlyError(msg));
        } else {
          setError('E-mail ou senha incorretos.');
        }
      }
    } else {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        const msg = error.message || '';
        if (msg.includes('already registered') || msg.includes('already been registered')) {
          setError('Este e-mail já tem conta. Use "Já tem conta? Entrar".');
        } else {
          setError(friendlyError(msg));
        }
      } else {
        setInfo('Conta criada! Verifique seu e-mail para confirmar antes de entrar.');
      }
    }
    setLoading(false);
  };

  const headerTitle =
    mode === 'signin'
      ? 'Entrar na conta'
      : mode === 'reset'
      ? 'Recuperar senha'
      : 'Criar sua conta';

  const headerSubtitle =
    mode === 'signin'
      ? 'Use seu e-mail e senha para entrar.'
      : mode === 'reset'
      ? 'Enviaremos um link para redefinir sua senha.'
      : 'Escolha um e-mail e uma senha (mínimo 8 caracteres).';

  const submitLabel =
    mode === 'signin' ? 'Entrar' : mode === 'reset' ? 'Enviar link' : 'Criar conta';

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center animate-fade-in">
      <div className="w-14 h-14 bg-ens-blue/10 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-7 h-7 text-ens-blue" />
      </div>

      <h2 className="text-xl font-bold text-ens-blue mb-2">{headerTitle}</h2>
      <p className="text-sm text-ens-text-light mb-6 max-w-xs">{headerSubtitle}</p>

      {!storageOk && (
        <div className="w-full max-w-sm mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong>Atenção:</strong> Seu navegador está bloqueando o armazenamento (modo privado ou cookies bloqueados).
            O app pode não conseguir te manter logado.
            <span className="block mt-1">
              Tente sair da aba privada ou em Ajustes → Safari, desligar "Bloquear Todos os Cookies".
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Seu e-mail"
          required
          autoComplete="email"
          className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-ens-text
            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 mb-3"
        />

        {mode !== 'reset' && (
          <div className="relative mb-3">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha (mínimo 8 caracteres)"
              required
              minLength={8}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-ens-text
                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        )}

        {error && <p className="text-xs text-red-500 mb-3 text-left">{error}</p>}
        {info && <p className="text-xs text-green-600 mb-3 text-left">{info}</p>}

        <button
          type="submit"
          disabled={loading || !email.trim() || (mode !== 'reset' && !password.trim())}
          className="w-full py-3.5 rounded-xl bg-ens-blue text-white font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-lg"
        >
          {loading ? 'Aguarde...' : submitLabel}
        </button>
      </form>

      <div className="mt-4 flex flex-col items-center gap-2">
        {mode === 'reset' ? (
          <button
            onClick={() => { setMode('signin'); reset(); }}
            className="text-sm text-ens-blue font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao login
          </button>
        ) : (
          <>
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); reset(); }}
              className="text-sm text-ens-blue font-medium"
            >
              {mode === 'signin' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
            </button>
            {mode === 'signin' && (
              <button
                onClick={() => { setMode('reset'); reset(); }}
                className="text-xs text-ens-text-light underline"
              >
                Esqueci minha senha
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
