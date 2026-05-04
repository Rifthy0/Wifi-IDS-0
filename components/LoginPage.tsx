import React, { useState } from 'react';
import { WifiIcon } from './icons';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulated authentication
    if (email === 'admin@wifi-ids.com' && password === 'password123') {
      setError('');
      onLogin();
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-slate-900 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-slate-800 dark:to-slate-900 font-sans p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center mb-8">
          <WifiIcon className="h-10 w-10 text-primary-500" />
          <h1 className="text-3xl font-bold ml-3 text-light-text-primary dark:text-white">
            Smart Wi-Fi IDS
          </h1>
        </div>
        <div className="bg-light-card dark:bg-slate-800 border border-light-border dark:border-slate-700 rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-light-text-primary dark:text-white mb-6">Admin Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-text-secondary dark:text-slate-400">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-light-border dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-light-bg dark:bg-slate-900 text-light-text-primary dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-light-text-secondary dark:text-slate-400">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-light-border dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-light-bg dark:bg-slate-900 text-light-text-primary dark:text-white"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;