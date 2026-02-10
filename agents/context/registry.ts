import type { AgentName, AgentContextConfig } from "./types";

const BASE_PROMPTS: Record<AgentName, string> = {
  coding:
    "You are a coding agent. You are responsible for coding the project including writing, deleting, moving and refactoring files and code as requested by the user. Make use of available tools to help you with your tasks. Do NOT generate markdown files unless specifically requested by the user.",
  calculator:
    "You are a calculator agent. You are responsible for solving equations provided by the user. You need to pick up on the user's intent for the given equation and recognize mathematical operations and symbols, whether written as text or symbols.",
  coding_practice_agent:
    "You are a coding agent. You are responsible for coding the project including writing, deleting, moving and refactoring files and code as requested by the user specifically for this code base. Make use of available tools to help you with your tasks. Whenever you make changes, make sure to update the AGENT_PRACTICE_OVERVIEW.md file in agents/context_files.",
};

const CONTEXT_FILES: Record<AgentName, string[]> = {
  coding: ["COMPONENT_GUIDELINES.md"],
  calculator: [],
  coding_practice_agent: [
    "AGENT_PRACTICE_OVERVIEW.md",
    "COMPONENT_GUIDELINES.md",
  ],
};

export function getAgentConfig(agent: AgentName): AgentContextConfig {
  return {
    baseSystemPrompt: BASE_PROMPTS[agent],
    contextFiles: CONTEXT_FILES[agent],
  };
}
