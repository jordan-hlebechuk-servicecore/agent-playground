export type AgentName = "coding" | "calculator";

export interface AgentContextConfig {
  baseSystemPrompt: string;
  contextFiles: string[];
}

export interface LoadedContext {
  systemPrompt: string;
  loadedFiles: string[];
  errors: string[];
}
