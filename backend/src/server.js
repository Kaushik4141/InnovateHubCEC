import "../src/loadENV.js";
import connectDB from "./db/server.js";
import { app } from "./app.js";
import { startStatsUpdater } from "./controllers/github.controller.js";
import http from "http";
import { initSocket } from "./socket.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "./models/user.model.js";

async function seedAdmins() {
  try {
    const defaultEmails = 'kaushik0h0s@gmail.com';
    const emails = (process.env.ADMIN_EMAILS || defaultEmails)
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!emails.length) return;
    const res = await User.updateMany(
      { email: { $in: emails } },
      { $set: { isAdmin: true } }
    );
    const count = res?.modifiedCount ?? res?.nModified ?? 0;
    console.log(`[AdminSeed] Marked ${count} user(s) as admin.`);
  } catch (e) {
    console.warn('[AdminSeed] Failed:', e?.message || e);
  }
}

connectDB()
  .then(async () => {
    await seedAdmins();
    const PORT = process.env.PORT || 8000;
    const server = http.createServer(app);
    initSocket(server);
    server.listen(PORT, () => {
      console.log(` Server is running at port : ${PORT}`);
      startStatsUpdater();
      scheduleJobScraper();
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });

let jobScraperProc = null;
let jobScraperTimer = null;

function runJobScraperOnce() {
  if (process.env.ENABLE_JOB_SCRAPER === "false") {
    console.log("[JobScraper] Disabled via ENABLE_JOB_SCRAPER=false");
    return;
  }
  if (jobScraperProc) {
    console.log("[JobScraper] Previous run still in progress; skipping this tick.");
    return;
  }
  try {
    const pythonBin = process.env.PYTHON_BIN || "python"; 
    const __filenameLocal = fileURLToPath(import.meta.url);
    const __dirnameLocal = path.dirname(__filenameLocal);
    const backendRoot = path.resolve(__dirnameLocal, "..");
    const scriptPath = path.join(
      backendRoot,
      "src",
      "job_scarpper",
      "job_scarpper.py"
    );
    if (!process.env.API_KEY) {
      console.warn(
        "[JobScraper] Skipped: missing API_KEY in environment. Add API_KEY to backend/.env"
      );
      return;
    }

    console.log("[JobScraper] Starting:", pythonBin, scriptPath);
    jobScraperProc = spawn(pythonBin, [scriptPath], {
      cwd: backendRoot,
      env: process.env,
      stdio: "inherit",
    });

    jobScraperProc.on("exit", (code, signal) => {
      console.log(`[JobScraper] Exited with code ${code} signal ${signal}`);
      jobScraperProc = null;
      if (code !== 0) {
        console.log(`[JobScraper] Will try again on next schedule tick.`);
      }
    });

    jobScraperProc.on("error", (err) => {
      console.error("[JobScraper] Failed to start:", err.message);
    });
  } catch (e) {
    console.error("[JobScraper] Unexpected error:", e);
  }
}

function scheduleJobScraper() {
  if (process.env.ENABLE_JOB_SCRAPER === "false") {
    console.log("[JobScraper] Disabled via ENABLE_JOB_SCRAPER=false");
    return;
  }
  const minutes = parseFloat(process.env.JOB_SCRAPER_INTERVAL_MINUTES || "90");
  const intervalMs = Math.max(1, minutes) * 60 * 1000;
  console.log(`[JobScraper] Scheduling every ${minutes} minute(s)`);

  runJobScraperOnce();
  if (jobScraperTimer) clearInterval(jobScraperTimer);
  jobScraperTimer = setInterval(runJobScraperOnce, intervalMs);

  const cleanup = () => {
    if (jobScraperTimer) {
      clearInterval(jobScraperTimer);
      jobScraperTimer = null;
    }
    if (jobScraperProc) {
      console.log("[JobScraper] Shutting down...");
      try {
        jobScraperProc.kill();
      } catch {}
      jobScraperProc = null;
    }
  };
  process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    cleanup();
    process.exit(0);
  });
  process.on("exit", cleanup);
}
