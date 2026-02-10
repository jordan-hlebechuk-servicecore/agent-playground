import type { Request, Response } from "express";
import { runAgent } from "../../../../../agents/index.js";

interface RunAgentRequest {
  agent: "coding" | "calculator" | "coding_practice_agent" | "bugfix" | "ticket";
  userInput: string;
  projectPath?: string;
  systemContext?: string;
  debug?: boolean;
}

interface AgentStreamChunk {
  type: "text-delta" | "tool-call" | "tool-result" | "finish";
  text?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
}

export const runAgentEndpoint = async (req: Request, res: Response) => {
  try {
    const {
      agent,
      userInput,
      projectPath,
      systemContext,
      debug = false,
    } = req.body as RunAgentRequest;

    if (!agent || !userInput) {
      res.status(400).json({
        error: "Missing required fields: agent and userInput",
      });
      return;
    }

    const validAgents = [
      "coding",
      "calculator",
      "coding_practice_agent",
      "bugfix",
      "ticket",
    ];
    if (!validAgents.includes(agent)) {
      res.status(400).json({
        error: `Invalid agent type. Must be one of: ${validAgents.join(", ")}`,
      });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const chunkHandler = (chunk: AgentStreamChunk) => {
      try {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      } catch (error) {
        console.error("Error writing chunk:", error);
      }
    };

    try {
      await runAgent({
        agent,
        userInput,
        projectPath,
        systemContext,
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
};
