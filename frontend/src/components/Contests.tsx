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
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-white mb-4">Contests</h1>
      {error && <div className="text-red-400 mb-3">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contests.map(c => (
          <Link key={c._id} to={`/contests/${c._id}`} className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-750 border border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-purple-300">{c.title}</h2>
              <span className="text-xs text-gray-400">{new Date(c.startAt).toLocaleString()} → {new Date(c.endAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 text-sm text-gray-300 line-clamp-3">{c.description}</p>
            <div className="mt-3 text-xs text-gray-400">
              {c.problems?.length || 0} problems
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Contests;
