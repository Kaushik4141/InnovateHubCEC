import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Users, Trophy, Code, Brain, Palette, Cpu } from 'lucide-react';


const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); 
  const [minLoadingElapsed, setMinLoadingElapsed] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL;
  const [contributors, setContributors] = useState<any[]>([]);
  const [contributorsLoading, setContributorsLoading] = useState(false);
  const [contributorsError, setContributorsError] = useState<string | null>(null);
  

  useEffect(() => {
    fetch(`${apiBase}/api/v1/users/current-user`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setIsLoggedIn(!!data?.data))
      .catch(() => setIsLoggedIn(false));
  }, []);

  

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingElapsed(true), 4400); 
    return () => clearTimeout(timer);
  }, []);

  // Fetch GitHub contributors for the Our Team section
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
  if (isLoggedIn) {
    // If logged in, show the main header and maybe redirect or show dashboard
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-4xl font-bold mb-4">Welcome back to InnovateHubCEC!</h1>
          <button
            className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
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
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Students collaborating" 
                className="w-full h-auto rounded-2xl shadow-2xl object-cover"
              />
              <div className="hidden sm:block absolute -bottom-6 -left-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">50+ Active Students</p>
                    <p className="text-gray-400 text-sm">Building the future together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Explore the Possibilities</h2>
            <p className="text-xl text-gray-300">InnovateHubCEC offers a range of features designed to support your innovative journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-purple-900/50 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Code className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Showcase Your Projects</h3>
              <p className="text-gray-300 leading-relaxed">Present your innovative projects to a wider audience and gain valuable feedback.</p>
            </div>

            <div className="bg-gradient-to-br from-blue-900/50 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Connect with Mentors</h3>
              <p className="text-gray-300 leading-relaxed">Find experienced mentors to guide you through your project development.</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/50 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-green-500 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Participate in Competitions</h3>
              <p className="text-gray-300 leading-relaxed">Join exciting competitions and challenge yourself with innovative projects.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-700">
              <h3 className="text-4xl font-bold text-purple-400 mb-2">250+</h3>
              <p className="text-gray-300">Projects Showcased</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-700">
              <h3 className="text-4xl font-bold text-blue-400 mb-2">50+</h3>
              <p className="text-gray-300">Mentors Available</p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-8 text-center border border-gray-700">
              <h3 className="text-4xl font-bold text-green-400 mb-2">10+</h3>
              <p className="text-gray-300">Competitions Held</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Domains */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Explore Skill Domains</h2>
            <p className="text-xl text-gray-300">Find mentors and peers in your area of interest</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Web Development", icon: Code, count: 45, color: "from-green-500 to-blue-500" },
              { name: "Artificial Intelligence", icon: Brain, count: 38, color: "from-purple-500 to-pink-500" },
              { name: "Hardware & IoT", icon: Cpu, count: 28, color: "from-orange-500 to-red-500" },
              { name: "UI/UX Design", icon: Palette, count: 25, color: "from-pink-500 to-purple-500" }
            ].map((domain) => (
              <div key={domain.name} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer transform hover:-translate-y-2">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${domain.color} rounded-xl flex items-center justify-center`}>
                    <domain.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-400">{domain.count} students</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{domain.name}</h3>
                <p className="text-gray-400 text-sm">Connect with experts and peers</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Contributors Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-3">Our Contributors</h2>
            <p className="text-gray-300">Top contributors to the InnovateHubCEC repository</p>
          </div>

          {contributorsLoading && (
            <div className="text-center text-gray-300">Loading contributors…</div>
          )}
          {contributorsError && !contributorsLoading && (
            <div className="mx-auto max-w-2xl mb-8 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3 text-center">
              {contributorsError}
            </div>
          )}

          {!contributorsLoading && !contributorsError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {contributors.map((c: any) => (
                <a
                  key={c?.id || c?.login}
                  href={c?.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={c?.avatar_url}
                      alt={c?.login}
                      className="w-14 h-14 rounded-full object-cover border border-gray-700"
                    />
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">{c?.login}</div>
                      <div className="text-sm text-gray-400 truncate">{c?.html_url?.replace('https://', '')}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-300">Contributions</div>
                    <div className="text-lg font-bold text-purple-300">{c?.contributions ?? 0}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Innovate?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Sign up now and start your journey with InnovateHubCEC. Unleash your potential and make a difference.
          </p>
          <button 
            onClick={() => navigate('/Login')}
            className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105 w-full sm:w-auto"
          >
            Join InnovateHubCEC Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-purple-400" />
                <span className="ml-2 text-xl font-bold text-white">InnovateHubCEC</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Empowering students to showcase their innovations, connect with mentors, and build the future together.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/dashboard')} className="text-gray-300 hover:text-white transition-colors">Browse Projects</button></li>
                <li><button onClick={() => navigate('/mentors')} className="text-gray-300 hover:text-white transition-colors">Find Mentors</button></li>
                <li><button onClick={() => navigate('/jobs')} className="text-gray-300 hover:text-white transition-colors">Competitions</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2025 InnovateHubCEC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;