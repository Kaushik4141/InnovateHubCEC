import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLeaderboard, LeaderboardRow } from '../services/contestApi';

const ContestLeaderboard: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!contestId) return;
        const data = await getLeaderboard(contestId);
        if (mounted) setRows(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load leaderboard');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [contestId]);

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <Link to={`/contests/${contestId}`} className="text-sm text-purple-300">← Back to contest</Link>
      </div>
      <h1 className="text-2xl font-semibold text-white mb-4">Leaderboard</h1>
      {error && <div className="text-red-400 mb-3">{error}</div>}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900 text-gray-300 text-sm">
            <tr>
              <th className="text-left px-4 py-2">#</th>
              <th className="text-left px-4 py-2">User</th>
              <th className="text-left px-4 py-2">Solved</th>
              <th className="text-left px-4 py-2">Last AC</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.userId} className="border-t border-gray-700">
                <td className="px-4 py-2 text-gray-400">{idx + 1}</td>
                <td className="px-4 py-2 flex items-center space-x-3">
                  <img
                    src={r.avatar || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(r.fullname)}&size=32`}
                    alt={r.fullname}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(r.fullname)}&size=32`; }}
                  />
                  <span className="text-gray-200">{r.fullname}</span>
                </td>
                <td className="px-4 py-2 text-gray-200">{r.solved}</td>
                <td className="px-4 py-2 text-gray-400">{new Date(r.lastAcceptedAt).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">No accepted submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContestLeaderboard;
