import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLeaderboard, LeaderboardRow, getUserSubmissions, Submission } from '../services/contestApi';
import { getCurrentUser, type CurrentUser } from '../services/userApi';
import { languageNameFromId } from '../services/judge0Langs';
import { Eye, X, Code, Clock, CheckCircle, ExternalLink } from 'lucide-react';

const ContestLeaderboard: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<LeaderboardRow | null>(null);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getCurrentUser();
        if (mounted) setMe(u);
      } catch (_) {
        if (mounted) setMe(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleViewSubmissions = async (user: LeaderboardRow) => {
    if (!contestId || !me?.isAdmin) return;
    
    setSelectedUser(user);
    setLoadingSubmissions(true);
    setSubmissionsError(null);
    
    try {
      const submissions = await getUserSubmissions(contestId, user.userId);
      setUserSubmissions(submissions);
    } catch (e: any) {
      setSubmissionsError(e?.message || 'Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const closeSubmissionsModal = () => {
    setSelectedUser(null);
    setUserSubmissions([]);
    setSubmissionsError(null);
  };

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
              {me?.isAdmin && <th className="text-left px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.userId} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
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
                {me?.isAdmin && (
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleViewSubmissions(r)}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Solutions</span>
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={me?.isAdmin ? 5 : 4} className="px-4 py-6 text-center text-gray-400">No accepted submissions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Submissions Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-60" onClick={closeSubmissionsModal}></div>
          <div className="relative bg-gray-900 border border-gray-700 rounded-xl w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">
                Solutions by {selectedUser.fullname}
              </h3>
              <button 
                onClick={closeSubmissionsModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  <span className="ml-3 text-gray-300">Loading solutions...</span>
                </div>
              ) : submissionsError ? (
                <div className="text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-800/50">
                  {submissionsError}
                </div>
              ) : userSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <Code className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No solutions found</h3>
                  <p className="text-gray-500">This user hasn't submitted any accepted solutions yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {userSubmissions.map((submission, index) => (
                    <div key={submission._id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span className="text-green-400 font-medium">Accepted</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-300 font-medium">
                            {submission.problem?.title || `Problem ${index + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{submission.execTimeMs}ms</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Code className="h-4 w-4" />
                            <span>{languageNameFromId(submission.languageId || 0)}</span>
                          </span>
                          <span>
                            {new Date(submission.createdAt || '').toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Source Code</h4>
                          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                              {submission.sourceCode}
                            </pre>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Test Results</h4>
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                              <div className="text-sm text-gray-300">
                                Passed: <span className="text-green-400">{submission.passed}</span> / {submission.total}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Performance</h4>
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                              <div className="text-sm text-gray-300">
                                Execution Time: <span className="text-blue-400">{submission.execTimeMs}ms</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {submission.stdout && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Output</h4>
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                                {submission.stdout}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestLeaderboard;
