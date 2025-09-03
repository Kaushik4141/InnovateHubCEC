import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getContest, Contest } from '../services/contestApi';
import { languageNameFromId } from '../services/judge0Langs';
import {
  Clock, Calendar, Award, Users, ChevronRight, 
  BarChart3, FileText, AlertCircle, Loader, ArrowLeft
} from 'lucide-react';

const ContestView: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'Upcoming' | 'Running' | 'Ended' | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

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

  const updateStatus = useCallback(() => {
    if (!contest) return;
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
  }, [contest]);

  useEffect(() => {
    if (!contest) return;
    updateStatus();
    const t = setInterval(updateStatus, 1000);
    return () => clearInterval(t);
  }, [contest, updateStatus]);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-[1200px] mx-auto p-4 pt-8 flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="h-12 w-12 text-purple-500 animate-spin" />
            <p className="text-gray-300">Loading contest details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-[1200px] mx-auto p-4 pt-8">
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <AlertCircle className="h-16 w-16 text-red-400" />
            <div className="text-red-400 text-center">
              {error || 'Contest not found'}
            </div>
            <button 
              onClick={() => navigate('/contests')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            >
              Back to Contests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const duration = Math.max(0, Math.round((new Date(contest.endAt).getTime() - new Date(contest.startAt).getTime()) / 60000));

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back Button */}
      <div className="max-w-[1200px] mx-auto p-4 pt-6">
        <button
          onClick={() => navigate('/contests')}
          className="flex items-center text-purple-300 hover:text-purple-200 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Contests
        </button>
      </div>
      
      <div className="max-w-[1200px] mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 p-4 bg-gray-800/40 rounded-xl border border-gray-700 backdrop-blur-sm transition-all duration-300 hover:bg-gray-800/60">
          <div className="space-y-2 mb-4 md:mb-0">
            <div className="text-xs text-purple-300 flex items-center">
              <span className="truncate">{contest.title}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{contest.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {status && (
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center transition-all duration-300 ${status === 'Running' ? 'text-green-300 border border-green-600/50 bg-green-900/20 shadow-lg shadow-green-900/10' : status === 'Upcoming' ? 'text-yellow-300 border border-yellow-600/50 bg-yellow-900/20 shadow-lg shadow-yellow-900/10' : 'text-gray-300 border border-gray-600/50 bg-gray-900/20'}`}>
                {status === 'Running' && <Clock className="h-3 w-3 mr-1 animate-pulse" />}
                {status}
              </span>
            )}
            {timeLeft && (
              <span className="px-3 py-1.5 rounded-full text-xs text-purple-200 border border-purple-700/50 bg-purple-900/20 font-medium flex items-center shadow-lg shadow-purple-900/10">
                <Clock className="h-3 w-3 mr-1" />
                {timeLeft}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problems list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:bg-gray-800/60 hover:shadow-lg">
              <div className="px-5 py-4 border-b border-gray-700 text-sm text-gray-300 flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Problems
                </span>
                <Link 
                  to={`/contests/${contest._id}/leaderboard`} 
                  className="text-purple-300 text-xs hover:text-purple-200 transition-colors flex items-center"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Leaderboard →
                </Link>
              </div>
              <div className="divide-y divide-gray-700">
                {(contest.problems || []).map((p, idx) => (
                  <Link 
                    key={p._id} 
                    to={`/contests/${contest._id}/problems/${p._id}`} 
                    className="block hover:bg-gray-800/50 transition-all duration-300 group"
                  >
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="text-gray-200 flex items-center">
                        <span className="text-gray-400 mr-3 font-mono">{String.fromCharCode(65 + idx)}.</span>
                        <span className="group-hover:text-purple-300 transition-colors">{p.title}</span>
                      </div>
                      {Array.isArray(p.allowedLangs) && p.allowedLangs.length > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-900/50 px-2 py-1 rounded-full">
                          {p.allowedLangs.map((id: number) => languageNameFromId(id)).join(', ')}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                {(contest.problems || []).length === 0 && (
                  <div className="px-5 py-8 text-sm text-gray-400 flex flex-col items-center justify-center">
                    <FileText className="h-8 w-8 mb-2 opacity-50" />
                    No problems added yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contest info */}
          <div className="space-y-4">
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl transition-all duration-300 hover:bg-gray-800/60 hover:shadow-lg">
              <div className="px-5 py-4 border-b border-gray-700 text-sm text-gray-300 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Overview
              </div>
              <div className="p-5 space-y-4 text-sm text-gray-300">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Starts
                  </span>
                  <span className="text-white">{new Date(contest.startAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Ends
                  </span>
                  <span className="text-white">{new Date(contest.endAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    Duration
                  </span>
                  <span className="text-white">{duration} mins</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/40 border border-gray-700 rounded-xl transition-all duration-300 hover:bg-gray-800/60 hover:shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-700 text-sm text-gray-300 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                About
                <button 
                  onClick={toggleDescription}
                  className="ml-auto text-xs text-purple-300 hover:text-purple-200 transition-colors"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              </div>
              <div className={`p-5 text-gray-300 whitespace-pre-wrap transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-24'}`}>
                {contest.description || 'No description provided.'}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col space-y-3">
              <Link 
                to={`/contests/${contest._id}/leaderboard`}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-purple-900/20"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Leaderboard
              </Link>
              
              {status === 'Running' && contest.problems && contest.problems.length > 0 && (
                <Link 
                  to={`/contests/${contest._id}/problems/${contest.problems[0]._id}`}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-green-900/20"
                >
                  Start Solving
                </Link>
              )}
              
              <button 
                onClick={() => navigate('/contests')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center transition-all duration-300"
              >
                Back to Contests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestView;