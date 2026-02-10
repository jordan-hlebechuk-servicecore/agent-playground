import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const StyledMyTicketsContainer = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;

  .PageHeader {
    margin-bottom: 20px;
  }

  .PageHeaderTop {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .PageTitle {
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .PageSubtitle {
    font-size: 14px;
    color: #777;
    margin-top: 4px;
  }

  .FilterBar {
    margin-top: 16px;
    padding: 12px 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }

  .GridArea {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
`;
