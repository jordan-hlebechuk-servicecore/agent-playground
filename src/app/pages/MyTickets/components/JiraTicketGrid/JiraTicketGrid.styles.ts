import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const StyledTicketGridContainer = styled(Box)`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;

  .GridHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .GridHeaderLeft {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .GridTitle {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .TicketCount {
    font-size: 13px;
    color: #999;
  }

  .RefreshButton {
    text-transform: none;
    font-weight: 500;
  }

  .GroupedContent {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .TypeGroup {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .TypeGroupHeader {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .TypeBadge {
    font-size: 13px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .TypeBadge.bug {
    background: #ffebee;
    color: #c62828;
  }

  .TypeBadge.task {
    background: #e3f2fd;
    color: #1565c0;
  }

  .TypeBadge.story {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .TypeBadge.default {
    background: #f5f5f5;
    color: #616161;
  }

  .TypeCount {
    font-size: 12px;
    color: #999;
    font-weight: 500;
  }

  .TicketGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  .LoadingContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 60px 20px;
  }

  .ErrorContainer {
    text-align: center;
    padding: 40px 20px;
    color: #c62828;
  }

  .EmptyState {
    text-align: center;
    padding: 60px 20px;
    color: #999;
  }

  @media (max-width: 768px) {
    padding: 16px;

    .TicketGrid {
      grid-template-columns: 1fr;
    }
  }
`;
