export type AgentName = "coding" | "calculator" | "coding_practice_agent" | "bugfix" | "ticket";

export interface AgentContextConfig {
  baseSystemPrompt: string;
  contextFiles: string[];
}

export interface LoadedContext {
  systemPrompt: string;
  loadedFiles: string[];
  errors: string[];
}
