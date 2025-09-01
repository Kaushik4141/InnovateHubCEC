import axios from "axios";

const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358"; 
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || null; 

function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (JUDGE0_API_KEY) {
    
    headers["X-Api-Key"] = JUDGE0_API_KEY;
  }
  return headers;
}

function b64(str) {
  return Buffer.from(String(str || "")).toString("base64");
}

export async function runSingleTest({ sourceCode, languageId, stdin, expectedOutput, cpuTimeLimit, memoryLimit }) {
  const payload = {
    source_code: b64(sourceCode),
    language_id: languageId,
    stdin: b64(stdin ?? ""),
    expected_output: expectedOutput !== undefined ? b64(expectedOutput) : undefined,
    cpu_time_limit: cpuTimeLimit,
    memory_limit: memoryLimit,
    base64_encoded: true,
    wait: true 
  };

  const { data } = await axios.post(
    `${JUDGE0_URL}/submissions`,
    payload,
    { headers: buildHeaders() }
  );
  return data; 
}

export async function getSubmission(token) {
  const { data } = await axios.get(
    `${JUDGE0_URL}/submissions/${encodeURIComponent(token)}`,
    { headers: buildHeaders(), params: { base64_encoded: true } }
  );
  return data;
}
