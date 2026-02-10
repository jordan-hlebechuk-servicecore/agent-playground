import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const StyledAppContainer = styled(Box)`
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

  .Wrapper {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 1400px;
    height: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .MainContent {
    display: flex;
    flex: 1;
    overflow: hidden;
    gap: 0;
  }

  .InputForm {
    padding: 30px;
    background: #fafafa;
    border-right: 2px solid #f0f0f0;
    display: flex;
    flex-direction: column;
    width: 35%;
    overflow-y: auto;
  }

  @media (max-width: 1024px) {
    .Wrapper {
      max-width: 95vw;
    }

    .InputForm {
      width: 40%;
    }
  }

  @media (max-width: 768px) {
    padding: 10px;

    .Wrapper {
      max-height: 100%;
    }

    .MainContent {
      flex-direction: column;
    }

    .InputForm {
      padding: 20px;
      width: 100%;
      border-right: none;
      border-bottom: 2px solid #f0f0f0;
    }
  }
`;
