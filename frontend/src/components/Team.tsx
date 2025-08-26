import { useEffect, useState } from 'react';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { Github, ExternalLink, Linkedin, GitCommit } from 'lucide-react';

const Team = () => {
  const navigate = useNavigate();
  const [contribMap, setContribMap] = useState<Record<string, number>>({});
  const [contributors, setContributors] = useState<any[]>([]);

  const teamMembers: Array<{
    name: string;
    role: string;
    bio: string;
    github: string;
    url: string;
    linkedin?: string;
    avatar: string;
  }> = [
    {
      name: 'Kaushik H S',
      role: 'Backend Developer & Maintainer',
      bio: 'Leads the InnovateHubCEC projects backend, focusing on product vision, code quality, and community contributions.',
      github: 'Kaushik4141',
      url: 'https://github.com/Kaushik4141',
      linkedin: 'https://www.linkedin.com/in/kaushik-h-s/',
      avatar: 'https://github.com/Kaushik4141.png?size=120',
    },
    {
     name:'Chaithra',
     role:'Frontend Developer',
     bio:'Leads the InnovateHubCEC projects frontend, focusing on product UI/UX, User Experience, and User Interface.',
     github:'Chaithra0206',
     url:'https://github.com/Chaithra0206',
     linkedin:'https://www.linkedin.com/in/chaithra-s-89809430a',
     avatar:'https://res.cloudinary.com/dtejzccrf/image/upload/v1756182744/mwl5trhd9uoqud2hveil.jpg',
    },
    {
        name:'Mohith J Karkera',
        role:'AI/ML Developer',
        bio:'Built the multi-site job scraper and the ATS scoring engine to improve matching across roles',
        github:'mohithjk',
        url:'https://github.com/mohithjk',
        linkedin:'https://www.linkedin.com/in/mohith-j-karkera-59b66836a/',
        avatar:'https://res.cloudinary.com/dtejzccrf/image/upload/v1755602131/mqqn0trqkiberx4zlatu.jpg  ',
    }
    

  ];

  const repoUrl = 'https://github.com/Kaushik4141/InnovateHubCEC';
  const owner = 'Kaushik4141';
  const repo = 'InnovateHubCEC';

 
  const coreHandles = new Set(teamMembers.map((m) => m.github.toLowerCase()));
  const extraContribs: any[] = [
    {
      login: 'Thejas Shetty',
      avatar_url: 'https://ui-avatars.com/api/?name=Thejas&background=111827&color=fff',
      html_url: 'https://github.com/itsjustthej',
      contributions: 1,
      type: 'User',
    },
  ];
  const baseOthers = contributors
    .filter((c: any) => c?.login && !coreHandles.has(String(c.login).toLowerCase()))
    .filter((c: any) => String(c.type) !== 'Bot' && !String(c.login).toLowerCase().endsWith('[bot]'));
  const otherContribs = Array.from(
    new Map(
      [...baseOthers, ...extraContribs]
        .filter((c: any) => c?.login && !coreHandles.has(String(c.login).toLowerCase()))
        .map((c: any) => [String(c.login).toLowerCase(), c])
    ).values()
  );

  
  useEffect(() => {
  const url = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`;
  fetch(url)
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((data: any[]) => {
      if (!Array.isArray(data)) return;
      const map: Record<string, number> = {};
      data.forEach((c: any) => {
        if (c?.login) map[c.login.toLowerCase()] = c?.contributions ?? 0;
      });
      setContribMap(map);
      setContributors(data);
    })
    .catch(() => {});
}, []);


  return (
     <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      {/* Hero */}
      
      <div className="flex justify-end mt-4 mr-4">
  <a
    href={repoUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800 transition"
  >
    <Github className="w-5 h-5" />
    <span>View Repository</span>
    <ExternalLink className="w-4 h-4" />
  </a>
</div>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Our Team</h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Meet the builders behind InnovateHubCEC. We design, develop, and maintain the platform and community.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {teamMembers.map((m) => (
              <div key={m.github} className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 hover:border-gray-700 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <img src={m.avatar} alt={m.name} className="w-16 h-16 rounded-full border border-gray-700 object-cover" />
                  <div>
                    <div className="text-lg font-semibold">{m.name}</div>
                    <div className="text-sm text-gray-400">{m.role}</div>
                  </div>
                </div>
                <p className="mt-4 text-gray-300 text-sm leading-relaxed">{m.bio}</p>
                <div className="mt-2">
                  {typeof contribMap[m.github.toLowerCase()] === 'number' && contribMap[m.github.toLowerCase()] > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-300 bg-gray-800/80 border border-gray-700 rounded-full px-2 py-1">
                      <GitCommit className="w-3 h-3 text-gray-400" />
                      {contribMap[m.github.toLowerCase()]} commits
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-white"
                  >
                    <Github className="w-4 h-4 text-gray-400" />
                    <span>@{m.github}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                  {m.linkedin && (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-gray-300 hover:text-white"
                    >
                      <Linkedin className="w-4 h-4 text-blue-400" />
                      <span>LinkedIn</span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <h2 className="text-2xl font-semibold text-white text-center">Other Contributors</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {otherContribs && otherContribs.length > 0 ? (
                otherContribs.slice(0, 18).map((c: any) => (
                  <div key={c.login} className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 hover:border-gray-700 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                      <img src={c.avatar_url} alt={c.login} className="w-12 h-12 rounded-full border border-gray-700 object-cover" />
                      <div>
                        <div className="font-semibold">@{c.login}</div>
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-300 bg-gray-800/80 border border-gray-700 rounded-full px-2 py-1">
                          <GitCommit className="w-3 h-3 text-gray-400" />
                          {c.contributions} commits
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <a
                        href={c.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gray-300 hover:text-white"
                     >
                        <Github className="w-4 h-4 text-gray-400" />
                        <span>View Profile</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm col-span-full text-center">No external contributors yet. Your contributions will appear here!</p>
              )}
            </div>
          </div>
          <div className="mt-16 text-center">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition"
            >
              <Github className="w-5 h-5" />
              <span>Contribute on GitHub</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-400">
          © 2025 InnovateHubCEC
        </div>
      </footer>
    </div>
  );
};

export default Team;