import { ApiError } from "../utils/apierrorhandler.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { Contest } from "../models/contest.model.js";
import { Problem } from "../models/problem.model.js";
import { Submission } from "../models/submission.model.js";
import { runSingleTest } from "../services/judge0.service.js";

function ensureWindow(contest) {
  const now = new Date();
  if (now < new Date(contest.startAt)) throw new ApiError(403, "Contest has not started yet");
  if (now > new Date(contest.endAt)) throw new ApiError(403, "Contest has ended");
}

export const createContest = asyncHandler(async (req, res) => {
  try {
  const { title, description, startAt, endAt, visibility = "public" } = req.body;
  if (!title || !description || !startAt || !endAt) {
    throw new ApiError(400, "title, description, startAt, endAt are required");
  }
  const contest = await Contest.create({
    title,
    description,
    startAt: new Date(startAt),
    endAt: new Date(endAt),
    createdBy: req.user._id,
    visibility
  });
  return res.status(201).json(new ApiResponse(201, contest, "Contest created"));
}

catch (e) {
  throw new ApiError(500, "Internal Server Error", e);
}
}
);


export const listContests = asyncHandler(async (_req, res) => {
  try {
  const contests = await Contest.find({}).select("title description startAt endAt visibility").sort({ startAt: -1 });
  return res.status(200).json(new ApiResponse(200, contests));
  }
  catch (e) {
    throw new ApiError(500, "Internal Server Error", e);
  }
});

export const getContest = asyncHandler(async (req, res) => {
  try{
  const { id } = req.params;
  const contest = await Contest.findById(id).populate({ path: "problems", select: "title allowedLangs timeLimit memoryLimit" });
  if (!contest) throw new ApiError(404, "Contest not found");
  return res.status(200).json(new ApiResponse(200, contest));
  }
  catch (e) {
    throw new ApiError(500, "Internal Server Error", e);
  }
});

export const addProblem = asyncHandler(async (req, res) => {
  try{
  const { contestId } = req.params;
  const contest = await Contest.findById(contestId);
  if (!contest) throw new ApiError(404, "Contest not found");
  const {
    title,
    statement,
    inputFormat,
    outputFormat,
    constraints,
    samples = [],
    testCases = [],
    allowedLangs = [54, 63, 71, 62, 50],
    timeLimit = 2.0,
    memoryLimit = 128000
  } = req.body;
  if (!title || !statement) throw new ApiError(400, "title and statement required");
  const problem = await Problem.create({
    title,
    statement,
    inputFormat,
    outputFormat,
    constraints,
    samples,
    testCases,
    allowedLangs,
    timeLimit,
    memoryLimit
  });
  contest.problems.push(problem._id);
  await contest.save();
  return res.status(201).json(new ApiResponse(201, problem, "Problem added"));
}
catch (e) {
  throw new ApiError(500, "Internal Server Error", e);
}

});

export const getProblem = asyncHandler(async (req, res) => {
  try{
  const { contestId, problemId } = req.params;
  const contest = await Contest.findById(contestId);
  if (!contest) throw new ApiError(404, "Contest not found");
  if (!contest.problems.some((p) => String(p) === String(problemId))) {
    throw new ApiError(404, "Problem not part of this contest");
  }
  const problem = await Problem.findById(problemId).select("title statement inputFormat outputFormat constraints samples allowedLangs timeLimit memoryLimit");
  if (!problem) throw new ApiError(404, "Problem not found");
  return res.status(200).json(new ApiResponse(200, problem));
}
catch(e){
  throw new ApiError(500,"Server Error", e)
}
});

