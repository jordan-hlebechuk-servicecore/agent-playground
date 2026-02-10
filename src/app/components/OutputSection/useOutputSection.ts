import { useEffect, useRef } from "react";
import type { AgentStreamChunk } from "../types";

interface UseOutputSectionReturn {
  outputEndRef: React.RefObject<HTMLDivElement | null>;
}

export const useOutputSection = (
  output: AgentStreamChunk[]
): UseOutputSectionReturn => {
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  return {
    outputEndRef,
  };
};
