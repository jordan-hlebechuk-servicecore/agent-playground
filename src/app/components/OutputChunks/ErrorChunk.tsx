import React from "react";
import { Box } from "@mui/material";
import type { AgentStreamChunk } from "../types";
import { StyledErrorChunk } from "./OutputChunks.styles";

interface ErrorChunkProps {
  chunk: AgentStreamChunk;
}

export const ErrorChunk: React.FC<ErrorChunkProps> = ({ chunk }) => {
  return (
    <StyledErrorChunk>
      <Box className="ErrorHeader">
        <Box className="ErrorIcon" component="span">❌</Box>
        <Box className="ErrorText" component="span">{chunk.message}</Box>
      </Box>
    </StyledErrorChunk>
  );
};
