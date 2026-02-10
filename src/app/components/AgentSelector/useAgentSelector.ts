import { useState, useCallback } from "react";
import type { AgentType } from "../types";

interface UseAgentSelectorReturn {
  selectedAgent: AgentType;
  setSelectedAgent: (agent: AgentType) => void;
}

export const useAgentSelector = (
  initialAgent: AgentType = "coding"
): UseAgentSelectorReturn => {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>(initialAgent);

  const handleSetSelectedAgent = useCallback((agent: AgentType) => {
    setSelectedAgent(agent);
  }, []);

  return {
    selectedAgent,
    setSelectedAgent: handleSetSelectedAgent,
  };
};
