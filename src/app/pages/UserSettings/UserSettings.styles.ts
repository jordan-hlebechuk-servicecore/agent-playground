import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const StyledUserSettingsContainer = styled(Box)`
  max-width: 720px;

  .PageHeader {
    margin-bottom: 32px;
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

  .SettingsCard {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 24px;
  }

  .SectionTitle {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  .PlaceholderText {
    font-size: 14px;
    color: #999;
  }
`;
