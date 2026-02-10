import React from "react";
import { Box } from "@mui/material";
import type { AgentStreamChunk } from "../../../../types";
import { StyledTextDeltaChunk } from "./OutputChunks.styles";

interface TextDeltaChunkProps {
  chunk: AgentStreamChunk;
}

export const TextDeltaChunk: React.FC<TextDeltaChunkProps> = ({ chunk }) => {
  return (
    <StyledTextDeltaChunk>
      <Box className="TextContent" component="span">{chunk.text}</Box>
    </StyledTextDeltaChunk>
  );
};
