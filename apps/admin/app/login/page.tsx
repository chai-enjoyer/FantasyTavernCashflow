'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertCircle, Loader2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Неверный email или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await resetPassword(resetEmail);
      setSuccess('Письмо для сброса пароля отправлено! Проверьте вашу почту.');
      setResetEmail('');
      setTimeout(() => {
        setShowResetPassword(false);
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Не удалось отправить письмо для сброса');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-dark px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-admin-primary/10 rounded-lg">
            <Shield className="h-8 w-8 text-admin-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-admin-text">
            Панель администратора
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Войдите для доступа к панели администрирования
          </p>
        </div>

        {!showResetPassword ? (
          <form className="mt-8 space-y-6 admin-card" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Адрес электронной почты
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="admin-input pl-10"
                    placeholder="admin@example.com"
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Пароль
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="admin-input pl-10"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-admin-danger text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-sm text-admin-primary hover:text-admin-primary/80"
              >
                Забыли пароль?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="admin-button w-full flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6 admin-card" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-300 mb-1">
                  Адрес электронной почты
                </label>
                <div className="relative">
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="admin-input pl-10"
                    placeholder="admin@example.com"
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-admin-danger text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(false);
                  setError('');
                  setSuccess('');
                }}
                className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-transparent hover:bg-gray-800 transition-colors"
              >
                Назад к входу
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 admin-button flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Отправка...
                  </>
                ) : (
                  'Отправить письмо'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Защищено Firebase Authentication</p>
        </div>
      </div>
    </div>
  );
}