// Execute a custom test run (no persistence)
export const runCustomTest = asyncHandler(async (req, res) => {
  const { contestId, problemId } = req.params;
  const { languageId, sourceCode, stdin = '', expectedOutput } = req.body || {};
  if (!languageId || !sourceCode) throw new ApiError(400, "languageId and sourceCode required");

  const contest = await Contest.findById(contestId);
  if (!contest) throw new ApiError(404, "Contest not found");
  ensureWindow(contest);

  const problem = await Problem.findById(problemId);
  if (!problem) throw new ApiError(404, "Problem not found");
  if (!contest.problems.some((p) => String(p) === String(problemId))) {
    throw new ApiError(404, "Problem not part of this contest");
  }
  if (problem.allowedLangs?.length && !problem.allowedLangs.includes(Number(languageId))) {
    throw new ApiError(400, "Language not allowed for this problem");
  }

  const exec = await runSingleTest({
    sourceCode,
    languageId: Number(languageId),
    stdin,
    expectedOutput,
    cpuTimeLimit: problem.timeLimit,
    memoryLimit: problem.memoryLimit
  });
  const statusId = exec?.status?.id;
  const verdict = mapJudge0Status(statusId);
  const t = parseFloat(exec?.time || "0") * 1000;
  const timeMs = Number.isNaN(t) ? 0 : Math.round(t);
  const stdout = exec?.stdout ? Buffer.from(exec.stdout, "base64").toString("utf-8") : "";
  const stderr = exec?.stderr ? Buffer.from(exec.stderr, "base64").toString("utf-8") : "";

  return res.status(200).json(new ApiResponse(200, {
    verdict,
    timeMs,
    stdout: stdout.slice(0, 10000),
    stderr: stderr.slice(0, 10000),
    statusId
  }));
});

export const listProblems = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const skip = Math.max(0, Number(req.query.skip) || 0);
  const filter = q ? { title: { $regex: q, $options: 'i' } } : {};
  const problems = await Problem.find(filter)
    .select('title allowedLangs timeLimit memoryLimit createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return res.status(200).json(new ApiResponse(200, problems));
});


export const getMyProblemStatus = asyncHandler(async (req, res) => {
  try{
  const { contestId, problemId } = req.params;
  const contest = await Contest.findById(contestId);
  if (!contest) throw new ApiError(404, 'Contest not found');
  if (!contest.problems.some((p) => String(p) === String(problemId))) {
    throw new ApiError(404, 'Problem not part of this contest');
  }
  const acc = await Submission.findOne({
    user: req.user._id,
    contest: contest._id,
    problem: problemId,
    verdict: 'Accepted'
  })
    .sort({ createdAt: 1 })
    .select('createdAt');
  return res.status(200).json(new ApiResponse(200, {
    completed: !!acc,
    acceptedAt: acc?.createdAt || null
  }));
}
catch(e){
  throw new ApiError(500, "Server error",e.message)
}
});

export const attachExistingProblem = asyncHandler(async (req, res) => {
  try {
  const { contestId, problemId } = req.params;
  const contest = await Contest.findById(contestId);
  if (!contest) throw new ApiError(404, 'Contest not found');
  const problem = await Problem.findById(problemId);
  if (!problem) throw new ApiError(404, 'Problem not found');
  const already = contest.problems.some((p) => String(p) === String(problemId));
  if (!already) {
    contest.problems.push(problem._id);
    await contest.save();
  }
  return res.status(200).json(new ApiResponse(200, { attached: true, problemId: problem._id }, already ? 'Problem already attached' : 'Problem attached'));
}
catch(e){
  throw new ApiError(500, "Server error", e.message)
}
});

export const attachExistingProblemsBulk = asyncHandler(async (req, res) => {
  try{
  const { contestId } = req.params;
  const { problemIds } = req.body || {};
  if (!Array.isArray(problemIds) || problemIds.length === 0) {
    throw new ApiError(400, 'problemIds (array) is required');
  }

  const uniqueIds = [...new Set(problemIds.map(String))];
  const contest = await Contest.findById(contestId);
  if (!contest) throw new ApiError(404, 'Contest not found');

  const existingSet = new Set((contest.problems || []).map((p) => String(p)));
  const validProblems = await Problem.find({ _id: { $in: uniqueIds } }).select('_id');
  const validIds = validProblems.map((p) => String(p._id));

  const toAdd = validIds.filter((id) => !existingSet.has(id));
  if (toAdd.length) {
    contest.problems.push(...toAdd);
    await contest.save();
  }

  const alreadyAttached = validIds.filter((id) => existingSet.has(id));
  const invalidIds = uniqueIds.filter((id) => !validIds.includes(id));

  return res.status(200).json(
    new ApiResponse(200, {
      requested: uniqueIds.length,
      valid: validIds.length,
      attachedCount: toAdd.length,
      alreadyAttachedCount: alreadyAttached.length,
      invalidCount: invalidIds.length,
      addedIds: toAdd,
      alreadyAttached,
      invalidIds,
    }, toAdd.length ? 'Problems attached' : 'No new problems attached')
  );
}
catch(e){
  throw new ApiError(500,"Server error", e.message);
}
});

