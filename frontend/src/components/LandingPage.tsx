import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Users, Trophy, Code, Brain, Palette, Cpu } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [minLoadingElapsed, setMinLoadingElapsed] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
  const [contributors, setContributors] = useState<any[]>([]);
  const [contributorsLoading, setContributorsLoading] = useState(false);
  const [contributorsError, setContributorsError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    publishedProjects: number;
    mentors: number;
    competitions: number;
    activeStudents: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Check logged-in status
  useEffect(() => {
    fetch(`${apiBase}/api/v1/users/current-user`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setIsLoggedIn(!!data?.data))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Minimum loading time (4.4s)
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingElapsed(true), 4400);
    return () => clearTimeout(timer);
  }, []);

  // Redirect to dashboard when logged in
  useEffect(() => {
    if (isLoggedIn && minLoadingElapsed) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, minLoadingElapsed, navigate]);

  // Fetch GitHub contributors
  useEffect(() => {
    setContributorsLoading(true);
    setContributorsError(null);
    fetch('https://api.github.com/repos/Kaushik4141/InnovateHubCEC/contributors?per_page=100')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const sorted = list.sort((a, b) => (b?.contributions || 0) - (a?.contributions || 0));
        setContributors(sorted);
        if (!sorted.length) setContributorsError('No contributors found yet.');
      })
      .catch(() => setContributorsError('Failed to load contributors from GitHub.'))
      .finally(() => setContributorsLoading(false));
  }, []);

  // Fetch Landing Stats
  useEffect(() => {
    setStatsLoading(true);
    setStatsError(null);
    fetch(`${apiBase}/api/v1/stats/landing`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data && data.data) {
          setStats(data.data);
        } else {
          setStatsError('Invalid response from stats API.');
        }
      })
      .catch(() => setStatsError('Failed to load stats.'))
      .finally(() => setStatsLoading(false));
  }, []);

  // Show loading animation
  if (isLoggedIn === null || !minLoadingElapsed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <img
          src="loa.gif"
          alt="Loading..."
          className="w-full max-w-[650px] h-auto rounded-xl object-cover shadow-lg"
        />
      </div>
    );
  }

  // When logged in, navigate() will redirect; render nothing
  if (isLoggedIn) {
    return null;
  }

  // Guest Landing Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900 bg-opacity-80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="flex items-center">
                <img src="logo1.png" alt="logo" className="h-8 w-8 text-purple-400" />
                <span className="ml-2 text-base sm:text-xl font-bold text-white">InnovateHubCEC</span>
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <button
                onClick={() => navigate('/team')}
                className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg border border-transparent hover:border-purple-500/40"
              >
                Our Team
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Sign Up
              </button>
              <button 
                onClick={() => navigate('/Login')}
                className="border border-purple-500 text-purple-400 px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-purple-500 hover:text-white transition-colors"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Empowering Innovation at 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"> Canara Engineering College</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                InnovateHubCEC is your gateway to showcasing projects, connecting with mentors, and participating in exciting competitions. Join us and bring your ideas to life.
              </p>
              <button 
                onClick={() => navigate('/Login')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center w-full sm:w-auto"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
            <div className="relative">
              <img 
                src="/landingpage.webp" 
                alt="Students collaborating" 
                className="w-full h-auto rounded-2xl shadow-2xl object-cover"
              />
              <div className="hidden sm:block absolute -bottom-6 -left-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {statsLoading && 'Loading…'}
                      {!statsLoading && (stats ? `${stats.activeStudents.toLocaleString()} Active Students` : 'Active Students')}
                    </p>
                    <p className="text-gray-400 text-sm">Building the future together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* ... Keep your Features, Stats, Skill Domains, Contributors, CTA, and Footer sections as they are from your original code ... */}
    </div>
  );
};

export default LandingPage;
