'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const signupResponse = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName }),
        });

        const signupData = await signupResponse.json();

        if (!signupResponse.ok) {
          throw new Error(signupData.error || 'Signup failed');
        }
      }

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.error || 'Login failed');
      }

      login(loginData.accessToken, loginData.customer);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full border-2 border-black">
        <div className="flex justify-between items-center p-6 border-b-2 border-black">
          <h2 className="text-xl font-bold text-black uppercase">
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </h2>
          <button onClick={onClose} className="text-black hover:opacity-60">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="border-2 border-black p-4 bg-gray-100">
              <p className="text-sm text-black">{error}</p>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-black mb-2 uppercase">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border-2 border-black px-4 py-3 text-black focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black mb-2 uppercase">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border-2 border-black px-4 py-3 text-black focus:outline-none"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-black mb-2 uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-black px-4 py-3 text-black focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-2 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-black px-4 py-3 text-black focus:outline-none"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 hover:bg-gray-800 disabled:bg-gray-300 transition-colors font-bold text-sm uppercase"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="w-full text-sm text-black hover:opacity-60 uppercase"
          >
            {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
