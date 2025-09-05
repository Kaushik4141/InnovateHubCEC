import api from "./api";

export type Contest = {
  _id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  problems?: Array<{ _id: string; title: string; allowedLangs?: number[] }>;
};

export type Problem = {
  _id: string;
  title: string;
  statement: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  samples?: Array<{ input: string; output: string; explanation?: string }>;
  allowedLangs?: number[];
  timeLimit?: number;
  memoryLimit?: number;
  difficulty?:string;
  tags?:string;
};

export type ProblemSummary = Pick<Problem, '_id' | 'title' | 'allowedLangs' | 'timeLimit' | 'memoryLimit'> & {
  createdAt?: string;
};

export type Submission = {
  _id: string;
  verdict: string;
  passed: number;
  total: number;
  execTimeMs?: number;
  stdout?: string;
  stderr?: string;
};

export type LeaderboardRow = {
  userId: string;
  fullname: string;
  avatar?: string;
  solved: number;
  lastAcceptedAt: string;
};

export async function listContests() {
  const { data } = await api.get(`/api/v1/contests`);
  return (data?.data || []) as Contest[];
}

export async function getContest(id: string) {
  const { data } = await api.get(`/api/v1/contests/${id}`);
  return data?.data as Contest;
}

export async function getProblem(contestId: string, problemId: string) {
  const { data } = await api.get(`/api/v1/contests/${contestId}/problems/${problemId}`);
  return data?.data as Problem;
}

export async function submitSolution(contestId: string, problemId: string, body: { languageId: number; sourceCode: string }) {
  const { data } = await api.post(`/api/v1/contests/${contestId}/problems/${problemId}/submit`, body);
  return data?.data as Submission;
}

export async function getLeaderboard(contestId: string) {
  const { data } = await api.get(`/api/v1/contests/${contestId}/leaderboard`);
  return (data?.data || []) as LeaderboardRow[];
}

export async function createContest(body: { title: string; description: string; startAt: string; endAt: string; visibility?: string }) {
  const { data } = await api.post(`/api/v1/contests`, body);
  return data?.data as Contest;
}

export async function addProblem(contestId: string, body: Partial<Problem> & { title: string; statement: string }) {
  const { data } = await api.post(`/api/v1/contests/${contestId}/problems`, body);
  return data?.data as Problem;
}

export async function listProblemsBank(q?: string, limit = 20, skip = 0) {
  const { data } = await api.get(`/api/v1/contests/problems`, { params: { q, limit, skip } });
  return (data?.data || []) as ProblemSummary[];
}

export async function attachProblem(contestId: string, problemId: string) {
  const { data } = await api.post(`/api/v1/contests/${contestId}/problems/${problemId}/attach`, {});
  return data?.data as { attached: boolean; problemId: string };
}

export async function attachProblemsBulk(contestId: string, problemIds: string[]) {
  const { data } = await api.post(`/api/v1/contests/${contestId}/problems/attach-bulk`, { problemIds });
  return data?.data as {
    requested: number;
    valid: number;
    attachedCount: number;
    alreadyAttachedCount: number;
    invalidCount: number;
    addedIds: string[];
    alreadyAttached: string[];
    invalidIds: string[];
  };
}

export async function runCustomTest(
  contestId: string,
  problemId: string,
  body: { languageId: number; sourceCode: string; stdin?: string; expectedOutput?: string }
) {
  const { data } = await api.post(`/api/v1/contests/${contestId}/problems/${problemId}/run`, body);
  return data?.data as {
    verdict: string;
    timeMs: number;
    stdout: string;
    stderr: string;
    statusId: number;
  };
}

export async function getMyProblemStatus(contestId: string, problemId: string) {
  const { data } = await api.get(`/api/v1/contests/${contestId}/problems/${problemId}/my-status`);
  return data?.data as { completed: boolean; acceptedAt: string | null };
}
