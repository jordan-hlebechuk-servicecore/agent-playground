import { useState, useCallback, useRef } from "react";
import type { AgentStreamChunk, AgentType } from "../../types";

interface UseAgentRunnerReturn {
  isLoading: boolean;
  output: AgentStreamChunk[];
  error: string | null;
  runAgent: (agentType: AgentType, userInput: string, opts?: { ticketKey?: string; repoSlugs?: string[] }) => Promise<void>;
  stopAgent: () => void;
  clearOutput: () => void;
}

export const useAgentRunner = (): UseAgentRunnerReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [output, setOutput] = useState<AgentStreamChunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearOutput = useCallback(() => {
    setOutput([]);
    setError(null);
  }, []);

  const stopAgent = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  const runAgent = useCallback(
    async (agentType: AgentType, userInput: string, opts?: { ticketKey?: string; repoSlugs?: string[] }) => {
      if (!userInput.trim()) {
        setError("Please enter a prompt");
        return;
      }

      setIsLoading(true);
      clearOutput();

      // Create a new AbortController for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("http://localhost:3001/api/agent/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent: agentType,
            userInput: userInput,
            ticketKey: opts?.ticketKey,
            repoSlugs: opts?.repoSlugs,
            debug: false,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const chunk = JSON.parse(line.slice(6)) as AgentStreamChunk;
                setOutput((prev) => [...prev, chunk]);
              } catch (e) {
                console.error("Failed to parse chunk:", e);
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.startsWith("data: ")) {
          try {
            const chunk = JSON.parse(buffer.slice(6)) as AgentStreamChunk;
            setOutput((prev) => [...prev, chunk]);
          } catch (e) {
            console.error("Failed to parse chunk:", e);
          }
        }
      } catch (err) {
        // Don't treat AbortError as a regular error
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Agent run was stopped by user");
          setOutput((prev) => [
            ...prev,
            {
              type: "error",
              message: "Agent run was stopped by user",
            },
          ]);
        } else {
          const errorMessage = err instanceof Error ? err.message : "Unknown error";
          console.error("Error calling agent:", err);
          setError(errorMessage);
          setOutput((prev) => [
            ...prev,
            {
              type: "error",
              message: `Error: ${errorMessage}`,
            },
          ]);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [clearOutput]
  );

  return {
    isLoading,
    output,
    error,
    runAgent,
    stopAgent,
    clearOutput,
  };
};
