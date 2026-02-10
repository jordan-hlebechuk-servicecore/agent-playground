import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRouter from "./routes/health/index.js";
import agentRouter from "./routes/agent/index.js";
import jiraRouter from "./routes/jira/index.js";
import reposRouter from "./routes/repos/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.use((req, _res, next) => {
  console.log(`[REQ pid=${process.pid}] ${req.method} ${req.url}`);
  next();
});

app.use("/health", healthRouter);
app.use("/api/agent", agentRouter);
app.use("/api/jira", jiraRouter);
app.use("/api/repos", reposRouter);

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
