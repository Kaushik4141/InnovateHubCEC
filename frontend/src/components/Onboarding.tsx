import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface Me {
  _id: string;
  fullname: string;
  email: string;
  onboardingCompleted?: boolean;
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL;
  const [fullname, setFullname] = useState('');
  const [usn, setUsn] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const BRANCHES = ['CSE','ISE','AIML','CSD','CSBS','ECE'];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${apiBase}/api/v1/users/current-user`, { withCredentials: true });
        if (!mounted) return;
        const user: Me = res.data?.data || res.data?.user || res.data; // align with ApiResponse used in backend
        setFullname(user?.fullname || '');
        if (user?.onboardingCompleted) {
          navigate('/dashboard');
        }
      } catch (e: any) {
        navigate('/login');
      }
    })();
    return () => { mounted = false; };
  }, [apiBase, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!usn || !year || !branch) {
      setError('Please provide your USN, Graduation Year and Branch');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${apiBase}/api/v1/users/auth/complete-onboarding`,
        { usn: usn.trim().toUpperCase(), year: Number(year), fullname, branch },
        { withCredentials: true }
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete onboarding');
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
        <form onSubmit={onSubmit} className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-2">
              <img src="/logo1.png" alt="logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">InnovateHubCEC</span>
            </div>
            <h2 className="text-2xl font-semibold text-white">Complete your profile</h2>
            <p className="text-sm text-gray-400">We need a few more details to finish setting up your account</p>
          </div>

          {error && (
            <p className="text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded text-sm text-center">{error}</p>
          )}

          <div>
            <input
              name="fullname"
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition"
            />
          </div>

          <div>
            <input
              name="usn"
              type="text"
              placeholder="Your USN"
              value={usn}
              onChange={(e) => setUsn(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-900/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition"
            />
          </div>

          <div>
            <select
              name="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-900/60 text-white border border-gray-700 focus:outline-none appearance-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition"
            >
              <option value="" disabled>
                Select Graduation Year
              </option>
              {Array.from({ length: 11 }, (_, i) => 2020 + i).map(y => (
                <option key={y} value={String(y)} className="bg-[#243447]">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-900/60 text-white border border-gray-700 focus:outline-none appearance-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition"
            >
              <option value="" disabled>
                Select Branch
              </option>
              {BRANCHES.map(b => (
                <option key={b} value={b} className="bg-[#243447]">
                  {b}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
