import React from "react";
import { Box, Button } from "@mui/material";
import { StopCircleOutlined } from "@mui/icons-material";
import { StyledStopButtonContainer } from "./StopButton.styles";

interface StopButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const StopButton: React.FC<StopButtonProps> = ({
  disabled = false,
  onClick,
}) => {
  return (
    <StyledStopButtonContainer>
      <Button
        variant="contained"
        color="error"
        fullWidth
        disabled={disabled}
        onClick={onClick}
      >
        <Box className="ButtonContent">
          <StopCircleOutlined sx={{ fontSize: 20 }} />
          Stop
        </Box>
      </Button>
    </StyledStopButtonContainer>
  );
};
