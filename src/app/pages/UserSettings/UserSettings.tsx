import React from "react";
import { Box, Typography } from "@mui/material";
import { StyledUserSettingsContainer } from "./UserSettings.styles";

export const UserSettings: React.FC = () => {
  return (
    <StyledUserSettingsContainer>
      <Box className="PageHeader">
        <Typography className="PageTitle">User Settings</Typography>
        <Typography className="PageSubtitle">
          Manage your account preferences
        </Typography>
      </Box>
      <Box className="SettingsCard">
        <Typography className="SectionTitle">Profile</Typography>
        <Typography className="PlaceholderText">
          User settings will be available here soon.
        </Typography>
      </Box>
    </StyledUserSettingsContainer>
  );
};