function mapJudge0Status(statusId) {
  switch (statusId) {
    case 3:
      return "Accepted";
    case 4:
      return "Wrong Answer";
    case 5:
      return "Time Limit Exceeded";
    case 6:
      return "Compilation Error";
    case 7: 
      return "Runtime Error(SIGSEGV)";
    case 8: 
      return "Runtime Error(SIGXFSZ)";
    case 9: 
      return "Runtime Error(SIGFPE)";
    case 10: 
      return "Runtime Error(SIGABRT)";
    case 11: 
      return "Runtime Error(NZEC)";
    case 12: 
      return "Runtime Error(Other)";
    case 14: 
      return "Runtime Error(Exec format error)";
    case 13:
      return "Internal Error";
    default:
      return "Internal Error";
  }
}

export const submitSolution = asyncHandler(async (req, res) => {
  try{
  const { contestId, problemId } = req.params;
  const { languageId, sourceCode } = req.body;
  if (!languageId || !sourceCode) throw new ApiError(400, "languageId and sourceCode required");

  const contest = await Contest.findById(contestId);
  if (!contest) throw new ApiError(404, "Contest not found");
  ensureWindow(contest);

  const problem = await Problem.findById(problemId);
  if (!problem) throw new ApiError(404, "Problem not found");
  if (!contest.problems.some((p) => String(p) === String(problemId))) {
    throw new ApiError(404, "Problem not part of this contest");
  }
  if (problem.allowedLangs?.length && !problem.allowedLangs.includes(Number(languageId))) {
    throw new ApiError(400, "Language not allowed for this problem");
  }

  let passed = 0;
  const total = problem.testCases.length;
  let maxTimeMs = 0;
  let finalVerdict = "Accepted";
  let combinedStdout = "";
  let combinedStderr = "";

  for (const tc of problem.testCases) {
    const result = await runSingleTest({
      sourceCode,
      languageId: Number(languageId),
      stdin: tc.input,
      expectedOutput: tc.output,
      cpuTimeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit
    });
    const statusId = result?.status?.id;
    const verdict = mapJudge0Status(statusId);
    if (verdict === "Accepted") {
      passed += 1;
    } else {
      finalVerdict = verdict;
    }
    const t = parseFloat(result?.time || "0") * 1000;
    if (!Number.isNaN(t)) maxTimeMs = Math.max(maxTimeMs, t);
    if (result?.stdout) combinedStdout += Buffer.from(result.stdout, "base64").toString("utf-8") + "\n";
    if (result?.stderr) combinedStderr += Buffer.from(result.stderr, "base64").toString("utf-8") + "\n";
    if (finalVerdict !== "Accepted") {
      break;
    }
  }

  const submission = await Submission.create({
    user: req.user._id,
    contest: contest._id,
    problem: problem._id,
    languageId: Number(languageId),
    sourceCode,
    verdict: finalVerdict,
    passed,
    total,
    execTimeMs: Math.round(maxTimeMs),
    stdout: combinedStdout.slice(0, 10000),
    stderr: combinedStderr.slice(0, 10000)
  });

  return res.status(201).json(new ApiResponse(201, submission, "Submission evaluated"));
}
catch(e){
  throw new ApiError(500,"Server Error", e.message);
}
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  try{
  const { contestId } = req.params;
  const contest = await Contest.findById(contestId)
  if (!contest) throw new ApiError(404, "Contest not found")

  const agg = await Submission.aggregate([
    { $match: { contest: contest._id, verdict: "Accepted" } },
    { $group: { _id: { user: "$user", problem: "$problem" }, firstAC: { $min: "$createdAt" } } },
    { $group: { _id: "$_id.user", solved: { $sum: 1 }, lastAcceptedAt: { $max: "$firstAC" } } },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { _id: 0, userId: "$user._id", fullname: "$user.fullname", avatar: "$user.avatar", solved: 1, lastAcceptedAt: 1 } },
    { $sort: { solved: -1, lastAcceptedAt: 1 } },
    { $limit: 100 }
  ]);

  return res.status(200).json(new ApiResponse(200, agg));
}
catch(e){
throw new ApiError(500,"Server error",e.message)
}
});
