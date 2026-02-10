import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const StyledStopButtonContainer = styled(Box)`
  flex: 0.2;

  .MuiButton-root {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ef5350;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    text-transform: none;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(239, 83, 80, 0.3);
      background: #f44336;
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  .ButtonContent {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: white;
  }
`;
