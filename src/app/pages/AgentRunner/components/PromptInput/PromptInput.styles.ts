import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const StyledPromptInputContainer = styled(Box)`
  width: 100%;

  .MuiOutlinedInput-root {
    background-color: white;
    font-family: inherit;

    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: #667eea;
    }

    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  .MuiOutlinedInput-root.Mui-disabled {
    background-color: #f5f5f5;
    opacity: 0.6;
  }

  .MuiInputLabel-root {
    font-weight: 500;
  }
`;
