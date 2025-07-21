import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111922] p-6" style={{ fontFamily: 'Inter, \"Noto Sans\", sans-serif' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#243447] p-8 rounded-lg space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">Sign in to InnovativeHubCEC</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-4 rounded-lg bg-[#111922] text-white placeholder-[#93acc8] focus:outline-none"
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
            className="w-full p-4 rounded-lg bg-[#111922] text-white placeholder-[#93acc8] focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#1978e5] hover:bg-[#1565c0] text-white font-bold py-3 rounded-lg transition-colors"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <p className="text-[#93acc8] text-sm text-center">
          Don't have an account? <span className="underline text-[#1978e5] cursor-pointer" onClick={() => navigate('/register')}>Sign up</span>
        </p>
      </form>
    </div>
  );
};

export default Login; 