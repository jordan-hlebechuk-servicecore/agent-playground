import styled from "styled-components";

export const ChunkBase = styled.div`
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
`;

export const TextDeltaChunk = styled(ChunkBase)`
  background: #f0f0f0;
  border-left: 4px solid #667eea;
`;

export const TextContent = styled.span`
  color: #333;
  word-break: break-word;
  white-space: pre-wrap;
`;

export const ToolCallChunk = styled(ChunkBase)`
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
`;

export const ToolHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ToolIcon = styled.span`
  font-size: 16px;
`;

export const ToolName = styled.span`
  color: #1565c0;
  font-weight: 500;
`;

export const ToolInput = styled.pre`
  background: white;
  border: 1px solid #bbdefb;
  border-radius: 4px;
  padding: 8px;
  margin: 4px 0 0 24px;
  overflow-x: auto;
  color: #333;
  font-size: 12px;
  margin-bottom: 0;
`;

export const ToolResultChunk = styled(ChunkBase)`
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
`;

export const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ResultIcon = styled.span`
  font-size: 16px;
`;

export const ResultLabel = styled.span`
  color: #2e7d32;
  font-weight: 500;
`;

export const ResultOutput = styled.pre`
  background: white;
  border: 1px solid #c8e6c9;
  border-radius: 4px;
  padding: 8px;
  margin: 4px 0 0 24px;
  overflow-x: auto;
  color: #333;
  font-size: 12px;
  margin-bottom: 0;
`;

export const FinishChunk = styled(ChunkBase)`
  background: #f3e5f5;
  border-left: 4px solid #9c27b0;
`;

export const FinishHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FinishIcon = styled.span`
  font-size: 16px;
`;

export const FinishText = styled.span`
  color: #6a1b9a;
  font-weight: 500;
`;

export const ErrorChunk = styled(ChunkBase)`
  background: #ffebee;
  border-left: 4px solid #f44336;
`;

export const ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ErrorIcon = styled.span`
  font-size: 16px;
`;

export const ErrorText = styled.span`
  color: #c62828;
  font-weight: 500;
  word-break: break-word;
`;
