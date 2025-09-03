import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getContest, addProblem, Contest, Problem, listProblemsBank, attachProblem, ProblemSummary, attachProblemsBulk } from '../services/contestApi';

const AdminContestProblems: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [samplesText, setSamplesText] = useState('1 2||3');
  const [testsText, setTestsText] = useState('1 2||3\n5 7||12');
  const [allowedLangs, setAllowedLangs] = useState('54,63,71,62,50');
  const [timeLimit, setTimeLimit] = useState('2');
  const [memoryLimit, setMemoryLimit] = useState('128000');

  const [bankQuery, setBankQuery] = useState('');
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankResults, setBankResults] = useState<ProblemSummary[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

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

  const searchBank = async () => {
    setBankLoading(true);
    setBankError(null);
    try {
      const res = await listProblemsBank(bankQuery || undefined, 20, 0);
      setBankResults(res);
      const inView = new Set(res.map(r => r._id));
      setSelected(prev => prev.filter(id => inView.has(id)));
    } catch (e: any) {
      setBankError(e?.response?.data?.message || e?.message || 'Failed to load problem bank');
    } finally {
      setBankLoading(false);
    }
  };

  const onAttach = async (pid: string) => {
    if (!contestId) return;
    try {
      setBankLoading(true);
      await attachProblem(contestId, pid);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Failed to attach problem');
    } finally {
      setBankLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const onAttachSelected = async () => {
    if (!contestId || selected.length === 0) return;
    try {
      setBankLoading(true);
      await attachProblemsBulk(contestId, selected);
      setSelected([]);
      await load();
      await searchBank();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Failed to attach selected');
    } finally {
      setBankLoading(false);
    }
  };

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

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8">
          <div className="text-lg font-medium mb-3">Add Existing Problem</div>
          <div className="flex flex-col md:flex-row gap-2 mb-3">
            <input
              value={bankQuery}
              onChange={e => setBankQuery(e.target.value)}
              placeholder="Search problems by title"
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2"
            />
            <button onClick={searchBank} type="button" className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700">Search</button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">Selected: {selected.length}</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onAttachSelected}
                disabled={bankLoading || selected.length === 0}
                className="px-3 py-1.5 text-sm rounded bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >Attach Selected</button>
              <button
                type="button"
                onClick={() => setSelected([])}
                disabled={selected.length === 0}
                className="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
              >Clear</button>
            </div>
          </div>
          {bankLoading && <div className="text-sm text-gray-400">Loading...</div>}
          {bankError && <div className="text-sm text-red-400 mb-2">{bankError}</div>}
          {!bankLoading && !bankResults.length && (
            <div className="text-sm text-gray-400">Use search to find existing problems.</div>
          )}
          {!!bankResults.length && (
            <div className="space-y-2">
              {bankResults.map(p => (
                <div key={p._id} className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded px-3 py-2">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} className="mt-1" />
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-gray-400">TL: {p.timeLimit ?? '-'}s • ML: {p.memoryLimit ?? '-'}KB</div>
                    </div>
                  </div>
                  <button onClick={() => onAttach(p._id)} className="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600" disabled={bankLoading}>Attach</button>
                </div>
              ))}
            </div>
          )}
        </div>

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
