import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginSlide() {
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    if (isLogin) {
      // Existing user — sign in
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setError('E-mail ou senha incorretos.');
      }
    } else {
      // New user — sign up (auto-confirms, no email verification)
      const { error } = await signUp(email.trim(), password);
      if (error) {
        const msg = error.message || '';
        // If user already exists, try to sign in instead
        if (msg.includes('already registered') || msg.includes('already been registered')) {
          const { error: loginError } = await signIn(email.trim(), password);
          if (loginError) {
            setError('E-mail já cadastrado. Verifique sua senha.');
          }
        } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
          setError('Sem conexão com o servidor. Verifique sua internet e tente novamente.');
        } else {
          setError(msg || 'Erro ao criar conta. Tente novamente.');
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center animate-fade-in">
      <div className="w-14 h-14 bg-ens-blue/10 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-7 h-7 text-ens-blue" />
      </div>

      <h2 className="text-xl font-bold text-ens-blue mb-2">
        {isLogin ? 'Entrar na conta' : 'Criar sua conta'}
      </h2>
      <p className="text-sm text-ens-text-light mb-6 max-w-xs">
        {isLogin
          ? 'Use seu e-mail e senha para entrar.'
          : 'Escolha um e-mail e uma senha. Rápido e simples.'
        }
      </p>

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

        <div className="relative mb-3">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Escolha uma senha"
            required
            minLength={6}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-ens-text
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ens-blue/30 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 mb-3 text-left">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim() || !password.trim()}
          className="w-full py-3.5 rounded-xl bg-ens-blue text-white font-semibold
            disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97] shadow-lg"
        >
          {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar conta')}
        </button>
      </form>

      <button
        onClick={() => { setIsLogin(!isLogin); setError(''); }}
        className="mt-4 text-sm text-ens-blue font-medium"
      >
        {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
      </button>
    </div>
  );
}
