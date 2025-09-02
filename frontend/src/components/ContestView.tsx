import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getContest, Contest } from '../services/contestApi';
import { languageNameFromId } from '../services/judge0Langs';

const ContestView: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'Upcoming' | 'Running' | 'Ended' | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!contestId) return;
        const data = await getContest(contestId);
        if (mounted) setContest(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load contest');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [contestId]);

  useEffect(() => {
    if (!contest) return;
    const update = () => {
      const now = Date.now();
      const start = new Date(contest.startAt).getTime();
      const end = new Date(contest.endAt).getTime();
      const st = now < start ? 'Upcoming' as const : now > end ? 'Ended' as const : 'Running' as const;
      setStatus(st);
      let ms = st === 'Upcoming' ? (start - now) : st === 'Running' ? (end - now) : 0;
      if (ms < 0) ms = 0;
      const hh = Math.floor(ms / 3600000);
      const mm = Math.floor((ms % 3600000) / 60000);
      const ss = Math.floor((ms % 60000) / 1000);
      setTimeLeft(`${hh.toString().padStart(2,'0')}:${mm.toString().padStart(2,'0')}:${ss.toString().padStart(2,'0')}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [contest]);

  if (loading) return null;
  if (!contest) return <div className="max-w-5xl mx-auto p-4 text-red-400">{error || 'Contest not found'}</div>;

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <div className="text-xs text-purple-300">
            <Link to="/contests">Contests</Link>
            <span className="mx-1">/</span>
            <span>{contest.title}</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">{contest.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <span className={`px-2 py-1 rounded text-xs border ${status === 'Running' ? 'text-green-300 border-green-600 bg-green-900/30' : status === 'Upcoming' ? 'text-yellow-300 border-yellow-600 bg-yellow-900/30' : 'text-gray-300 border-gray-600 bg-gray-900/30'}`}>{status}</span>
          )}
          {timeLeft && (
            <span className="px-2 py-1 rounded text-xs text-purple-200 border border-purple-700 bg-purple-900/30">{timeLeft}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Problems list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 text-sm text-gray-300 flex items-center justify-between">
              <span>Problems</span>
              <Link to={`/contests/${contest._id}/leaderboard`} className="text-purple-300 text-xs hover:underline">Leaderboard →</Link>
            </div>
            <div className="divide-y divide-gray-700">
              {(contest.problems || []).map((p, idx) => (
                <Link key={p._id} to={`/contests/${contest._id}/problems/${p._id}`} className="block hover:bg-gray-800">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="text-gray-200">
                      <span className="text-gray-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {p.title}
                    </div>
                    {Array.isArray(p.allowedLangs) && p.allowedLangs.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {p.allowedLangs.map((id: number) => languageNameFromId(id)).join(', ')}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
              {(contest.problems || []).length === 0 && (
                <div className="px-4 py-6 text-sm text-gray-400">No problems added yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Contest info */}
        <div className="space-y-4">
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-700 text-sm text-gray-300">Overview</div>
            <div className="p-4 space-y-2 text-sm text-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Starts</span>
                <span>{new Date(contest.startAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Ends</span>
                <span>{new Date(contest.endAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Duration</span>
                <span>{Math.max(0, Math.round((new Date(contest.endAt).getTime() - new Date(contest.startAt).getTime()) / 60000))} mins</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 border border-gray-700 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-700 text-sm text-gray-300">About</div>
            <div className="p-4 text-gray-300 whitespace-pre-wrap">{contest.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestView;
