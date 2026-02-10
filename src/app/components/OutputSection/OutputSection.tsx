import React, { useMemo } from "react";
import type { AgentStreamChunk } from "../types";
import { ChunkRenderer } from "../OutputChunks";
import { useOutputSection } from "./useOutputSection";
import {
  OutputSectionWrapper,
  OutputTitle,
  OutputContainer,
  EmptyState,
} from "./OutputSection.styles";

interface OutputSectionProps {
  output: AgentStreamChunk[];
  isLoading?: boolean;
}

type GroupedChunk = AgentStreamChunk & { groupIndex: number };

export const OutputSection: React.FC<OutputSectionProps> = ({
  output,
  isLoading = false,
}) => {
  const { outputEndRef } = useOutputSection(output);

  const groupedOutput = useMemo((): GroupedChunk[] => {
    const result: GroupedChunk[] = [];
    let groupIndex = 0;
    let accumulatedText = "";

    for (const chunk of output) {
      if (chunk.type === "text-delta") {
        accumulatedText += chunk.text ?? "";
      } else {
        if (accumulatedText) {
          result.push({
            type: "text-delta",
            text: accumulatedText,
            groupIndex: groupIndex++,
          });
          accumulatedText = "";
        }
        result.push({ ...chunk, groupIndex: groupIndex++ });
      }
    }

    if (accumulatedText) {
      result.push({
        type: "text-delta",
        text: accumulatedText,
        groupIndex: groupIndex++,
      });
    }

    return result;
  }, [output]);

  return (
    <OutputSectionWrapper>
      <OutputTitle>Output:</OutputTitle>
      <OutputContainer>
        {output.length === 0 && !isLoading && (
          <EmptyState>
            Submit a prompt to see the agent output here
          </EmptyState>
        )}
        {groupedOutput.map((chunk) => (
          <ChunkRenderer key={chunk.groupIndex} chunk={chunk} index={chunk.groupIndex} />
        ))}
        <div ref={outputEndRef} />
      </OutputContainer>
    </OutputSectionWrapper>
  );
};
