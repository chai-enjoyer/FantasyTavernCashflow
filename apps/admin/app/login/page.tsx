'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(apiKey);
      if (success) {
        router.push('/');
      } else {
        setError('Invalid API key. Please check your credentials.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-dark">
      <div className="max-w-md w-full mx-4">
        <div className="admin-card">
          <div className="flex items-center justify-center mb-8">
            <div className="p-4 bg-admin-primary/10 rounded-full">
              <Shield className="w-12 h-12 text-admin-primary" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">Admin Access</h1>
          <p className="text-gray-400 text-center mb-8">
            Enter your API key to access the admin panel
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="admin-input"
                placeholder="Enter your API key"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-admin-danger text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !apiKey}
              className="admin-button w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              Fantasy Tavern Cashflow Admin Panel
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              Secure access for game administrators only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}