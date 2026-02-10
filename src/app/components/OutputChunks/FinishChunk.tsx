import React from "react";
import type { AgentStreamChunk } from "../types";
import {
  FinishChunk as StyledFinishChunk,
  FinishHeader,
  FinishIcon,
  FinishText,
} from "./OutputChunks.styles";

interface FinishChunkProps {
  chunk: AgentStreamChunk;
}

export const FinishChunk: React.FC<FinishChunkProps> = ({ chunk }) => {
  return (
    <StyledFinishChunk>
      <FinishHeader>
        <FinishIcon>🏁</FinishIcon>
        <FinishText>Agent finished</FinishText>
      </FinishHeader>
    </StyledFinishChunk>
  );
};
