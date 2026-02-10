import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const chunkBase = `
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

export const StyledTextDeltaChunk = styled(Box)`
  ${chunkBase}
  background: #f0f0f0;
  border-left: 4px solid #667eea;

  .TextContent {
    color: #333;
    word-break: break-word;
    white-space: pre-wrap;
  }
`;

export const StyledToolCallChunk = styled(Box)`
  ${chunkBase}
  background: #e3f2fd;
  border-left: 4px solid #2196f3;

  .ToolHeader {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ToolIcon {
    font-size: 16px;
  }

  .ToolName {
    color: #1565c0;
    font-weight: 500;
  }

  .ToolInput {
    background: white;
    border: 1px solid #bbdefb;
    border-radius: 4px;
    padding: 8px;
    margin: 4px 0 0 24px;
    overflow-x: auto;
    color: #333;
    font-size: 12px;
    margin-bottom: 0;
    font-family: "Courier New", monospace;
    white-space: pre-wrap;
  }
`;

export const StyledToolResultChunk = styled(Box)`
  ${chunkBase}
  background: #e8f5e9;
  border-left: 4px solid #4caf50;

  .ResultHeader {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ResultIcon {
    font-size: 16px;
  }

  .ResultLabel {
    color: #2e7d32;
    font-weight: 500;
  }

  .ResultOutput {
    background: white;
    border: 1px solid #c8e6c9;
    border-radius: 4px;
    padding: 8px;
    margin: 4px 0 0 24px;
    overflow-x: auto;
    color: #333;
    font-size: 12px;
    margin-bottom: 0;
    font-family: "Courier New", monospace;
    white-space: pre-wrap;
  }
`;

export const StyledFinishChunk = styled(Box)`
  ${chunkBase}
  background: #f3e5f5;
  border-left: 4px solid #9c27b0;

  .FinishHeader {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .FinishIcon {
    font-size: 16px;
  }

  .FinishText {
    color: #6a1b9a;
    font-weight: 500;
  }
`;

export const StyledErrorChunk = styled(Box)`
  ${chunkBase}
  background: #ffebee;
  border-left: 4px solid #f44336;

  .ErrorHeader {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ErrorIcon {
    font-size: 16px;
  }

  .ErrorText {
    color: #c62828;
    font-weight: 500;
    word-break: break-word;
  }
`;
