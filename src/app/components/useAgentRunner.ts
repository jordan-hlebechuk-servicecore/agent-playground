import { useState, useCallback } from "react";
import type { AgentStreamChunk, AgentType } from "./types";

interface UseAgentRunnerReturn {
  isLoading: boolean;
  output: AgentStreamChunk[];
  error: string | null;
  runAgent: (agentType: AgentType, userInput: string) => Promise<void>;
  clearOutput: () => void;
}

export const useAgentRunner = (): UseAgentRunnerReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [output, setOutput] = useState<AgentStreamChunk[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearOutput = useCallback(() => {
    setOutput([]);
    setError(null);
  }, []);

  const runAgent = useCallback(
    async (agentType: AgentType, userInput: string) => {
      if (!userInput.trim()) {
        setError("Please enter a prompt");
        return;
      }

      setIsLoading(true);
      clearOutput();

      try {
        const response = await fetch("http://localhost:3001/api/agent/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent: agentType,
            userInput: userInput,
            debug: false,
          }),
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
      } finally {
        setIsLoading(false);
      }
    },
    [clearOutput]
  );

  return {
    isLoading,
    output,
    error,
    runAgent,
    clearOutput,
  };
};
