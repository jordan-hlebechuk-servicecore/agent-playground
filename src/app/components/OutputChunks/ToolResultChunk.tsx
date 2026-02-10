import React from "react";
import { Box } from "@mui/material";
import type { AgentStreamChunk } from "../types";
import { StyledToolResultChunk } from "./OutputChunks.styles";

interface ToolResultChunkProps {
  chunk: AgentStreamChunk;
}

export const ToolResultChunk: React.FC<ToolResultChunkProps> = ({ chunk }) => {
  return (
    <StyledToolResultChunk>
      <Box className="ResultHeader">
        <Box className="ResultIcon" component="span">✅</Box>
        <Box className="ResultLabel" component="span">Result:</Box>
      </Box>
      {chunk.output !== undefined && (
        <Box className="ResultOutput" component="pre">
          {typeof chunk.output === "string"
            ? chunk.output
            : JSON.stringify(chunk.output, null, 2)}
        </Box>
      )}
    </StyledToolResultChunk>
  );
};
