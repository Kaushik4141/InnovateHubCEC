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
      startJobScraper();
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });

let jobScraperProc = null;
function startJobScraper() {
  if (process.env.ENABLE_JOB_SCRAPER === "false") {
    console.log("[JobScraper] Disabled via ENABLE_JOB_SCRAPER=false");
    return;
  }
  if (jobScraperProc) {
    console.log("[JobScraper] Already running.");
    return;
  }
  try {
    const pythonBin = process.env.PYTHON_BIN || "python"; // or set to 'py' on Windows if needed
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
        const delayMs = 5000;
        console.log(`[JobScraper] Restarting in ${delayMs / 1000}s...`);
        setTimeout(startJobScraper, delayMs);
      }
    });

    jobScraperProc.on("error", (err) => {
      console.error("[JobScraper] Failed to start:", err.message);
    });
    const cleanup = () => {
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
  } catch (e) {
    console.error("[JobScraper] Unexpected error:", e);
  }
}
