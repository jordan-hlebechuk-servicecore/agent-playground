export interface AgentStreamChunk {
  type: "text-delta" | "tool-call" | "tool-result" | "finish" | "error";
  text?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
  message?: string;
}

export type AgentType = "coding" | "calculator" | "coding_practice_agent";

export const AGENT_OPTIONS: Array<{ value: AgentType; label: string }> = [
  { value: "coding", label: "Coding Agent" },
  { value: "calculator", label: "Calculator Agent" },
  { value: "coding_practice_agent", label: "Coding Practice Agent" },
];
