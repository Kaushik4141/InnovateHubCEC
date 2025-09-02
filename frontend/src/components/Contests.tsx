import React, { useEffect, useState } from 'react';
import { listContests, Contest } from '../services/contestApi';
import { Link } from 'react-router-dom';

const Contests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await listContests();
        if (mounted) setContests(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load contests');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return null;

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      <h1 className="text-2xl font-semibold text-white mb-4">Contests</h1>
      {error && <div className="text-red-400 mb-3">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contests.map(c => {
          const now = Date.now();
          const start = new Date(c.startAt).getTime();
          const end = new Date(c.endAt).getTime();
          const status = now < start ? 'Upcoming' : now > end ? 'Ended' : 'Running';
          const durationMins = Math.max(0, Math.round((end - start) / 60000));
          return (
            <Link key={c._id} to={`/contests/${c._id}`} className="block bg-gray-800/60 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-medium text-purple-300 line-clamp-1">{c.title}</h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] border whitespace-nowrap ${status === 'Running' ? 'text-green-300 border-green-600 bg-green-900/30' : status === 'Upcoming' ? 'text-yellow-300 border-yellow-600 bg-yellow-900/30' : 'text-gray-300 border-gray-600 bg-gray-900/30'}`}>{status}</span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(c.startAt).toLocaleString()} → {new Date(c.endAt).toLocaleString()} · {durationMins} mins
                </div>
                <p className="mt-2 text-sm text-gray-300 line-clamp-3 min-h-[3.6em]">{c.description}</p>
                <div className="mt-3 text-xs text-gray-400 flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded border border-gray-700 bg-gray-900/40 text-gray-300">{c.problems?.length || 0} problems</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Contests;
