export interface AgentStreamChunk {
  type: "text-delta" | "tool-call" | "tool-result" | "finish" | "error";
  text?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
  message?: string;
}

export type AgentType = "coding" | "calculator" | "coding_practice_agent" | "bugfix";

export const AGENT_OPTIONS: Array<{ value: AgentType; label: string }> = [
  { value: "coding", label: "Coding Agent" },
  { value: "calculator", label: "Calculator Agent" },
  { value: "coding_practice_agent", label: "Coding Practice Agent" },
  { value: "bugfix", label: "Bugfix Agent" },
];

export interface JiraTicket {
  key: string;
  summary: string;
  description: unknown;
  status: string;
  type: string;
  priority: string;
  assignee: string;
  created: string;
  updated: string;
  url: string;
}

export interface RepoOption {
  slug: string;
  name: string;
  cloneUrl: string;
}
