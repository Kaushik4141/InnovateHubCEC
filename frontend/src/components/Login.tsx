import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${apiBase}/api/v1/users/login`, { email, password }, { withCredentials: true });
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError('');
      setLoading(true);
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        setError('Invalid Google response');
        return;
      }
      const res = await axios.post(
        `${apiBase}/api/v1/users/auth/google`,
        { idToken },
        { withCredentials: true }
      );
      const user = res.data?.data?.user || res.data?.user || res.data?.data;
      if (user?.onboardingCompleted === false) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-24 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-24 w-[28rem] h-[28rem] bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30 shadow-2xl">
        <form onSubmit={handleSubmit} className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-2">
              <img src="/logo1.png" alt="logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">InnovateHubCEC</span>
            </div>
            <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
            <p className="text-sm text-gray-400">Sign in to continue</p>
          </div>

          {error && <p className="text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded text-sm text-center">{error}</p>}

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition"
              required
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-gray-700 flex-1" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="h-px bg-gray-700 flex-1" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Sign-In failed')} useOneTap={false} />
          </div>
          <p className="text-gray-400 text-sm text-center">
            Don't have an account?{' '}
            <span className="underline text-purple-400 hover:text-white cursor-pointer" onClick={() => navigate('/register')}>
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;