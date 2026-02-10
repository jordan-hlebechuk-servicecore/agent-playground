import React from "react";
import type { AgentStreamChunk } from "../types";
import {
  ToolResultChunk as StyledToolResultChunk,
  ResultHeader,
  ResultIcon,
  ResultLabel,
  ResultOutput,
} from "./OutputChunks.styles";

interface ToolResultChunkProps {
  chunk: AgentStreamChunk;
}

export const ToolResultChunk: React.FC<ToolResultChunkProps> = ({ chunk }) => {
  return (
    <StyledToolResultChunk>
      <ResultHeader>
        <ResultIcon>✅</ResultIcon>
        <ResultLabel>Result:</ResultLabel>
      </ResultHeader>
      {chunk.output !== undefined && (
        <ResultOutput>
          {typeof chunk.output === "string"
            ? chunk.output
            : JSON.stringify(chunk.output, null, 2)}
        </ResultOutput>
      )}
    </StyledToolResultChunk>
  );
};
