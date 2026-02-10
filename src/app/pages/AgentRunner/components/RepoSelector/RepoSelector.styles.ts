import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const StyledRepoSelectorContainer = styled(Box)`
  width: 100%;
  margin-bottom: 16px;

  .MuiOutlinedInput-root {
    background-color: white;

    &:hover .MuiOutlinedInput-notchedOutline {
      border-color: #667eea;
    }

    &.Mui-focused .MuiOutlinedInput-notchedOutline {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  .MuiChip-root {
    background-color: #667eea;
    color: white;
    font-size: 12px;

    .MuiChip-deleteIcon {
      color: rgba(255, 255, 255, 0.7);

      &:hover {
        color: white;
      }
    }
  }

  .MuiInputLabel-root {
    font-weight: 500;
  }
`;
