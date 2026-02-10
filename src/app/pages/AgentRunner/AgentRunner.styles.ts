import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const StyledAgentRunnerContainer = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;

  .PageHeader {
    margin-bottom: 24px;
  }

  .PageTitle {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .PageSubtitle {
    font-size: 14px;
    color: #777;
    margin-top: 4px;
  }

  .TicketBanner {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .TicketKey {
    font-weight: 600;
    color: #667eea;
    font-size: 14px;
  }

  .TicketSummary {
    font-size: 13px;
    color: #555;
    flex: 1;
  }

  .ContentArea {
    flex: 1;
    display: flex;
    gap: 0;
    overflow: hidden;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .InputForm {
    padding: 24px;
    background: #fafafa;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    width: 35%;
    overflow-y: auto;
  }

  .ActionButtons {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
    margin-top: 16px;
  }

  @media (max-width: 1024px) {
    .InputForm {
      width: 40%;
    }
  }

  @media (max-width: 768px) {
    .ContentArea {
      flex-direction: column;
    }

    .InputForm {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #eee;
    }
  }
`;
