import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runAgent } from "../../agents/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

interface RunAgentRequest {
  agent: "coding" | "calculator";
  userInput: string;
  debug?: boolean;
}

interface AgentStreamChunk {
  type: "text-delta" | "tool-call" | "tool-result" | "finish";
  text?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
}

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Run agent endpoint
app.post("/api/agent/run", async (req: Request, res: Response) => {
  try {
    const { agent, userInput, debug = false } = req.body as RunAgentRequest;

    // Validate input
    if (!agent || !userInput) {
      res.status(400).json({
        error: "Missing required fields: agent and userInput",
      });
      return;
    }

    if (agent !== "coding" && agent !== "calculator") {
      res.status(400).json({
        error: `Invalid agent type. Must be 'coding' or 'calculator'`,
      });
      return;
    }

    // Set up Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Define chunk handler
    const chunkHandler = (chunk: AgentStreamChunk) => {
      try {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      } catch (error) {
        console.error("Error writing chunk:", error);
      }
    };

    // Run the agent with the chunk handler
    try {
      await runAgent({
        agent,
        userInput,
        debug,
        onChunk: chunkHandler,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.write(
        `data: ${JSON.stringify({ type: "error", message: errorMessage })}\n\n`
      );
    } finally {
      res.end();
    }
  } catch (error) {
    console.error("Error in /api/agent/run:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
