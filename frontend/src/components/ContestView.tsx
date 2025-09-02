import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getContest, Contest } from '../services/contestApi';
import { languageNameFromId } from '../services/judge0Langs';

const ContestView: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return null;
  if (!contest) return <div className="max-w-5xl mx-auto p-4 text-red-400">{error || 'Contest not found'}</div>;

  const now = Date.now();
  const starts = new Date(contest.startAt).getTime();
  const ends = new Date(contest.endAt).getTime();
  const status = now < starts ? 'Upcoming' : now > ends ? 'Ended' : 'Running';

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="mb-4">
        <Link to="/contests" className="text-sm text-purple-300">← Back to contests</Link>
      </div>
      <h1 className="text-2xl font-semibold text-white mb-2">{contest.title}</h1>
      <div className="text-sm text-gray-400 mb-4">
        {new Date(contest.startAt).toLocaleString()} → {new Date(contest.endAt).toLocaleString()} · <span className={status === 'Running' ? 'text-green-400' : status === 'Upcoming' ? 'text-yellow-400' : 'text-gray-400'}>{status}</span>
      </div>
      <p className="text-gray-300 mb-6 whitespace-pre-wrap">{contest.description}</p>

      <h2 className="text-lg font-medium text-purple-300 mb-2">Problems</h2>
      <div className="space-y-2">
        {(contest.problems || []).map((p, idx) => (
          <Link key={p._id} to={`/contests/${contest._id}/problems/${p._id}`} className="block bg-gray-800 border border-gray-700 rounded-lg p-3 hover:bg-gray-750">
            <div className="flex items-center justify-between">
              <div className="text-gray-200">
                <span className="text-gray-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                {p.title}
              </div>
              {Array.isArray(p.allowedLangs) && p.allowedLangs.length > 0 && (
                <span className="text-xs text-gray-500">
                  Languages: {p.allowedLangs.map((id: number) => languageNameFromId(id)).join(', ')}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link to={`/contests/${contest._id}/leaderboard`} className="text-purple-300">View Leaderboard →</Link>
      </div>
    </div>
  );
};

export default ContestView;
