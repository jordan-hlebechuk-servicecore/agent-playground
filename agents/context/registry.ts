import type { AgentName, AgentContextConfig } from "./types";

const BASE_PROMPTS: Record<AgentName, string> = {
  coding:
    "You are a coding agent. You are responsible for coding the project including writing, deleting, moving and refactoring files and code as requested by the user. Make use of available tools to help you with your tasks.",
  calculator:
    "You are a calculator agent. You are responsible for solving equations provided by the user. You need to pick up on the user's intent for the given equation and recognize mathematical operations and symbols, whether written as text or symbols.",
};

const CONTEXT_FILES: Record<AgentName, string[]> = {
  coding: [],
  calculator: [],
};

export function getAgentConfig(agent: AgentName): AgentContextConfig {
  return {
    baseSystemPrompt: BASE_PROMPTS[agent],
    contextFiles: CONTEXT_FILES[agent],
  };
}
