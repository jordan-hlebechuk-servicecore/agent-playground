import React from "react";
import type { AgentStreamChunk } from "../types";
import {
  ErrorChunk as StyledErrorChunk,
  ErrorHeader,
  ErrorIcon,
  ErrorText,
} from "./OutputChunks.styles";

interface ErrorChunkProps {
  chunk: AgentStreamChunk;
}

export const ErrorChunk: React.FC<ErrorChunkProps> = ({ chunk }) => {
  return (
    <StyledErrorChunk>
      <ErrorHeader>
        <ErrorIcon>❌</ErrorIcon>
        <ErrorText>{chunk.message}</ErrorText>
      </ErrorHeader>
    </StyledErrorChunk>
  );
};
