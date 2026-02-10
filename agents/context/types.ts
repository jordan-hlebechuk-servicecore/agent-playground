export type AgentName = "coding" | "calculator" | "coding_practice_agent" | "bugfix" | "ticket";

export interface AgentContextConfig {
  baseSystemPrompt: string;
  contextFiles: string[];
}

export interface TicketInfo {
  key: string;
  summary: string;
  status: string;
  priority: string;
  type: string;
  description: string;
  url: string;
}

export interface BuildContextInput {
  agent: AgentName;
  repoSlugs?: string[];
  ticketKey?: string;
  projectPath?: string;
}

export interface LoadedContext {
  systemPrompt: string;
  loadedFiles: string[];
  errors: string[];
}
