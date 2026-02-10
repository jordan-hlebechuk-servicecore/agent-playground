import React from "react";
import { Box } from "@mui/material";
import type { AgentStreamChunk } from "../../../../types";
import { StyledToolCallChunk } from "./OutputChunks.styles";

interface ToolCallChunkProps {
  chunk: AgentStreamChunk;
}

export const ToolCallChunk: React.FC<ToolCallChunkProps> = ({ chunk }) => {
  return (
    <StyledToolCallChunk>
      <Box className="ToolHeader">
        <Box className="ToolIcon" component="span">🔧</Box>
        <Box className="ToolName" component="span">Calling: {chunk.toolName}</Box>
      </Box>
      {chunk.input !== undefined && (
        <Box className="ToolInput" component="pre">{JSON.stringify(chunk.input, null, 2)}</Box>
      )}
    </StyledToolCallChunk>
  );
};
