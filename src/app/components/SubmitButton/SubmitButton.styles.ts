import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const StyledSubmitButtonContainer = styled(Box)`
  width: 100%;
  margin-top: 16px;

  .MuiButton-root {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    text-transform: none;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
