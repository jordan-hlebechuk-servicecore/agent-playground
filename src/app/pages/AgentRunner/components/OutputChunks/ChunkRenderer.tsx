import React from "react";
import type { AgentStreamChunk } from "../../../../types";
import { TextDeltaChunk } from "./TextDeltaChunk";
import { ToolCallChunk } from "./ToolCallChunk";
import { ToolResultChunk } from "./ToolResultChunk";
import { FinishChunk } from "./FinishChunk";
import { ErrorChunk } from "./ErrorChunk";

interface ChunkRendererProps {
  chunk: AgentStreamChunk;
  index: number;
}

export const ChunkRenderer: React.FC<ChunkRendererProps> = ({ chunk, index }) => {
  switch (chunk.type) {
    case "text-delta":
      return <TextDeltaChunk key={index} chunk={chunk} />;
    case "tool-call":
      return <ToolCallChunk key={index} chunk={chunk} />;
    case "tool-result":
      return <ToolResultChunk key={index} chunk={chunk} />;
    case "finish":
      return <FinishChunk key={index} chunk={chunk} />;
    case "error":
      return <ErrorChunk key={index} chunk={chunk} />;
    default:
      return null;
  }
};
