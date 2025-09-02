import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProblem, submitSolution, Problem, getContest, Contest } from '../services/contestApi';
import { languageNameFromId } from '../services/judge0Langs';

const SolveProblem: React.FC = () => {
  const { contestId, problemId } = useParams<{ contestId: string; problemId: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [languageId, setLanguageId] = useState<number | null>(null);
  const [sourceCode, setSourceCode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [status, setStatus] = useState<'Upcoming' | 'Running' | 'Ended' | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!contestId || !problemId) return;
        const data = await getProblem(contestId, problemId);
        if (!mounted) return;
        setProblem(data);
        const firstLang = (Array.isArray(data.allowedLangs) && data.allowedLangs.length > 0) ? data.allowedLangs[0] : 63; 
        setLanguageId(firstLang);
      } catch (e: any) {
        setError(e?.message || 'Failed to load problem');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [contestId, problemId]);

  // Fetch contest meta for header + timer
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!contestId) return;
        const c = await getContest(contestId);
        if (!mounted) return;
        setContest(c);
        // initialize status + timer
        const update = () => {
          const now = Date.now();
          const start = new Date(c.startAt).getTime();
          const end = new Date(c.endAt).getTime();
          const st = now < start ? 'Upcoming' : now > end ? 'Ended' : 'Running';
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
      } catch (e) {
        // non-fatal
      }
    })();
    return () => { mounted = false; };
  }, [contestId]);

  const allowedLangs = useMemo(() => {
    if (!problem?.allowedLangs || problem.allowedLangs.length === 0) return [63];
    return problem.allowedLangs;
  }, [problem]);

  const onSubmit = async () => {
    if (!contestId || !problemId || !languageId) return;
    setSubmitting(true);
    setResult(null);
    try {
      const data = await submitSolution(contestId, problemId, { languageId, sourceCode });
      setResult(data);
    } catch (e: any) {
      setResult({ error: e?.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!problem) return <div className="max-w-5xl mx-auto p-4 text-red-400">{error || 'Problem not found'}</div>;

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <div className="text-xs text-purple-300">
            <Link to={`/contests`}>Contests</Link>
            <span className="mx-1">/</span>
            <Link to={`/contests/${contestId}`}>{contest?.title || 'Contest'}</Link>
          </div>
          <h1 className="text-2xl font-semibold text-white">{problem.title}</h1>
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

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Problem statement */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 text-sm text-gray-300">Description</div>
          <div className="p-4 space-y-4">
            <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900 p-4 rounded-lg border border-gray-700">{problem.statement}</pre>
            {problem.inputFormat && (
              <div>
                <div className="text-purple-300 font-medium mb-2">Input</div>
                <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-800">{problem.inputFormat}</pre>
              </div>
            )}
            {problem.outputFormat && (
              <div>
                <div className="text-purple-300 font-medium mb-2">Output</div>
                <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-800">{problem.outputFormat}</pre>
              </div>
            )}
            {Array.isArray(problem.samples) && problem.samples.length > 0 && (
              <div>
                <div className="text-purple-300 font-medium mb-2">Samples</div>
                {problem.samples.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div>
                      <div className="text-xs text-gray-400">Input</div>
                      <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-800">{s.input}</pre>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Output</div>
                      <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-800">{s.output}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor */}
        <div className="space-y-4">
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-300">Language</label>
                <select
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200"
                  value={languageId ?? ''}
                  onChange={(e) => setLanguageId(Number(e.target.value))}
                >
                  {allowedLangs.map((id) => (
                    <option key={id} value={id}>{languageNameFromId(id)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSourceCode('')}
                  className="px-3 py-1.5 rounded border border-gray-600 text-gray-200 hover:bg-gray-700"
                >
                  Reset
                </button>
                <button
                  onClick={onSubmit}
                  disabled={submitting || !sourceCode}
                  className={`px-4 py-2 rounded ${submitting || !sourceCode ? 'bg-gray-700 text-gray-400' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
            <div className="p-3">
              <textarea
                className="w-full h-[380px] bg-gray-900 text-gray-200 border border-gray-700 rounded p-3 font-mono text-sm"
                placeholder="Write your solution here..."
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
              />
            </div>
          </div>

          {/* Result/Console */}
          {result && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
              {result.error ? (
                <div className="text-red-400">{result.error}</div>
              ) : (
                <div>
                  <div className="text-gray-200">
                    Verdict: <span className={result.verdict === 'AC' ? 'text-green-400' : 'text-red-400'}>{result.verdict}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Passed {result.passed}/{result.total}
                  </div>
                  {result.execTimeMs != null && (
                    <div className="text-sm text-gray-400">Time: {result.execTimeMs} ms</div>
                  )}
                  {result.stdout && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-400">Stdout</div>
                      <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-800">{result.stdout}</pre>
                    </div>
                  )}
                  {result.stderr && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-400">Stderr</div>
                      <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900 p-3 rounded-lg border border-gray-800">{result.stderr}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolveProblem;
