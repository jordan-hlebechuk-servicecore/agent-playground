import React from "react";
import type { AgentStreamChunk } from "../types";
import {
  ToolCallChunk as StyledToolCallChunk,
  ToolHeader,
  ToolIcon,
  ToolName,
  ToolInput,
} from "./OutputChunks.styles";

interface ToolCallChunkProps {
  chunk: AgentStreamChunk;
}

export const ToolCallChunk: React.FC<ToolCallChunkProps> = ({ chunk }) => {
  return (
    <StyledToolCallChunk>
      <ToolHeader>
        <ToolIcon>🔧</ToolIcon>
        <ToolName>Calling: {chunk.toolName}</ToolName>
      </ToolHeader>
      {chunk.input !== undefined && (
        <ToolInput>{JSON.stringify(chunk.input, null, 2)}</ToolInput>
      )}
    </StyledToolCallChunk>
  );
};
