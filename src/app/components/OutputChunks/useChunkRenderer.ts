import { useCallback } from "react";
import type { AgentStreamChunk } from "../types";

export const useChunkRenderer = () => {
  const getChunkType = useCallback((chunk: AgentStreamChunk) => {
    return chunk.type;
  }, []);

  const isTextDelta = useCallback(
    (chunk: AgentStreamChunk) => chunk.type === "text-delta",
    []
  );

  const isToolCall = useCallback(
    (chunk: AgentStreamChunk) => chunk.type === "tool-call",
    []
  );

  const isToolResult = useCallback(
    (chunk: AgentStreamChunk) => chunk.type === "tool-result",
    []
  );

  const isFinish = useCallback(
    (chunk: AgentStreamChunk) => chunk.type === "finish",
    []
  );

  const isError = useCallback(
    (chunk: AgentStreamChunk) => chunk.type === "error",
    []
  );

  return {
    getChunkType,
    isTextDelta,
    isToolCall,
    isToolResult,
    isFinish,
    isError,
  };
};
