import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProblem, submitSolution, Problem, getContest, Contest, runCustomTest, getMyProblemStatus } from '../services/contestApi';
import { languageNameFromId } from '../services/judge0Langs';

const SolveProblem: React.FC = () => {
  const { contestId, problemId } = useParams<{ contestId: string; problemId: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [languageId, setLanguageId] = useState<number | null>(null);
  const [sourceCode, setSourceCode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [status, setStatus] = useState<'Upcoming' | 'Running' | 'Ended' | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'solutions'>('description');
  const [testCaseInput, setTestCaseInput] = useState<string>('');
  const [testCaseOutput, setTestCaseOutput] = useState<string>('');
  const [customTestCaseResult, setCustomTestCaseResult] = useState<any>(null);
  const [runningCustomTest, setRunningCustomTest] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [myStatus, setMyStatus] = useState<{ completed: boolean; acceptedAt?: string | null } | null>(null);

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
        
        // Load saved code if exists
        const savedCode = localStorage.getItem(`code-${contestId}-${problemId}-${firstLang}`);
        if (savedCode) {
          setSourceCode(savedCode);
        }
        
        // Set first sample as custom test case if available
        if (data.samples && data.samples.length > 0) {
          setTestCaseInput(data.samples[0].input);
          setTestCaseOutput(data.samples[0].output);
        }
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

  // Fetch my completion status for this problem
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!contestId || !problemId) return;
        const s = await getMyProblemStatus(contestId, problemId);
        if (!mounted) return;
        setMyStatus(s);
      } catch (_) {
        setMyStatus(null);
      }
    })();
    return () => { mounted = false; };
  }, [contestId, problemId]);

  const nextProblemId = useMemo(() => {
    if (!contest?.problems || !problemId) return null;
    const idx = contest.problems.findIndex(p => String(p._id) === String(problemId));
    if (idx === -1) return null;
    const next = contest.problems[idx + 1];
    return next?._id || null;
  }, [contest, problemId]);

  const showSaveNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

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
      if (data?.verdict === 'Accepted') {
        setMyStatus({ completed: true, acceptedAt: new Date().toISOString() });
      }
    } catch (e: any) {
      setResult({ error: e?.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveCode = async () => {
    if (!contestId || !problemId || !languageId) return;
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem(`code-${contestId}-${problemId}-${languageId}`, sourceCode);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      showSaveNotification('Code saved successfully!');
    } catch (e: any) {
      showSaveNotification('Failed to save code');
    } finally {
      setSaving(false);
    }
  };

  const onRunCustomTestCase = async () => {
    if (!contestId || !problemId || !languageId) return;
    setRunningCustomTest(true);
    setCustomTestCaseResult(null);
    try {
      const data = await runCustomTest(
        contestId,
        problemId,
        { languageId, sourceCode, stdin: testCaseInput, expectedOutput: testCaseOutput || undefined }
      );

      const passed = data.verdict === 'Accepted';
      const actual = (data.stdout ?? '').trim();
      setCustomTestCaseResult({
        passed,
        input: testCaseInput,
        expected: testCaseOutput,
        actual,
        verdict: data.verdict,
        timeMs: data.timeMs,
        stderr: data.stderr
      });
    } catch (e: any) {
      setCustomTestCaseResult({ error: e?.message || 'Test execution failed' });
    } finally {
      setRunningCustomTest(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
  
  if (!problem) return <div className="max-w-5xl mx-auto p-4 text-red-400">{error || 'Problem not found'}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      {/* Notification */}
      <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform ${showNotification ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${notificationMessage.includes('successfully') ? 'bg-green-600' : 'bg-red-600'}`}>
        {notificationMessage}
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg transition-all duration-300 hover:shadow-purple-900/10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-purple-300 hover:text-purple-200 transition-colors duration-200 p-2 rounded-lg hover:bg-purple-900/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <div className="space-y-1">
              <div className="text-xs text-purple-300 flex items-center gap-1">
                <Link to={`/contests`} className="hover:text-purple-200 transition-colors">Contests</Link>
                <span className="mx-1">/</span>
                <Link to={`/contests/${contestId}`} className="hover:text-purple-200 transition-colors">{contest?.title || 'Contest'}</Link>
              </div>
              <h1 className="text-2xl font-semibold text-white bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">{problem.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status && (
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${status === 'Running' ? 'text-green-300 border border-green-500/50 bg-green-900/20 shadow-sm shadow-green-500/20' : status === 'Upcoming' ? 'text-yellow-300 border border-yellow-500/50 bg-yellow-900/20 shadow-sm shadow-yellow-500/20' : 'text-gray-300 border border-gray-500/50 bg-gray-900/20'}`}>
                {status}
              </span>
            )}
            {timeLeft && (
              <span className="px-3 py-1.5 rounded-full text-xs text-purple-200 border border-purple-500/50 bg-purple-900/20 shadow-sm shadow-purple-500/20 transition-all duration-500 hover:scale-105">
                {timeLeft}
              </span>
            )}
            {myStatus?.completed && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium text-green-300 border border-green-500/50 bg-green-900/20 shadow-sm shadow-green-500/20">
                Completed
              </span>
            )}
            {myStatus?.completed && nextProblemId && (
              <button
                onClick={() => navigate(`/contests/${contestId}/problems/${nextProblemId}`)}
                className="ml-2 px-3 py-1.5 rounded-lg text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105"
              >
                Next Problem
              </button>
            )}
          </div>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Problem statement */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-purple-900/10">
            <div className="flex border-b border-gray-700">
              <button 
                className={`px-4 py-3 text-sm transition-all duration-300 ${activeTab === 'description' ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-900/10' : 'text-gray-300 hover:text-purple-200 hover:bg-gray-700/30'}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`px-4 py-3 text-sm transition-all duration-300 ${activeTab === 'submissions' ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-900/10' : 'text-gray-300 hover:text-purple-200 hover:bg-gray-700/30'}`}
                onClick={() => setActiveTab('submissions')}
              >
                Submissions
              </button>
              <button 
                className={`px-4 py-3 text-sm transition-all duration-300 ${activeTab === 'solutions' ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-900/10' : 'text-gray-300 hover:text-purple-200 hover:bg-gray-700/30'}`}
                onClick={() => setActiveTab('solutions')}
              >
                Solutions
              </button>
            </div>
            
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {activeTab === 'description' && (
                <>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${problem.difficulty === 'easy' ? 'text-green-300 bg-green-900/30' : problem.difficulty === 'medium' ? 'text-yellow-300 bg-yellow-900/30' : 'text-red-300 bg-red-900/30'}`}>
                      {problem.difficulty || "Easy".charAt(0).toUpperCase() + problem.difficulty?.slice(1) || 'Unknown'}
                    </span>
                    {/* {problem.tags && problem.tags.map ((tag, index) => (
                      <span key={index} className="px-2 py-1 rounded-full text-xs text-blue-300 bg-blue-900/30 transition-all duration-300 hover:scale-105">
                        {tag}
                      </span>
                    ))} */}
                  </div>
                  
                  <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 transition-all duration-300 hover:border-purple-500/30">
                    <pre className="whitespace-pre-wrap text-gray-300">{problem.statement}</pre>
                  </div>
                  
                  {problem.inputFormat && (
                    <div className="transition-all duration-300 hover:scale-[1.01]">
                      <div className="text-purple-300 font-medium mb-2">Input</div>
                      <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                        <pre className="whitespace-pre-wrap text-gray-300">{problem.inputFormat}</pre>
                      </div>
                    </div>
                  )}
                  
                  {problem.outputFormat && (
                    <div className="transition-all duration-300 hover:scale-[1.01]">
                      <div className="text-purple-300 font-medium mb-2">Output</div>
                      <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                        <pre className="whitespace-pre-wrap text-gray-300">{problem.outputFormat}</pre>
                      </div>
                    </div>
                  )}
                  
                  {Array.isArray(problem.samples) && problem.samples.length > 0 && (
                    <div>
                      <div className="text-purple-300 font-medium mb-2">Examples</div>
                      {problem.samples.map((s, idx) => (
                        <div key={idx} className="mb-4 transition-all duration-300 hover:scale-[1.01]">
                          <div className="text-sm text-gray-400 mb-1">Example {idx + 1}:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                              <div className="text-xs text-gray-400">Input</div>
                              <pre className="whitespace-pre-wrap text-gray-300 mt-1">{s.input}</pre>
                            </div>
                            <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                              <div className="text-xs text-gray-400">Output</div>
                              <pre className="whitespace-pre-wrap text-gray-300 mt-1">{s.output}</pre>
                            </div>
                          </div>
                          {s.explanation && (
                            <div className="mt-2 bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                              <div className="text-xs text-gray-400">Explanation</div>
                              <div className="text-gray-300 text-sm mt-1">{s.explanation}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {problem.constraints && (
                    <div className="transition-all duration-300 hover:scale-[1.01]">
                      <div className="text-purple-300 font-medium mb-2">Constraints</div>
                      <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                        <pre className="whitespace-pre-wrap text-gray-300">{problem.constraints}</pre>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {activeTab === 'submissions' && (
                <div className="text-gray-300 p-4 text-center">
                  <p>Your submissions will appear here.</p>
                  {/* Submission history would be displayed here */}
                </div>
              )}
              
              {activeTab === 'solutions' && (
                <div className="text-gray-300 p-4 text-center">
                  <p>Solutions will be available after the contest ends.</p>
                  {/* Solutions would be displayed here */}
                </div>
              )}
            </div>
          </div>

          {/* Right: Editor and console */}
          <div className="space-y-4">
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg transition-all duration-300 hover:shadow-purple-900/10">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-300">Language</label>
                  <select
                    className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 transition-all duration-300 hover:border-purple-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    value={languageId ?? ''}
                    onChange={(e) => {
                      const newLangId = Number(e.target.value);
                      setLanguageId(newLangId);
                      
                      // Load saved code for this language if exists
                      if (contestId && problemId) {
                        const savedCode = localStorage.getItem(`code-${contestId}-${problemId}-${newLangId}`);
                        if (savedCode) {
                          setSourceCode(savedCode);
                        } else {
                          setSourceCode('');
                        }
                      }
                    }}
                  >
                    {allowedLangs.map((id) => (
                      <option key={id} value={id}>{languageNameFromId(id)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onSaveCode}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-700 disabled:opacity-50 transition-all duration-300 hover:border-purple-500 hover:text-purple-300 flex items-center gap-1"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Save
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceCode('')}
                    className="px-3 py-1.5 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-700 transition-all duration-300 hover:border-red-500 hover:text-red-300 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>
              <div className="p-3">
                <textarea
                  className="w-full h-[300px] bg-gray-900 text-gray-200 border border-gray-700 rounded-lg p-4 font-mono text-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 custom-scrollbar"
                  placeholder="Write your solution here..."
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                />
              </div>
              <div className="px-4 py-3 border-t border-gray-700 flex justify-end gap-2">
                <button
                  onClick={onRunCustomTestCase}
                  disabled={runningCustomTest || !sourceCode}
                  className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all duration-300 ${runningCustomTest || !sourceCode ? 'bg-gray-700 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'}`}
                >
                  {runningCustomTest ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Run Test
                    </>
                  )}
                </button>
                <button
                  onClick={onSubmit}
                  disabled={submitting || !sourceCode}
                  className={`px-4 py-2 rounded-lg flex items-center gap-1 transition-all duration-300 ${submitting || !sourceCode ? 'bg-gray-700 text-gray-400' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:scale-105 shadow-lg shadow-purple-500/20'}`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM3.707 9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Custom Test Case Section */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg transition-all duration-300 hover:shadow-purple-900/10">
              <div className="px-4 py-3 border-b border-gray-700 text-sm text-gray-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Test Cases
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Input</label>
                  <textarea
                    className="w-full h-20 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg p-3 font-mono text-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 custom-scrollbar"
                    value={testCaseInput}
                    onChange={(e) => setTestCaseInput(e.target.value)}
                    placeholder="Enter test case input"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Expected Output</label>
                  <textarea
                    className="w-full h-20 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg p-3 font-mono text-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 custom-scrollbar"
                    value={testCaseOutput}
                    onChange={(e) => setTestCaseOutput(e.target.value)}
                    placeholder="Enter expected output"
                  />
                </div>
              </div>
            </div>

            {/* Result/Console */}
            {(result || customTestCaseResult) && (
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg transition-all duration-300 hover:shadow-purple-900/10">
                <div className="text-sm text-gray-300 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {customTestCaseResult ? 'Test Result' : 'Submission Result'}
                </div>
                
                {customTestCaseResult ? (
                  customTestCaseResult.error ? (
                    <div className="text-red-400 p-3 bg-red-900/20 rounded-lg border border-red-800/50">{customTestCaseResult.error}</div>
                  ) : (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg border ${customTestCaseResult.passed ? 'text-green-400 bg-green-900/20 border-green-800/50' : 'text-red-400 bg-red-900/20 border-red-800/50'}`}>
                        {customTestCaseResult.passed ? 'Test Passed' : 'Test Failed'}
                      </div>
                      {customTestCaseResult.verdict && (
                        <div className="text-sm text-gray-400">Verdict: {customTestCaseResult.verdict}</div>
                      )}
                      {typeof customTestCaseResult.timeMs === 'number' && (
                        <div className="text-sm text-gray-400">Time: {customTestCaseResult.timeMs} ms</div>
                      )}
                      {customTestCaseResult.input && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-400">Input</div>
                          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 mt-1">
                            <pre className="whitespace-pre-wrap text-gray-300">{customTestCaseResult.input}</pre>
                          </div>
                        </div>
                      )}
                      {customTestCaseResult.expected && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-400">Expected</div>
                          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 mt-1">
                            <pre className="whitespace-pre-wrap text-gray-300">{customTestCaseResult.expected}</pre>
                          </div>
                        </div>
                      )}
                      {customTestCaseResult.actual && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-400">Actual</div>
                          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 mt-1">
                            <pre className="whitespace-pre-wrap text-gray-300">{customTestCaseResult.actual}</pre>
                          </div>
                        </div>
                      )}
                      {customTestCaseResult.stderr && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-400">Stderr</div>
                          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 mt-1">
                            <pre className="whitespace-pre-wrap text-gray-300">{customTestCaseResult.stderr}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : result?.error ? (
                  <div className="text-red-400 p-3 bg-red-900/20 rounded-lg border border-red-800/50">{result.error}</div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-gray-200 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                      Verdict: <span className={result.verdict === 'Accepted' ? 'text-green-400' : 'text-red-400'}>{result.verdict}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Passed {result.passed}/{result.total}
                    </div>
                    {result.execTimeMs != null && (
                      <div className="text-sm text-gray-400">Time: {result.execTimeMs} ms</div>
                    )}
                    {result.stdout && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-400">Stdout</div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 mt-1">
                          <pre className="whitespace-pre-wrap text-gray-300">{result.stdout}</pre>
                        </div>
                      </div>
                    )}
                    {result.stderr && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-400">Stderr</div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 mt-1">
                          <pre className="whitespace-pre-wrap text-gray-300">{result.stderr}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default SolveProblem;