import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

const HEADER_HEIGHT = 56;

export const StyledDashboardLayoutContainer = styled(Box)`
  display: flex;
  height: 100vh;
  background: #f5f6fa;

  .MainArea {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .AppHeader {
    height: ${HEADER_HEIGHT}px;
    background: white;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
  }

  .ProfileButton {
    color: #555;

    &:hover {
      background: rgba(102, 126, 234, 0.08);
    }
  }

  .PageContent {
    flex: 1;
    overflow: auto;
    padding: 24px;
  }
`;
