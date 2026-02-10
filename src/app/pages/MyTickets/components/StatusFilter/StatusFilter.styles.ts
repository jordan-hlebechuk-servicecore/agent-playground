import { styled } from "@mui/material/styles";
import { Box, Chip } from "@mui/material";

export const StyledStatusFilterContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .FilterLabel {
    font-size: 13px;
    font-weight: 600;
    color: #555;
    margin-right: 4px;
  }
`;

export const StyledStatusChip = styled(Chip)<{ excluded: boolean }>`
  font-size: 12px;
  font-weight: 500;
  text-transform: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.15s ease;

  background: ${({ excluded }) =>
    excluded ? "#f5f5f5" : "rgba(102, 126, 234, 0.12)"};
  color: ${({ excluded }) => (excluded ? "#aaa" : "#667eea")};
  border-color: ${({ excluded }) =>
    excluded ? "#e0e0e0" : "rgba(102, 126, 234, 0.3)"};

  .MuiChip-label {
    text-decoration: ${({ excluded }) => (excluded ? "line-through" : "none")};
  }

  &:hover {
    background: ${({ excluded }) =>
      excluded ? "#eee" : "rgba(102, 126, 234, 0.2)"};
    color: ${({ excluded }) => (excluded ? "#888" : "#667eea")};
  }
`;
