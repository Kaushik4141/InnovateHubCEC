import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import { 
  Play, 
  RotateCcw, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  Users,
  Tag,
  Heart,
  Share2,
  MoreVertical,
  Settings,
  Upload,
  Maximize,
  Minimize,
  PanelLeft,
  PanelRight,
  X
} from "lucide-react";

const SolveProblem = () => {
  const { contestId, problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [contest, setContest] = useState(null);
  const [sourceCode, setSourceCode] = useState('// Write your solution here\n');
  const [loading, setLoading] = useState(true);
  const [languageId, setLanguageId] = useState(63); // Default to JavaScript
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState(null);
  const [leftActiveTab, setLeftActiveTab] = useState('description');
  const [testCaseInput, setTestCaseInput] = useState('');
  const [testCaseOutput, setTestCaseOutput] = useState('');
  const [customTestCaseResult, setCustomTestCaseResult] = useState(null);
  const [runningCustomTest, setRunningCustomTest] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('test');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showProblemPanel, setShowProblemPanel] = useState(true);
  const [showTestPanel, setShowTestPanel] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window size for responsiveness
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-hide panels on smaller screens
  useEffect(() => {
    if (windowWidth < 1024) {
      setShowProblemPanel(false);
      setShowTestPanel(false);
    } else {
      setShowProblemPanel(true);
      setShowTestPanel(true);
    }
  }, [windowWidth]);

  // Monaco editor language mapping
  const getMonacoLanguage = (langId) => {
    const langMap = {
      50: 'c',           // C
      54: 'cpp',         // C++
      62: 'java',        // Java
      63: 'javascript',  // JavaScript
      71: 'python',      // Python
      78: 'kotlin',      // Kotlin
      68: 'php',         // PHP
      74: 'typescript',  // TypeScript
      51: 'csharp',      // C#
      60: 'go',          // Go
      64: 'swift',       // Swift
      72: 'ruby',        // Ruby
      73: 'rust',        // Rust
    };
    return langMap[langId] || 'javascript';
  };

  // Mock data for demonstration
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProblem({
          title: "Sample Problem",
          difficulty: "medium",
          tags: ["array", "sorting"],
          statement: "Given an array of integers, return the sorted array in ascending order.",
          inputFormat: "First line contains an integer n.\nSecond line contains n space-separated integers.",
          outputFormat: "Single line with n space-separated integers.",
          constraints: "1 <= n <= 1000\n-1000 <= arr[i] <= 1000",
          samples: [
            {
              input: "5\n3 1 4 2 5",
              output: "1 2 3 4 5",
              explanation: "The array is sorted in ascending order."
            }
          ],
          allowedLangs: [63, 71, 62] // JS, Python, Java
        });
        
        setContest({
          title: "Sample Contest",
          startAt: new Date(Date.now() - 3600000).toISOString(),
          endAt: new Date(Date.now() + 3600000).toISOString()
        });
        
        // Set sample test case
        setTestCaseInput("5\n3 1 4 2 5");
        setTestCaseOutput("1 2 3 4 5");
      } catch (e) {
        console.error("Failed to load data:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [contestId, problemId]);

  // Timer effect
  useEffect(() => {
    if (!contest) return;
    
    const update = () => {
      const now = Date.now();
      const start = new Date(contest.startAt).getTime();
      const end = new Date(contest.endAt).getTime();
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
  }, [contest]);

  const onSubmit = async () => {
    if (!contestId || !problemId || !languageId) return;
    setSubmitting(true);
    setResult(null);
    setRightPanelTab('result');
    setShowTestPanel(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResult({
        verdict: 'AC',
        passed: 5,
        total: 5,
        execTimeMs: 120
      });
    } catch (e) {
      setResult({ error: 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const onRunCustomTestCase = async () => {
    if (!contestId || !problemId || !languageId) return;
    setRunningCustomTest(true);
    setCustomTestCaseResult(null);
    setRightPanelTab('result');
    setShowTestPanel(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate result
      const simulatedOutput = "1 2 3 4 5";
      const isCorrect = simulatedOutput.trim() === testCaseOutput.trim();
      
      setCustomTestCaseResult({
        passed: isCorrect,
        input: testCaseInput,
        expected: testCaseOutput,
        actual: simulatedOutput,
        error: isCorrect ? null : "Output doesn't match expected result"
      });
    } catch (e) {
      setCustomTestCaseResult({ error: 'Test execution failed' });
    } finally {
      setRunningCustomTest(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-300 bg-green-900/30';
      case 'medium': return 'text-yellow-300 bg-yellow-900/30';
      case 'hard': return 'text-red-300 bg-red-900/30';
      default: return 'text-gray-300 bg-gray-900/30';
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      // Hide all panels except editor when entering full screen
      setShowProblemPanel(false);
      setShowTestPanel(false);
    } else {
      // Restore panels when exiting full screen
      if (windowWidth >= 1024) {
        setShowProblemPanel(true);
        setShowTestPanel(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-red-400">Problem not found</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white ${isFullScreen ? 'fixed inset-0 z-50' : 'p-2 md:p-4 relative overflow-hidden'}`}>
      {/* Animated background lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
            style={{
              animation: `moveLine ${3 + i}s linear infinite`,
              top: `${20 + i * 15}%`,
              opacity: 0.3 + i * 0.1,
            }}
          />
        ))}
      </div>

      <div className={`${isFullScreen ? 'h-screen' : 'max-w-[1400px] mx-auto'} relative z-10 h-full`}>
        {/* Header - Hidden in full screen mode */}
        {!isFullScreen && (
          <div className="flex items-center justify-between mb-2 md:mb-4 p-3 md:p-4 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg transition-all duration-300 hover:shadow-purple-900/10">
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-purple-300 hover:text-purple-200 transition-colors duration-200 p-2 rounded-lg hover:bg-purple-900/30"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm font-medium hidden sm:block">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-600 hidden sm:block"></div>
              <div className="space-y-1 max-w-[160px] sm:max-w-none truncate">
                <div className="text-xs text-purple-300 flex items-center gap-1 truncate">
                  <Link to={`/contests`} className="hover:text-purple-200 transition-colors truncate">Contests</Link>
                  <span className="mx-1">/</span>
                  <Link to={`/contests/${contestId}`} className="hover:text-purple-200 transition-colors truncate">{contest?.title || 'Contest'}</Link>
                </div>
                <h1 className="text-lg md:text-xl lg:text-2xl font-semibold text-white bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent truncate">
                  {problem.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {status && (
                <span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${status === 'Running' ? 'text-green-300 border border-green-500/50 bg-green-900/20 shadow-sm shadow-green-500/20' : status === 'Upcoming' ? 'text-yellow-300 border border-yellow-500/50 bg-yellow-900/20 shadow-sm shadow-yellow-500/20' : 'text-gray-300 border border-gray-500/50 bg-gray-900/20'}`}>
                  {status}
                </span>
              )}
              {timeLeft && (
                <span className="px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs text-purple-200 border border-purple-500/50 bg-purple-900/20 shadow-sm shadow-purple-500/20 transition-all duration-500 hover:scale-105">
                  {timeLeft}
                </span>
              )}
              <div className="flex items-center gap-1 md:gap-2">
                <button className="p-1 md:p-2 text-purple-300 hover:text-purple-200 transition-colors">
                  <Heart className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button className="p-1 md:p-2 text-purple-300 hover:text-purple-200 transition-colors">
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button className="p-1 md:p-2 text-purple-300 hover:text-purple-200 transition-colors">
                  <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`flex flex-col lg:flex-row ${isFullScreen ? 'h-screen' : 'h-[calc(100vh-120px)]'}`}>
          {/* Toggle buttons for mobile - Hidden in full screen mode */}
          {!isFullScreen && (
            <div className="flex lg:hidden mb-2 gap-2">
              <button
                onClick={() => setShowProblemPanel(!showProblemPanel)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showProblemPanel 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <PanelLeft className="w-4 h-4" />
                Problem
              </button>
              <button
                onClick={() => setShowTestPanel(!showTestPanel)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showTestPanel 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <PanelRight className="w-4 h-4" />
                Test
              </button>
            </div>
          )}

          <div className="flex flex-1 overflow-hidden gap-2 md:gap-4 lg:gap-6">
            {/* Left Panel - Problem Description */}
            {(showProblemPanel || windowWidth >= 1024) && !isFullScreen && (
              <div className="w-full lg:w-1/2 xl:w-2/5 bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-purple-900/10 flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                  {[
                    { id: 'description', label: 'Description' },
                    { id: 'submissions', label: 'Submissions' },
                    { id: 'solutions', label: 'Solutions' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setLeftActiveTab(tab.id)}
                      className={`px-4 py-2 md:px-6 md:py-3 text-sm font-medium border-b-2 transition-colors flex-1 ${
                        leftActiveTab === tab.id
                          ? 'text-purple-300 border-purple-500'
                          : 'text-gray-300 border-transparent hover:text-purple-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {leftActiveTab === 'description' && (
                    <div className="p-4 md:p-6">
                      {/* Problem metadata */}
                      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 flex-wrap">
                        <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1) || 'Unknown'}
                        </span>
                        {problem.tags && problem.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded transition-all duration-300 hover:scale-105">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Problem statement */}
                      <div className="mb-4 md:mb-6">
                        <div className="bg-gray-900/50 p-3 md:p-4 rounded-xl border border-gray-700 transition-all duration-300 hover:border-purple-500/30">
                          <pre className="whitespace-pre-wrap text-gray-300 text-sm md:text-base">{problem.statement}</pre>
                        </div>
                      </div>

                      {problem.inputFormat && (
                        <div className="mb-4 md:mb-6 transition-all duration-300 hover:scale-[1.01]">
                          <div className="text-purple-300 font-medium mb-2 text-sm md:text-base">Input Format</div>
                          <div className="bg-gray-900/50 p-3 md:p-4 rounded-xl border border-gray-700">
                            <pre className="whitespace-pre-wrap text-gray-300 text-sm md:text-base">{problem.inputFormat}</pre>
                          </div>
                        </div>
                      )}

                      {problem.outputFormat && (
                        <div className="mb-4 md:mb-6 transition-all duration-300 hover:scale-[1.01]">
                          <div className="text-purple-300 font-medium mb-2 text-sm md:text-base">Output Format</div>
                          <div className="bg-gray-900/50 p-3 md:p-4 rounded-xl border border-gray-700">
                            <pre className="whitespace-pre-wrap text-gray-300 text-sm md:text-base">{problem.outputFormat}</pre>
                          </div>
                        </div>
                      )}

                      {/* Examples */}
                      {Array.isArray(problem.samples) && problem.samples.length > 0 && (
                        <div className="mb-4 md:mb-6">
                          <div className="text-purple-300 font-medium mb-2 text-sm md:text-base">Examples</div>
                          {problem.samples.map((s, idx) => (
                            <div key={idx} className="mb-3 md:mb-4 transition-all duration-300 hover:scale-[1.01]">
                              <div className="text-sm text-gray-400 mb-1">Example {idx + 1}:</div>
                              <div className="grid grid-cols-1 gap-2 md:gap-3">
                                <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                                  <div className="text-xs text-gray-400">Input</div>
                                  <pre className="whitespace-pre-wrap text-gray-300 mt-1 text-sm">{s.input}</pre>
                                </div>
                                <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                                  <div className="text-xs text-gray-400">Output</div>
                                  <pre className="whitespace-pre-wrap text-gray-300 mt-1 text-sm">{s.output}</pre>
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

                      {/* Constraints */}
                      {problem.constraints && (
                        <div className="transition-all duration-300 hover:scale-[1.01]">
                          <div className="text-purple-300 font-medium mb-2 text-sm md:text-base">Constraints</div>
                          <div className="bg-gray-900/50 p-3 md:p-4 rounded-xl border border-gray-700">
                            <pre className="whitespace-pre-wrap text-gray-300 text-sm md:text-base">{problem.constraints}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {leftActiveTab === 'submissions' && (
                    <div className="p-4 md:p-6">
                      <div className="text-center py-8 md:py-12">
                        <div className="text-gray-400 mb-2">
                          <Clock className="w-6 h-6 md:w-8 md:h-8 mx-auto" />
                        </div>
                        <p className="text-gray-300 text-sm md:text-base">Your submissions will appear here</p>
                      </div>
                    </div>
                  )}

                  {leftActiveTab === 'solutions' && (
                    <div className="p-4 md:p-6">
                      <div className="text-center py-8 md:py-12">
                        <div className="text-gray-400 mb-2">
                          <Clock className="w-6 h-6 md:w-8 md:h-8 mx-auto" />
                        </div>
                        <p className="text-gray-300 text-sm md:text-base">Solutions will be available after the contest ends</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right Panel - Code Editor */}
            <div className={`flex flex-col ${isFullScreen || !showProblemPanel ? 'w-full' : 'w-full lg:w-1/2 xl:w-3/5'}`}>
              {/* Editor Header */}
              <div className="flex items-center justify-between px-3 py-2 md:px-4 md:py-3 border border-gray-700 bg-gray-800/40 backdrop-blur-sm rounded-t-xl">
                <div className="flex items-center gap-2 md:gap-3">
                  <select
                    value={languageId}
                    onChange={(e) => setLanguageId(Number(e.target.value))}
                    className="bg-gray-900 border border-gray-600 rounded-lg px-2 py-1 md:px-3 md:py-1.5 text-gray-200 transition-all duration-300 hover:border-purple-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-sm md:text-base"
                  >
                    <option value={63}>JavaScript</option>
                    <option value={71}>Python</option>
                    <option value={62}>Java</option>
                    <option value={54}>C++</option>
                    <option value={50}>C</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-1 md:gap-2">
                  {isFullScreen && (
                    <button 
                      onClick={() => setIsFullScreen(false)}
                      className="p-1 md:p-2 text-gray-400 hover:text-purple-300 transition-colors"
                      title="Exit full screen"
                    >
                      <X className="w-4 h-4 md:w-4 md:h-4" />
                    </button>
                  )}
                  <button 
                    onClick={toggleFullScreen}
                    className="p-1 md:p-2 text-gray-400 hover:text-purple-300 transition-colors"
                    title={isFullScreen ? "Exit full screen" : "Enter full screen"}
                  >
                    {isFullScreen ? <Minimize className="w-4 h-4 md:w-4 md:h-4" /> : <Maximize className="w-4 h-4 md:w-4 md:h-4" />}
                  </button>
                  <button className="p-1 md:p-2 text-gray-400 hover:text-purple-300 transition-colors">
                    <Settings className="w-4 h-4 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 border border-gray-700 border-t-0">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={getMonacoLanguage(languageId)}
                  value={sourceCode}
                  onChange={(value) => setSourceCode(value || "")}
                  options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    lineNumbers: "on",
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: "on",
                    tabSize: 2,
                    insertSpaces: true,
                    renderLineHighlight: "gutter",
                    scrollbar: {
                      vertical: "auto",
                      horizontal: "auto"
                    }
                  }}
                />
              </div>

              {/* Bottom Panel - Test Cases & Results */}
              {(showTestPanel || windowWidth >= 1024 || isFullScreen) && (
                <div className="border border-gray-700 border-t-0 bg-gray-800/40 backdrop-blur-sm rounded-b-xl mt-2 md:mt-0">
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between px-3 py-2 md:px-4 md:py-3 border-b border-gray-700">
                    <div className="flex gap-1 md:gap-2">
                      <button
                        onClick={onRunCustomTestCase}
                        disabled={runningCustomTest || !sourceCode}
                        className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 hover:border-purple-500"
                      >
                        <Play className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:block">{runningCustomTest ? 'Running...' : 'Run'}</span>
                      </button>
                      <button
                        onClick={onSubmit}
                        disabled={submitting || !sourceCode}
                        className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 shadow-lg shadow-purple-500/20"
                      >
                        <Upload className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:block">{submitting ? 'Submitting...' : 'Submit'}</span>
                      </button>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSourceCode('// Write your solution here\n');
                        setTestCaseInput(problem.samples && problem.samples.length > 0 ? problem.samples[0].input : '');
                        setTestCaseOutput(problem.samples && problem.samples.length > 0 ? problem.samples[0].output : '');
                      }}
                      className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-2 text-sm text-gray-400 hover:text-purple-300 transition-colors duration-300"
                    >
                      <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:block">Reset</span>
                    </button>
                  </div>

                  {/* Test Cases */}
                  <div className="h-48 md:h-64 flex flex-col">
                    {/* Test Case Tabs */}
                    <div className="flex border-b border-gray-700 bg-gray-800/60">
                      <div className="flex gap-1 px-3 py-1 md:px-4 md:py-2">
                        <button
                          onClick={() => setRightPanelTab('test')}
                          className={`px-2 py-1 md:px-3 md:py-1 text-xs font-medium rounded transition-colors duration-300 ${
                            rightPanelTab === 'test'
                              ? 'bg-purple-600 text-white'
                              : 'text-gray-400 hover:text-purple-300 hover:bg-gray-700/30'
                          }`}
                        >
                          Test Cases
                        </button>
                        <button
                          onClick={() => setRightPanelTab('result')}
                          className={`px-2 py-1 md:px-3 md:py-1 text-xs font-medium rounded transition-colors duration-300 ${
                            rightPanelTab === 'result'
                              ? 'bg-purple-600 text-white'
                              : 'text-gray-400 hover:text-purple-300 hover:bg-gray-700/30'
                          }`}
                        >
                          Results
                        </button>
                      </div>
                    </div>

                    {/* Test Case Content */}
                    <div className="flex-1 overflow-auto p-3 md:p-4 custom-scrollbar">
                      {rightPanelTab === 'test' ? (
                        <div className="space-y-2 md:space-y-3">
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Input</label>
                            <textarea
                              className="w-full h-16 md:h-20 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg p-2 md:p-3 font-mono text-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 custom-scrollbar"
                              value={testCaseInput}
                              onChange={(e) => setTestCaseInput(e.target.value)}
                              placeholder="Enter test case input"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 block mb-1">Expected Output</label>
                            <textarea
                              className="w-full h-16 md:h-20 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg p-2 md:p-3 font-mono text-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 custom-scrollbar"
                              value={testCaseOutput}
                              onChange={(e) => setTestCaseOutput(e.target.value)}
                              placeholder="Enter expected output"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          {runningCustomTest ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-400">Running test cases...</p>
                              </div>
                            </div>
                          ) : customTestCaseResult ? (
                            customTestCaseResult.error ? (
                              <div className="text-red-400 p-2 md:p-3 bg-red-900/20 rounded-lg border border-red-800/50 text-sm">{customTestCaseResult.error}</div>
                            ) : (
                              <div className="space-y-2 md:space-y-3">
                                <div className={`p-2 md:p-3 rounded-lg border text-sm ${customTestCaseResult.passed ? 'text-green-400 bg-green-900/20 border-green-800/50' : 'text-red-400 bg-red-900/20 border-red-800/50'}`}>
                                  {customTestCaseResult.passed ? 'Test Passed' : 'Test Failed'}
                                </div>
                                {customTestCaseResult.input && (
                                  <div className="mt-2 md:mt-3">
                                    <div className="text-xs text-gray-400">Input</div>
                                    <div className="bg-gray-900/50 p-2 md:p-3 rounded-lg border border-gray-700 mt-1">
                                      <pre className="whitespace-pre-wrap text-gray-300 text-xs md:text-sm">{customTestCaseResult.input}</pre>
                                    </div>
                                  </div>
                                )}
                                {customTestCaseResult.expected && (
                                  <div className="mt-2 md:mt-3">
                                    <div className="text-xs text-gray-400">Expected</div>
                                    <div className="bg-gray-900/50 p-2 md:p-3 rounded-lg border border-gray-700 mt-1">
                                      <pre className="whitespace-pre-wrap text-gray-300 text-xs md:text-sm">{customTestCaseResult.expected}</pre>
                                    </div>
                                  </div>
                                )}
                                {customTestCaseResult.actual && (
                                  <div className="mt-2 md:mt-3">
                                    <div className="text-xs text-gray-400">Actual</div>
                                    <div className="bg-gray-900/50 p-2 md:p-3 rounded-lg border border-gray-700 mt-1">
                                      <pre className="whitespace-pre-wrap text-gray-300 text-xs md:text-sm">{customTestCaseResult.actual}</pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          ) : result?.error ? (
                            <div className="text-red-400 p-2 md:p-3 bg-red-900/20 rounded-lg border border-red-800/50 text-sm">{result.error}</div>
                          ) : result ? (
                            <div className="space-y-2 md:space-y-3">
                              <div className="text-gray-200 p-2 md:p-3 bg-gray-900/50 rounded-lg border border-gray-700 text-sm">
                                Verdict: <span className={result.verdict === 'AC' ? 'text-green-400' : 'text-red-400'}>{result.verdict}</span>
                              </div>
                              <div className="text-xs md:text-sm text-gray-400">
                                Passed {result.passed}/{result.total}
                              </div>
                              {result.execTimeMs != null && (
                                <div className="text-xs md:text-sm text-gray-400">Time: {result.execTimeMs} ms</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-400 p-3 text-center text-sm">
                              Run a test case or submit your solution to see results
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations and scrollbar */}
      <style>{`
        @keyframes moveLine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
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