import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProblem, submitSolution, Problem, getContest, Contest } from '../services/contestApi';
import { languageNameFromId } from '../services/judge0Langs';
import Header from './Header';
import {
  Clock, Calendar, Code, Play, RotateCcw, AlertCircle,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader,
  FileText, ChevronDown, ChevronUp, Terminal, Zap, Cpu,
  BarChart3, Copy, Save, FolderOpen, Settings, Maximize,
  Minus, X, Type, BookOpen, TestTube, GitBranch, Sparkles
} from 'lucide-react';

const SolveProblem: React.FC = () => {
  const { contestId, problemId } = useParams<{ contestId: string; problemId: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [languageId, setLanguageId] = useState<number | null>(null);
  const [sourceCode, setSourceCode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [status, setStatus] = useState<'Upcoming' | 'Running' | 'Ended' | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    input: true,
    output: true,
    samples: true
  });
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(2);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

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
        
        // Try to load saved code
        const savedCode = localStorage.getItem(`code_${contestId}_${problemId}_${firstLang}`);
        if (savedCode) {
          setSourceCode(savedCode);
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

  const allowedLangs = useMemo(() => {
    if (!problem?.allowedLangs || problem.allowedLangs.length === 0) return [63];
    return problem.allowedLangs;
  }, [problem]);

  const onSubmit = async () => {
    if (!contestId || !problemId || !languageId) return;
    setSubmitting(true);
    setResult(null);
    setIsConsoleExpanded(true);
    try {
      const data = await submitSolution(contestId, problemId, { languageId, sourceCode });
      setResult(data);
    } catch (e: any) {
      setResult({ error: e?.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const saveCode = () => {
    if (contestId && problemId && languageId) {
      setSaveStatus('saving');
      localStorage.setItem(`code_${contestId}_${problemId}_${languageId}`, sourceCode);
      
      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);
    }
  };

  const handleLanguageChange = (newLanguageId: number) => {
    // Save current code for the current language
    if (contestId && problemId && languageId) {
      localStorage.setItem(`code_${contestId}_${problemId}_${languageId}`, sourceCode);
    }
    
    // Load code for the new language if exists
    const savedCode = localStorage.getItem(`code_${contestId}_${problemId}_${newLanguageId}`);
    setLanguageId(newLanguageId);
    setSourceCode(savedCode || '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-850">
        <Header />
        <div className="max-w-[1400px] mx-auto p-4 pt-24 flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-transparent rounded-full animate-spin absolute top-0 left-0 border-t-purple-500"></div>
            </div>
            <p className="text-gray-300 font-medium">Loading problem...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-850">
        <Header />
        <div className="max-w-[1400px] mx-auto p-4 pt-24">
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="p-4 bg-red-900/20 rounded-full">
              <AlertCircle className="h-16 w-16 text-red-400" />
            </div>
            <div className="text-red-400 text-center text-xl font-medium">
              {error || 'Problem not found'}
            </div>
            <button 
              onClick={() => navigate(`/contests/${contestId}`)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-white transition-all duration-300 flex items-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Contest
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-850">
      <Header />
      
      <div className="max-w-[1800px] mx-auto p-4 pt-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 p-6 bg-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-md transition-all duration-300 shadow-xl hover:shadow-2xl hover:border-purple-500/30">
          <div className="space-y-2 mb-4 md:mb-0">
            <div className="text-xs text-purple-300/80 flex items-center">
              <Link to="/contests" className="hover:text-purple-200 transition-colors duration-300">Contests</Link>
              <ChevronRight className="h-3 w-3 mx-1" />
              <Link to={`/contests/${contestId}`} className="hover:text-purple-200 transition-colors duration-300">{contest?.title || 'Contest'}</Link>
              <ChevronRight className="h-3 w-3 mx-1" />
              <span className="truncate">{problem.title}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg mr-3 transition-transform duration-300 hover:scale-105">
                <Code className="h-7 w-7" />
              </div>
              {problem.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {status && (
              <span className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-all duration-300 ${status === 'Running' ? 'text-green-300 border border-green-600/30 bg-green-900/20 shadow-lg shadow-green-900/10 hover:shadow-green-900/20' : status === 'Upcoming' ? 'text-yellow-300 border border-yellow-600/30 bg-yellow-900/20 shadow-lg shadow-yellow-900/10 hover:shadow-yellow-900/20' : 'text-gray-300 border border-gray-600/30 bg-gray-900/20'}`}>
                {status === 'Running' && <Zap className="h-4 w-4 mr-2 animate-pulse" />}
                {status === 'Upcoming' && <Clock className="h-4 w-4 mr-2" />}
                {status}
              </span>
            )}
            {timeLeft && (
              <span className="px-4 py-2 rounded-xl text-sm text-purple-200 border border-purple-700/30 bg-purple-900/20 font-medium flex items-center shadow-lg shadow-purple-900/10 hover:shadow-purple-900/20 transition-all duration-300">
                <Clock className="h-4 w-4 mr-2" />
                {timeLeft}
              </span>
            )}
          </div>
        </div>

        {/* Workspace */}
        <div className={`grid gap-6 transition-all duration-500 ${isEditorMaximized ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
          {/* Left: Problem statement */}
          {!isEditorMaximized && (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 backdrop-blur-md shadow-xl hover:shadow-2xl hover:border-purple-500/30">
              <div className="px-6 py-4 border-b border-gray-700/50 text-sm text-gray-300 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-400 transition-transform duration-300 hover:scale-110" />
                  Problem Statement
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Description Section */}
                <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-700/30 transition-all duration-300 hover:border-purple-500/30">
                  <button 
                    onClick={() => toggleSection('description')}
                    className="flex items-center justify-between w-full text-left text-purple-300 font-medium mb-3 group"
                  >
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                      Description
                    </div>
                    {expandedSections.description ? 
                      <ChevronUp className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" /> : 
                      <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                    }
                  </button>
                  {expandedSections.description && (
                    <div className="transition-all duration-300">
                      <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900/30 p-4 rounded-xl border border-gray-700/30">{problem.statement}</pre>
                    </div>
                  )}
                </div>

                {/* Input Format Section */}
                {problem.inputFormat && (
                  <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-700/30 transition-all duration-300 hover:border-purple-500/30">
                    <button 
                      onClick={() => toggleSection('input')}
                      className="flex items-center justify-between w-full text-left text-purple-300 font-medium mb-3 group"
                    >
                      <div className="flex items-center">
                        <Type className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                        Input Format
                      </div>
                      {expandedSections.input ? 
                        <ChevronUp className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" /> : 
                        <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                      }
                    </button>
                    {expandedSections.input && (
                      <div className="transition-all duration-300">
                        <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900/30 p-4 rounded-xl border border-gray-700/30">{problem.inputFormat}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Output Format Section */}
                {problem.outputFormat && (
                  <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-700/30 transition-all duration-300 hover:border-purple-500/30">
                    <button 
                      onClick={() => toggleSection('output')}
                      className="flex items-center justify-between w-full text-left text-purple-300 font-medium mb-3 group"
                    >
                      <div className="flex items-center">
                        <Type className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                        Output Format
                      </div>
                      {expandedSections.output ? 
                        <ChevronUp className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" /> : 
                        <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                      }
                    </button>
                    {expandedSections.output && (
                      <div className="transition-all duration-300">
                        <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900/30 p-4 rounded-xl border border-gray-700/30">{problem.outputFormat}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Samples Section */}
                {Array.isArray(problem.samples) && problem.samples.length > 0 && (
                  <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-700/30 transition-all duration-300 hover:border-purple-500/30">
                    <button 
                      onClick={() => toggleSection('samples')}
                      className="flex items-center justify-between w-full text-left text-purple-300 font-medium mb-3 group"
                    >
                      <div className="flex items-center">
                        <TestTube className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                        Sample {problem.samples.length > 1 ? 'Test Cases' : 'Test Case'} ({problem.samples.length})
                      </div>
                      {expandedSections.samples ? 
                        <ChevronUp className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" /> : 
                        <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                      }
                    </button>
                    {expandedSections.samples && (
                      <div className="transition-all duration-300 space-y-4">
                        {problem.samples.map((s, idx) => (
                          <div key={idx} className="bg-gray-900/30 p-4 rounded-xl border border-gray-700/30 transition-all duration-300 hover:border-purple-500/30">
                            <div className="text-sm text-purple-300 font-medium mb-3 flex items-center">
                              <GitBranch className="h-4 w-4 mr-1" />
                              Sample {idx + 1}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Input</div>
                                <pre className="whitespace-pre-wrap text-gray-300 bg-gray-800/50 p-3 rounded-lg border border-gray-700/30">{s.input}</pre>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Output</div>
                                <pre className="whitespace-pre-wrap text-gray-300 bg-gray-800/50 p-3 rounded-lg border border-gray-700/30">{s.output}</pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right: Editor & Console */}
          <div className={`space-y-6 transition-all duration-500 ${isEditorMaximized ? 'xl:col-span-2' : ''}`}>
            {/* Editor */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl transition-all duration-300 backdrop-blur-md shadow-xl overflow-hidden hover:shadow-2xl hover:border-purple-500/30">
              <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Language</span>
                    <select
                      className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-500/50"
                      value={languageId ?? ''}
                      onChange={(e) => handleLanguageChange(Number(e.target.value))}
                    >
                      {allowedLangs.map((id) => (
                        <option key={id} value={id}>{languageNameFromId(id)}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-300 hover:scale-105" title="Font Size">
                      <Type className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-300 hover:scale-105" title="Theme">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceCode('')}
                    className="px-3 py-1.5 rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-700 transition-all duration-300 hover:scale-105 flex items-center"
                    title="Reset Code"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </button>
                  
                  <button
                    onClick={saveCode}
                    className="px-3 py-1.5 rounded-xl border border-gray-600 text-gray-200 hover:bg-gray-700 transition-all duration-300 hover:scale-105 flex items-center relative overflow-hidden"
                    title="Save Code"
                    disabled={saveStatus === 'saving'}
                  >
                    <div className="flex items-center">
                      {saveStatus === 'saving' ? (
                        <Loader className="h-4 w-4 mr-1 animate-spin" />
                      ) : saveStatus === 'saved' ? (
                        <CheckCircle className="h-4 w-4 mr-1 text-green-400" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                    </div>
                    
                    {saveStatus === 'saved' && (
                      <div className="absolute inset-0 bg-green-500/10 rounded-xl animate-pulse"></div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setIsEditorMaximized(!isEditorMaximized)}
                    className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all duration-300 hover:scale-105"
                    title={isEditorMaximized ? "Minimize Editor" : "Maximize Editor"}
                  >
                    {isEditorMaximized ? <Minus className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </button>
                  
                  <button
                    onClick={onSubmit}
                    disabled={submitting || !sourceCode || status !== 'Running'}
                    className={`px-4 py-2 rounded-xl flex items-center transition-all duration-300 ${submitting || !sourceCode || status !== 'Running' ? 'bg-gray-700 text-gray-400' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5'}`}
                  >
                    {submitting ? (
                      <Loader className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {submitting ? 'Running...' : 'Run Code'}
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-800/70 to-transparent z-10"></div>
                <textarea
                  className="w-full h-96 bg-gray-900/50 text-gray-200 border-0 rounded-b-2xl p-6 font-mono text-sm focus:outline-none focus:ring-0 resize-none transition-all duration-300"
                  placeholder="// Write your solution here..."
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  spellCheck="false"
                  style={{ fontSize: `${fontSize}px`, tabSize: tabSize }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-800/70 to-transparent"></div>
              </div>
              
              <div className="px-6 py-3 bg-gray-900/50 text-xs text-gray-500 flex justify-between">
                <div>Line: 1, Column: 1</div>
                <div>UTF-8</div>
              </div>
            </div>

            {/* Console/Result */}
            <div className={`bg-gray-800/30 border border-gray-700/50 rounded-2xl transition-all duration-500 backdrop-blur-md shadow-xl overflow-hidden hover:shadow-2xl hover:border-purple-500/30 ${isConsoleExpanded ? 'h-auto' : 'h-14'}`}>
              <button 
                onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                className="w-full px-6 py-4 border-b border-gray-700/50 flex items-center justify-between text-left group transition-all duration-300 hover:bg-gray-700/20"
              >
                <div className="flex items-center text-gray-300">
                  <Terminal className="h-5 w-5 mr-2 text-purple-400 transition-transform duration-300 group-hover:scale-110" />
                  Console {result && `(${result.error ? 'Error' : result.verdict})`}
                  {result && !result.error && (
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs transition-all duration-300 ${result.verdict === 'AC' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}`}>
                      {result.passed}/{result.total} passed
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  {result && !result.error && result.execTimeMs != null && (
                    <span className="text-xs text-gray-400 mr-3">{result.execTimeMs}ms</span>
                  )}
                  {isConsoleExpanded ? 
                    <ChevronUp className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" /> : 
                    <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                  }
                </div>
              </button>
              
              {isConsoleExpanded && (
                <div className="p-6 space-y-4 transition-all duration-300">
                  {!result ? (
                    <div className="text-gray-400 text-sm flex flex-col items-center justify-center py-8">
                      <Terminal className="h-12 w-12 mb-3 text-gray-500 animate-pulse" />
                      <p>Run your code to see results here</p>
                      <p className="text-xs mt-2 text-gray-500">Output, errors, and test results will appear here</p>
                    </div>
                  ) : result.error ? (
                    <div className="text-red-300 bg-red-900/20 p-4 rounded-xl border border-red-800/30 flex items-start transition-all duration-300 hover:border-red-600/50">
                      <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Submission Error</div>
                        <div className="text-sm mt-1">{result.error}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-all duration-300 ${result.verdict === 'AC' ? 'text-green-300 bg-green-900/20 border border-green-800/30 hover:border-green-600/50' : 'text-red-300 bg-red-900/20 border border-red-800/30 hover:border-red-600/50'}`}>
                          {result.verdict === 'AC' ? (
                            <CheckCircle className="h-5 w-5 mr-2" />
                          ) : (
                            <XCircle className="h-5 w-5 mr-2" />
                          )}
                          Verdict: {result.verdict}
                        </div>
                        <div className="text-sm text-gray-400">
                          Passed {result.passed}/{result.total} test cases
                        </div>
                        {result.execTimeMs != null && (
                          <div className="text-sm text-gray-400 flex items-center">
                            <Cpu className="h-4 w-4 mr-1" />
                            Time: {result.execTimeMs} ms
                          </div>
                        )}
                      </div>
                      
                      {result.stdout && (
                        <div>
                          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide flex items-center">
                            <span>Standard Output</span>
                            <button className="ml-2 p-1 hover:bg-gray-700/50 rounded transition-all duration-300 hover:scale-110" title="Copy Output">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                          <pre className="whitespace-pre-wrap text-gray-300 bg-gray-900/30 p-4 rounded-xl border border-gray-700/30 max-h-60 overflow-y-auto transition-all duration-300 hover:border-purple-500/30">{result.stdout}</pre>
                        </div>
                      )}
                      
                      {result.stderr && (
                        <div>
                          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide flex items-center">
                            <span>Standard Error</span>
                            <button className="ml-2 p-1 hover:bg-gray-700/50 rounded transition-all duration-300 hover:scale-110" title="Copy Error">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                          <pre className="whitespace-pre-wrap text-red-300 bg-gray-900/30 p-4 rounded-xl border border-gray-700/30 max-h-60 overflow-y-auto transition-all duration-300 hover:border-purple-500/30">{result.stderr}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolveProblem;