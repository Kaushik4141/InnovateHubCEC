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
  samples?: Array<{ input: string; output: string }>;
  allowedLangs?: number[];
  timeLimit?: number;
  memoryLimit?: number;
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
