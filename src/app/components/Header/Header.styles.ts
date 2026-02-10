import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const StyledHeaderContainer = styled(Box)`
  padding: 30px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .Title {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 600;
  }

  .Subtitle {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    padding: 20px;

    .Title {
      font-size: 24px;
    }
  }
`;
