import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const StyledOutputSectionContainer = styled(Box)`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 30px;
  overflow: hidden;
  width: 65%;
  background: white;

  .Title {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .OutputContainer {
    flex: 1;
    background: #f9f9f9;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    padding: 16px;
    overflow-y: auto;
    font-family: "Courier New", monospace;
    font-size: 13px;
    line-height: 1.5;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;

      &:hover {
        background: #555;
      }
    }

    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
  }

  .EmptyState {
    color: #999;
    text-align: center;
    padding: 40px 20px;
    margin: 0;
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;
