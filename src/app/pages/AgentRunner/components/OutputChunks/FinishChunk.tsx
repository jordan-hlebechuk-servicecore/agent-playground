import React from "react";
import { Box } from "@mui/material";
import type { AgentStreamChunk } from "../../../../types";
import { StyledFinishChunk } from "./OutputChunks.styles";

interface FinishChunkProps {
  chunk: AgentStreamChunk;
}

export const FinishChunk: React.FC<FinishChunkProps> = ({ chunk }) => {
  return (
    <StyledFinishChunk>
      <Box className="FinishHeader">
        <Box className="FinishIcon" component="span">🏁</Box>
        <Box className="FinishText" component="span">Agent finished</Box>
      </Box>
    </StyledFinishChunk>
  );
};
