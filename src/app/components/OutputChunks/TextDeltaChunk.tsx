import React from "react";
import type { AgentStreamChunk } from "../types";
import { TextDeltaChunk as StyledTextDeltaChunk, TextContent } from "./OutputChunks.styles";

interface TextDeltaChunkProps {
  chunk: AgentStreamChunk;
}

export const TextDeltaChunk: React.FC<TextDeltaChunkProps> = ({ chunk }) => {
  return (
    <StyledTextDeltaChunk>
      <TextContent>{chunk.text}</TextContent>
    </StyledTextDeltaChunk>
  );
};
