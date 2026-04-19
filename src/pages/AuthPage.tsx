import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import Icon from '@/components/ui/icon';

type AuthView = 'login' | 'register' | 'forgot' | 'forgot-sent';

interface Props {
  onSuccess?: () => void;
}

export default function AuthPage({ onSuccess }: Props) {
  const { login, register } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Forgot fields
  const [forgotEmail, setForgotEmail] = useState('');

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await register(regUsername, regEmail, regPassword, regConfirm);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setView('forgot-sent');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-sm bg-primary flex items-center justify-center mx-auto mb-4">
            <Icon name="Sword" size={18} className="text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
            {view === 'login' && 'ВХОД'}
            {view === 'register' && 'РЕГИСТРАЦИЯ'}
            {(view === 'forgot' || view === 'forgot-sent') && 'ВОССТАНОВЛЕНИЕ ПАРОЛЯ'}
          </h1>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-sm bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
            <Icon name="AlertCircle" size={14} />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-sm bg-green-500/10 border border-green-500/30 text-green-600 text-sm flex items-center gap-2">
            <Icon name="CheckCircle" size={14} />
            {success}
          </div>
        )}

        {/* Login Form */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full bg-card border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Пароль</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full bg-card border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-sm py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <button type="button" onClick={() => { setView('register'); clearMessages(); }} className="hover:text-foreground transition-colors">
                Регистрация
              </button>
              <button type="button" onClick={() => { setView('forgot'); clearMessages(); }} className="hover:text-foreground transition-colors">
                Забыли пароль?
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Имя пользователя</label>
              <input
                type="text"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                className="w-full bg-card border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="командир"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                className="w-full bg-card border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Пароль</label>
              <input
                type="password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                className="w-full bg-card border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Минимум 6 символов"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Подтверждение пароля</label>
              <input
                type="password"
                value={regConfirm}
                onChange={e => setRegConfirm(e.target.value)}
                className="w-full bg-card border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-sm py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
            <div className="text-center text-xs text-muted-foreground pt-1">
              <button type="button" onClick={() => { setView('login'); clearMessages(); }} className="hover:text-foreground transition-colors">
                Уже есть аккаунт? Войти
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {view === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-xs text-muted-foreground">Введите email, привязанный к аккаунту — мы пришлём инструкции по восстановлению.</p>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                className="w-full bg-card border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="your@email.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-sm py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Отправляем...' : 'Отправить инструкции'}
            </button>
            <div className="text-center text-xs text-muted-foreground pt-1">
              <button type="button" onClick={() => { setView('login'); clearMessages(); }} className="hover:text-foreground transition-colors">
                Вернуться к входу
              </button>
            </div>
          </form>
        )}

        {/* Forgot Sent */}
        {view === 'forgot-sent' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <Icon name="Mail" size={20} className="text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Если такой email зарегистрирован, инструкции по восстановлению отправлены.</p>
            <button
              type="button"
              onClick={() => { setView('login'); clearMessages(); }}
              className="w-full bg-primary text-primary-foreground rounded-sm py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Вернуться к входу
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
