import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getContest, addProblem, Contest, Problem } from '../services/contestApi';

const AdminContestProblems: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [samplesText, setSamplesText] = useState('1 2||3');
  const [testsText, setTestsText] = useState('1 2||3\n5 7||12');
  const [allowedLangs, setAllowedLangs] = useState('54,63,71,62');
  const [timeLimit, setTimeLimit] = useState('2');
  const [memoryLimit, setMemoryLimit] = useState('128000');

  const load = async () => {
    if (!contestId) return;
    setLoading(true);
    setError(null);
    try {
      const c = await getContest(contestId);
      setContest(c);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load contest');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [contestId]);

  function parsePairs(text: string): Array<{ input: string; output: string }> {
   
    return text
      .split(/\r?\n/) 
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        const [input, output] = l.split('||');
        return { input: input ?? '', output: output ?? '' };
      });
  }

  const onAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestId) return;
    if (!title || !statement) {
      alert('Title and statement are required');
      return;
    }
    try {
      setLoading(true);
      const langs = allowedLangs
        .split(',')
        .map(s => Number(s.trim()))
        .filter(n => !Number.isNaN(n));
      const body: Partial<Problem> & { title: string; statement: string } = {
        title,
        statement,
        samples: parsePairs(samplesText),
        testCases: parsePairs(testsText) as any,
        allowedLangs: langs.length ? langs : undefined,
        timeLimit: Number(timeLimit) || undefined,
        memoryLimit: Number(memoryLimit) || undefined,
      } as any;
      await addProblem(contestId, body);
      setTitle('');
      setStatement('');
      await load();
      alert('Problem added');
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Failed to add problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin • Contest Problems</h1>
          <div className="flex items-center gap-2">
            <Link to="/admin/contests" className="text-sm text-blue-400 hover:underline">Back to Contests</Link>
            {contestId && (
              <Link to={`/contests/${contestId}`} className="text-sm text-gray-300 hover:underline">View Contest</Link>
            )}
          </div>
        </div>

        {loading && <div className="text-sm text-gray-400">Loading...</div>}
        {error && <div className="text-sm text-red-400 mb-3">{error}</div>}

        {contest && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <div className="font-medium text-lg">{contest.title}</div>
            <div className="text-sm text-gray-400">{new Date(contest.startAt).toLocaleString()} → {new Date(contest.endAt).toLocaleString()}</div>
          </div>
        )}

        <form onSubmit={onAddProblem} className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8 space-y-3">
          <div className="text-lg font-medium">Add Problem</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
          />
          <textarea
            value={statement}
            onChange={e => setStatement(e.target.value)}
            placeholder="Statement"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 min-h-[120px]"
          />
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Samples (one per line: input||output)</label>
              <textarea
                value={samplesText}
                onChange={e => setSamplesText(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 min-h-[90px]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Test Cases (one per line: input||output)</label>
              <textarea
                value={testsText}
                onChange={e => setTestsText(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 min-h-[90px]"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={allowedLangs}
              onChange={e => setAllowedLangs(e.target.value)}
              placeholder="Allowed Lang IDs (comma-separated)"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
            <input
              value={timeLimit}
              onChange={e => setTimeLimit(e.target.value)}
              placeholder="Time limit (sec)"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
            <input
              value={memoryLimit}
              onChange={e => setMemoryLimit(e.target.value)}
              placeholder="Memory limit (KB)"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">Add Problem</button>
            {loading && <span className="text-sm text-gray-400">Working...</span>}
          </div>
        </form>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-lg font-medium mb-3">Existing Problems</div>
          {!contest?.problems?.length ? (
            <div className="text-sm text-gray-400">No problems yet.</div>
          ) : (
            <div className="space-y-2">
              {contest?.problems?.map((p: any) => (
                <div key={p._id} className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded px-3 py-2">
                  <div className="font-medium">{p.title}</div>
                  <Link to={`/contests/${contestId}/problems/${p._id}`} className="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600">Open</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContestProblems;
